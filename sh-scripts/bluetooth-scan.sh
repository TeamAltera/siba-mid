#!/usr/bin/expect -f

set prompt "#"

spawn bluetoothctl
expect -re $prompt
send "scan on\r"
send_user "\nscanning...\r"
sleep 10
send_user "\ndone scanning...\r"
send "scan off\r"
expect "Controller"
sleep 1
send "quit\r"
expect eof