FROM node:8

# Create app directory
WORKDIR /opt/app

# Install app dependencies
COPY package.json package-lock.json ./

RUN npm install

# Bundle app source
COPY . .

EXPOSE 8081
CMD [ "npm", "start" ]
