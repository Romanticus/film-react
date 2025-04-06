FROM node:18 AS build
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm i --legacy-peer-deps
COPY . .
RUN npm run build

FROM node:18
WORKDIR /usr/src/app
COPY --from=build /usr/src/app/dist ./dist
COPY package*.json ./
# COPY ./public /usr/src/app/public
RUN npm install --only=production
EXPOSE 3000
CMD ["node", "dist/main.js"]