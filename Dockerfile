FROM arm32v7/node:8
MAINTAINER sencom1028@gmail.com

#&& chown -R node:node /home/node/app

#explicit set work dir
RUN mkdir -p /home/node/app/node_modules
WORKDIR /home/node/app


#copy package.json && package-lock.json
COPY package*.json ./

#switch user to node
USER root

#install package, lib when boot start
ADD ./bootstart.sh /bootstart.sh
RUN chmod +x /bootstart.sh
RUN /bootstart.sh

COPY --chown=node:node . .

EXPOSE 3000

#mariadb healthcheck
ADD ./wait-for.sh /wait-for.sh
RUN chmod +x /wait-for.sh

CMD /wait-for.sh && npm start
