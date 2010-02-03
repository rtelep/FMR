import json
from copy import copy

import couchdb

# This script takes a json dump from legacy FMR and inserts the data into couchdb.

fn = 'data.json'
data = json.load(open(fn))

server = couchdb.Server('http://localhost:5984/')
try:
    db = server.create('fmr')
except:
    db = server['fmr']

# Users
#######

pk_to_user = {}
for item in data:
    if item['model'] == u'auth.user':
        pk_to_user[item['pk']] = item['fields']['username']
        print pk_to_user[item['pk']]

# Posts
########

def get_body(d):
    """ Lose the markdown, combine the body, html, and link
    """
    s = d.get('body')
    s += '\r\n'
    try:
        s += d.get('html')
        s += '\r\n'
    except TypeError:
        pass
    try:
        s += d.get('link')
    except TypeError:
        pass
    
    return s

pk_to_uuid = {}

for item in data:
    if item['model'] == u'gentes.part':
        old = item['fields']
        new = {
                'author': pk_to_user[item['fields']['owner']]
            ,   'title': old.get('title')
            ,   'path': []  #No parents
            ,   'body': get_body(old).replace('\r\n', '<br/>')
            ,   'ts_created': old.get('ts_created').replace('-','/')
            ,   'ts_modified': old.get('ts_modified').replace('-','/')
        }
        uuid = db.create(new)
        pk_to_uuid[item['pk']] = uuid
        print 'POST', new

# Comments
##########

for item in data:
    if item['model'] == u'gentes.comment':
        parent = pk_to_uuid[item['fields']['regarding']]
        old = item['fields']
        author = pk_to_user[item['fields']['author']]
        new = {
                'path': [parent]
            ,   'author': author
            ,   'title': ''
            ,   'body': old.get('comment').replace('\r\n', '<br/>')
            ,   'ts_created': old.get('ts_created').replace('-','/')
            ,   'ts_modified': old.get('ts_modified').replace('-','/')
        }
        uuid = db.create(new)
        print 'COMMENT', new


