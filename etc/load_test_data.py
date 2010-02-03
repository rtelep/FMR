import json

import couchdb

fn = 'etc/test_data.json'
data = json.load(open(fn))

server = couchdb.Server('http://localhost:5984/')
try:
    db = server.create('fmr')
except:
    db = server['fmr']

for doc in data:
    db[doc['_id']] = doc