#!/bin/sh

set -e

shift
cmd="$@"

MYSQL_HOST="127.0.0.1"
MYSQL_PORT="3306"
MYSQL_USERNAME="user"
MYSQL_PASSWORD="user"

until `/usr/bin/mysql --host=$MYSQL_HOST --port=$MYSQL_PORT --user=$MYSQL_USERNAME --password=$MYSQL_PASSWORD -e "show databases;" ` != ""; do
  >&2 echo "mariadb is unavailable - sleeping"
  sleep 1
done

>&2 echo "mariadb is up - executing command"
exec $cmd