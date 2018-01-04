#! /usr/bin/env python

import os

import SimpleHTTPServer
import SocketServer

print(os.getcwd())
os.chdir('../html')
print(os.getcwd())

PORT = 8000

Handler = SimpleHTTPServer.SimpleHTTPRequestHandler

httpd = SocketServer.TCPServer(("", PORT), Handler)

print "serving at port", PORT
httpd.serve_forever()

