#!/bin/sh
curl -X DELETE http://rtelep:foobar@localhost:5984/a
curl -X DELETE http://rtelep:foobar@localhost:5984/auth
./push.sh
