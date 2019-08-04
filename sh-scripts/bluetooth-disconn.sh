#!/usr/bin/expect -f

set prompt "#"
set address [lindex $argv 0]

spawn sudo bluetoothctl -a
expect -re $prompt
send "remove $address\r"
sleep 2
send "quit\r"
expect eof