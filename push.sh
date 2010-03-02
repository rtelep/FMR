#!/bin/sh
cd fmr
couchapp push . http://rtelep:foobar@localhost:5984/a/
cd ../auth
couchapp push . http://rtelep:foobar@localhost:5984/auth/
cd ..

