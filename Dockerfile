FROM docker.io/node:20

WORKDIR /app/

COPY package*.json tsconfig.json ./

RUN npm i

COPY . .

CMD ["npx", "tsx", "./src/app.ts"]
