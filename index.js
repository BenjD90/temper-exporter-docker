const getTemperDevices = require('temper-usb').getTemperDevices;
const _ = require('lodash');
const client = require('prom-client');
const { createServer } = require('@promster/server');
const { N9Log } = require('@neo9/n9-node-log');
const logger = new N9Log('temper');

const median = (array) => {
  array = array.sort();
  if (array.length % 2 === 0) { // array with even number elements
    return (array[array.length/2] + array[(array.length / 2) - 1]) / 2;
  }
  else {
    return array[(array.length - 1) / 2]; // array with odd number elements
  }
};
const gaugeAvg = new client.Gauge({ name: 'temper_temperature_average_celsius', help: 'Average mesured' });
const gaugeMin = new client.Gauge({ name: 'temper_temperature_min_celsius', help: 'Minimum mesured' });
const gaugeMax = new client.Gauge({ name: 'temper_temperature_max_celsius', help: 'Maximum mesured' });
const gaugeMed = new client.Gauge({ name: 'temper_temperature_median_celsius', help: 'Median mesured' });
const nbMeasure = Number.parseInt(process.env.NB_MEASURE) || 100;

const refreshTemp = async () => {
  const devices = await getTemperDevices();
  if(!_.isEmpty(devices)) {
    const td = devices[0];
    const temps = [];
    for(let i = 0; i < Math.max(nbMeasure, 1); i++) {
      const temp = await td.getTemperature();
      temps.push(temp.data[process.env.TEMP_UNIT || 0] + process.env.TEMP_OFFSET);
    }
    const avg = _.sum(temps)/_.size(temps);
    const min = _.min(temps);
    const max = _.max(temps);
    const med = median(temps);

    gaugeAvg.set(avg);
    gaugeMin.set(min);
    gaugeMax.set(max);
    gaugeMed.set(med);
    if(!process.env.DISABLE_TRACE) {
      logger.info(`Avg : ${avg} °C Min : ${min} °C Max : ${max} °C Median : ${med} °C`);
    }
  } else {
    logger.warn('Temper device not found');
  }
};


(async () => {
  const port = Number.parseInt(process.env.PORT) || 9100;
  const refreshRate = Number.parseInt(process.env.REFRESH_RATE) || 5000;
 
  client.collectDefaultMetrics({ timeout: refreshRate });
  await refreshTemp();
  setInterval(() => refreshTemp(), refreshRate);  
  
  createServer({ port }).then(server => {
    logger.info(`@promster/server started on port ${port}.`)
  });
})().catch(logger.error);