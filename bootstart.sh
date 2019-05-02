#!/bin/sh

NRFGIT="https://github.com/nRF24"

apt-get update -y && apt-get install -y hostapd dnsmasq udhcpd net-tools sudo git mysql-client

git clone "$NRFGIT/RF24.git"
git clone "$NRFGIT/RF24Network.git" RF24Network
git clone "$NRFGIT/RF24Mesh.git" RF24Mesh
git clone "$NRFGIT/RF24Gateway.git" RF24Gateway

>&2 echo "build RF24 package"
cd RF24 && ./configure --extra-cflags=-marm --prefix=/usr/local --driver=SPIDEV && make && sudo make install && cd -

>&2 echo "build RF24Network package"
cd RF24Network && make && sudo make install && cd -

>&2 echo "build RF24Mesh package"
cd RF24Mesh && make && sudo make install && cd -

>&2 echo "build RF24Gateway package"
cd RF24Gateway && make && sudo make install && cd -

# prevent wpa_supplicant from starting on boot
#sudo systemctl mask wpa_supplicant.service

# rename wpa_supplicant on the host to ensure that it is not
# used.
#sudo mv /sbin/wpa_supplicant /sbin/no_wpa_supplicant

# kill any running processes named wpa_supplicant
#sudo pkill wpa_supplicant

npm install && yes n | npm i nrf24
