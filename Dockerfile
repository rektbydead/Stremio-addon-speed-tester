FROM docker.io/node:20-alpine

WORKDIR /app/

COPY package*.json .

RUN npm i

COPY ./src/ .

CMD ["npx", "tsx", "app.ts"]
