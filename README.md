# A Temper exporter for Prometheus

## Supported TemperUSB Devices
| Product | Id | Firmware | Temp | Hum | Notes |
| ---- | ---- | ---- | ---- | ---- | ---- |
| TEMPer | 0c45:7401 | TEMPerF1.4 | I | | Metal |

Use [temper-usb](https://github.com/mlucool/temper-usb#readme) to read device.
Use [prom-client](https://github.com/siimon/prom-client) and [@promster/server](https://github.com/tdeekens/promster#-promster---measure-metrics-from-hapi-express-marblejs-or-fastify-servers-with-prometheus-) to expose metrics

2 images building available : alpine for x64/x86 and alpine for arm

To use, share the device to the docker :
```sh
docker run -it --device=/dev/bus/usb/003/008 -p 9100:9100 temper-sh
```

Configuration with environment variables :
- NB_MEASURE : number of measure for one measure (default 100)
- DISABLE_TRACE : if no empty, do not log every measure (default `empty`)
- PORT : HTTP port for metrics (default to 9100)
- REFRESH_RATE : Duration in ms to wait between every measure (default to 5000 ms)
- TEMP_UNIT : 0 to Celcius, 1 to Fahrenheit (default to 0, Celcius)
- TEMP_OFFSET : Offset to add or remove to measure (default to 0)
