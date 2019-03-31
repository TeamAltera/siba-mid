#!/bin/sh

set -e

MYSQL_HOST="127.0.0.1"
MYSQL_PORT="3306"
MYSQL_USERNAME="user"
MYSQL_PASSWORD="user"

#looping max count
maxcounter=45

#looping check variable
couter=1

while ! mysql --host="$MYSQL_HOST" --port="$MYSQL_PORT" --user="$MYSQL_USERNAME" --password="$MYSQL_PASSWORD" -e "show databases;" > /dev/null
2>&1;
do
  >&2 echo "mariadb is unavailable - SLEEPING"
  sleep 1
  counter=`expr $counter + 1`
  if [ $counter -gt $maxcounter ]; then
    >&2 echo "waiting maraidb FAILED"
done

>&2 echo "mariadb is up - EXECUTING COMMAND"
exec $cmd