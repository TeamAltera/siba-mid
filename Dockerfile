FROM node:10
MAINTAINER sencom1028@gmail.com

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

#explicit set work dir
WORKDIR /home/node/app

#copy package.json && package-lock.json
COPY package*.json ./

#switch user to node
USER node

RUN npm install

#application code to the application dir on the container
COPY --chown=node:node . .

EXPOSE 3000
CMD ["npm","start"]
