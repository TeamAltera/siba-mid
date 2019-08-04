#!/bin/sh

apt-get update -y && apt-get install -y hostapd dnsmasq udhcpd net-tools sudo git mysql-client bluetooth bluez libbluetooth-dev libudev-dev expect build-essential

npm install amqplib
npm install shelljs
npm i bluetooth-serial-port

npm install -g sequelize-auto
npm install -g mysql

npm install