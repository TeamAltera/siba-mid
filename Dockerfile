FROM arm32v7/node:8
MAINTAINER sencom1028@gmail.com
ENV NRFGIT https://github.com/nRF24

#&& chown -R node:node /home/node/app

#explicit set work dir
RUN mkdir -p /home/node/app/node_modules
WORKDIR /home/node/app


#copy package.json && package-lock.json
COPY package*.json ./

#switch user to node
USER root

#install udhcpd, hostapd, dnsmasq
RUN apt-get update -y && apt-get install -y hostapd dnsmasq udhcpd net-tools sudo git

RUN git clone $NRFGIT/RF24.git
RUN cd RF24 && ./configure --extra-cflags=-marm --prefix=/usr/local --driver=SPIDEV && make && sudo make install
RUN git clone $NRFGIT/RF24Network.git RF24Network
RUN cd RF24Network && make && sudo make install
RUN git clone $NRFGIT/RF24Mesh.git RF24Mesh
RUN cd RF24Mesh && make && sudo make install
RUN git clone $NRFGIT/RF24Gateway.git RF24Gateway
RUN cd RF24Gateway && make && sudo make install

RUN npm install
RUN yes n | npm i nrf24

COPY --chown=node:node . .

EXPOSE 3000
CMD ["npm","start"]
