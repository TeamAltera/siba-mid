#!/usr/bin/expect -f

set prompt "#"
set address [lindex $argv 0]

spawn bluetoothctl
expect $prompt

send "power on\r"
sleep 1
send "discoverable on\r"
sleep 1

send "remove $address\r"
expect $prompt
send "agent on\r"
expect "Agent registered"
send "default-agent\r"
expect "Agent registered"
send "scan on\r"
expect {
    "Device $address" 
    {
        send "scan off\r"
        expect "Discovery stopped"
        send "pair $address\r"
        expect {
            "Enter PIN code"
            {
                send "1234\r"
                expect "Pairing successful"
                send "trust $address\r"
                expect "trust succeeded"
                send "quit\r"
                #puts "\rPAIR-SUCCESS\r"
                exit 0
            }
        }
        send "quit\r"
        #puts "\rERR-PIN-TIMEOUT\r"
        exit 1
    }
}
send "quit\r"
#puts "\rERR-DEVICE-NOT-FOUND\r"
exit 1