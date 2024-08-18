FROM node:20.16.0

WORKDIR /usr/src/one-mile

COPY package*.json .
RUN npm install

COPY dist ./dist/

CMD npm start