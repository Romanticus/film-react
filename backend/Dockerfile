FROM node:20

WORKDIR /app

COPY backend/ /app/

RUN npm install --legacy-peer-deps

RUN npm run build

EXPOSE 3000

CMD ["node", "dist/main.js"]