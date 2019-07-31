#!/bin/sh

apt-get update -y && apt-get install -y hostapd dnsmasq udhcpd net-tools sudo git mysql-client

npm install amqplib
npm install -g sequelize-auto
npm install -g mysql

npm install