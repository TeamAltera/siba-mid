#!/usr/bin/expect -f

set prompt "#"
set address [lindex $argv 0]

spawn bluetoothctl
expect -re $prompt
send "remove $address\r"
sleep 1
expect -re $prompt
send "agent on\r"
sleep 2
send "default-agent\r"
sleep 2
send "scan on\r"
send_user "\nscanning...\r"
sleep 10
send_user "\ndone scanning...\r"
send "scan off\r"
expect "Controller"
send "trust $address\r"
sleep 2
send "pair $address\r"
sleep 2
send "1234\r"
send_user "\nShould be paired now.\r"
sleep 2
send "quit\r"
expect eof