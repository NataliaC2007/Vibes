
FROM node:18

WORKDIR /app

COPY ./server/package.json ./server/package-lock.json /app/
COPY ./server /app/

RUN npm install

EXPOSE 4000

CMD ["node", "server.js"]
