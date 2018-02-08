#! /usr/bin/env python

import sys
import signal

import os
import re
import json
import atexit

import sqlite3
from flask import Flask, g, send_from_directory

from BaseHTTPServer import BaseHTTPRequestHandler,HTTPServer
from SocketServer import ThreadingMixIn
import threading
import cgi

app = Flask(__name__, instance_path=os.path.abspath('../html'))


class LocalData(object):
    records = {}

    @staticmethod
    def update_record(key, value):
        LocalData.records[key] = value

    @staticmethod
    def has_record(key):
        return LocalData.records.has_key(key)

    @staticmethod
    def save_records(fileName):
        with open(fileName, 'w') as f:
            f.write(json.dumps(LocalData.records, sort_keys=True, indent=4, separators=(',', ': ')))

    @staticmethod
    def load_records(fileName):
        with open(fileName) as f:
            LocalData.records = json.loads(f.read())


class HTTPRequestHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        if re.search('/api/v1/*', self.path):
            ctype, pdict = cgi.parse_header(self.headers.getheader('content-type'))
            if ctype == 'application/json':
                length = int(self.headers.getheader('content-length'))
                data = cgi.parse_qs(self.rfile.read(length), keep_blank_values=1)
                recordID = self.path.split('/')[-1]
                print data.keys()[0]
                LocalData.update_record(recordID, json.loads(data.keys()[0]))
                print "record %s is added successfully" % recordID
            else:
                data = {}
                self.send_response(200)
                self.end_headers()
        else:
            self.send_response(403)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            return

    def do_GET(self):
        if re.search('/api/v1/*', self.path):
            recordID = self.path.split('/')[-1]
            if LocalData.has_record(recordID):
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(LocalData.records[recordID]))
            else:
                self.send_response(400, 'Bad Request: record does not exist')
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
        else:
            print self.path
            path = self.path[1:] # strip leading slash
            if os.path.exists(path) and path.lower().endswith(('.html', '.js', '.css')):
                self.send_response(200)
                if path.lower().endswith('.html'):
                    self.send_header('Content-type', 'text/html')
                elif path.lower().endswith('.js'):
                    self.send_header('Content-type', 'application/javascript')
                elif path.lower().endswith('.css'):
                    self.send_header('Content-type', 'text/css')
                self.end_headers()
                with open(path) as f:
                    self.wfile.write(f.read())
            else:
                self.send_response(403)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
            return


def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
    return db


@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

@app.route('/index.html')
def root():
    return send_from_directory(os.getcwd(), 'index.html')

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    return send_from_directory(os.getcwd(), path)

'''
@app.route('/index.html')
def root():
    return 'this is a test'
    #return send_from_directory('.', path)

@app.route('/<path:path>')
def send_root(path):
    return path
    #return send_from_directory('.', path)

@app.route('/dist/<path:path>')
def send_dist(path):
    return path
    #return send_from_directory('dist', path)
'''

if __name__=='__main__':
    os.chdir('../html')
    DATABASE =  'database.db'
    print app.url_map
    app.run(debug=True, host="0.0.0.0", port=8000)
