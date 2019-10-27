FROM node:12.13.0-alpine

RUN apk add --update python eudev-dev make g++ linux-headers

WORKDIR /home/app

COPY ./ ./
RUN yarn install

CMD ["node", "."]