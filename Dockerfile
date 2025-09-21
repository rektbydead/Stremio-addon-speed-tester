FROM docker.io/node:20-alpine

WORKDIR /app/

COPY package*.json /app/

RUN npm i

COPY ./src/ /app/

CMD ["npx", "tsx", "app.ts"]
