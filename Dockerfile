FROM node:20-alpine
WORKDIR /app
COPY package.json ./
RUN npm i --no-audit --no-fund --silent
COPY index.js ./
CMD ["node", "index.js"]
