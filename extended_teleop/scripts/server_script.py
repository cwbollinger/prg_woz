#! /usr/bin/env python

import sys
import signal

import os
import re
import json
import atexit

from BaseHTTPServer import BaseHTTPRequestHandler,HTTPServer
from SocketServer import ThreadingMixIn
import threading
import cgi

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
        if re.search('/api/v1/mapping/*', self.path):
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
        if re.search('/api/v1/mapping/*', self.path):
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
            if os.path.exists(path) and path.lower().endswith(('.html', '.js', '')):
                self.send_response(200)
                if path.lower().endswith('.html'):
                    self.send_header('Content-type', 'text/html')
                elif path.lower().endswith('.js'):
                    self.send_header('Content-type', 'application/javascript')
                else: # root
                    self.send_header('Content-type', 'text/html')
                    path = 'index.html'
                self.end_headers()
                with open(path) as f:
                    self.wfile.write(f.read())
            else:
                self.send_response(403)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
            return

class ThreadedHTTPServer(ThreadingMixIn, HTTPServer):
    allow_reuse_address = True

    def shutdown(self):
        self.socket.close()
        HTTPServer.shutdown(self)

class SimpleHttpServer():
    def __init__(self, ip, port):
        self.server = ThreadedHTTPServer((ip,port), HTTPRequestHandler)

    def start(self):
        self.server_thread = threading.Thread(target=self.server.serve_forever)
        self.server_thread.daemon = True
        self.server_thread.start()

    def waitForThread(self):
        while self.server_thread.isAlive(): # hack to allow signals to propagate
            self.server_thread.join(5.0)

    def addRecord(self, recordID, jsonEncodedRecord):
        LocalData.records[recordID] = jsonEncodedRecord

    def stop(self):
        self.server.shutdown()
        self.waitForThread()

if __name__=='__main__':
    os.chdir('../html')
    if os.path.exists('buttonMapping.json'):
        LocalData.load_records('buttonMapping.json')

    def exit_func():
        print 'saving data'
        LocalData.save_records('buttonMapping.json')

    atexit.register(exit_func)

    def signal_handler(signal, frame):
        server.stop()

    signal.signal(signal.SIGINT, signal_handler)

    server = SimpleHttpServer('0.0.0.0', 8000)
    print 'HTTP Server Running...........'
    server.start()
    server.waitForThread()

