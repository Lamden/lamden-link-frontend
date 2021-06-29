FROM node:14-alpine

RUN mkdir -p /usr/src/svelte
WORKDIR /usr/src/svelte

COPY rollup.config.js /usr/src/svelte/
COPY package*.json /usr/src/svelte/

RUN npm install

COPY . /usr/src/svelte/

RUN npm run-script build

EXPOSE 5000
ENV HOST=0.0.0.0

CMD [ "npm", "start" ]