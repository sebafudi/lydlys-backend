# build stage
FROM node:latest as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# production stage
FROM node:latest as production-stage
WORKDIR /app
COPY --from=build-stage /app/dist /app
COPY prisma /app/prisma
COPY package*.json ./
RUN npm install --omit=dev
RUN npx prisma generate
EXPOSE 3000
CMD ["node", "main.js"]

