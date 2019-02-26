FROM arm32v7/node:10
MAINTAINER sencom1028@gmail.com

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

#explicit set work dir
WORKDIR /home/node/app

#copy package.json && package-lock.json
COPY package*.json ./

#switch user to node
USER root

#install udhcpd, hostapd, dnsmasq
RUN apt-get update -y && apt-get upgrade -y && apt-get install -y hostapd dnsmasq udhcpd net-tools

RUN npm install

#application code to the application dir on the container
COPY --chown=node:node . .

EXPOSE 3000
CMD ["npm","start"]
