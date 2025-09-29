Use Node.js LTS image
FROM node:18

Set working directory
WORKDIR /usr/src/app

Copy package.json and package-lock.json (if exists)
COPY package*.json ./

Install dependencies
RUN npm install

Copy all source code
COPY . .

Start the bot
CMD ["node", "index.js"]