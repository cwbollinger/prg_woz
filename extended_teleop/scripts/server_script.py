#! /usr/bin/env python

import sys
import signal

import os
import json

import sqlite3
from flask import Flask, g, send_from_directory, request

app = Flask(__name__, instance_path=os.path.abspath('../html'))


def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d


def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
        db.row_factory = dict_factory
    return db


def query_db(query, args=(), one=False):
    cur = get_db().execute(query, args)
    rv = cur.fetchall()
    cur.close()
    return (rv[0] if rv else None) if one else rv


def update_db(query, args=()):
    db = get_db()
    db.execute(query, args)
    db.commit()


@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()


@app.route('/api/v1/chatHistory', methods=['GET', 'POST'])
def chat():
    if request.method == 'POST':
        new_text = request.json
        print new_text
        update_db("INSERT INTO chatHistory VALUES (datetime('now'), ?) ;", (new_text,) )
        return ''
    else:
        return json.dumps(query_db('select * from chatHistory')[-100:])

@app.route('/api/v1/controllerMapping', methods=['GET'])
def controller_mapping():
    result = {}
    for elem in query_db('select * from controllerMapping'):
        result[elem['buttonId']] = elem['buttonName']
    return json.dumps(result)


@app.route('/api/v1/actionMapping', methods=['GET', 'POST'])
def action_mapping():
    if request.method == 'POST':
        new_mapping = request.json
        for button_name in new_mapping.keys():
            command = new_mapping[button_name]['command']
            btn_type = new_mapping[button_name]['type']
            update_db('UPDATE actionMapping SET command = ? , type = ? WHERE buttonName = ? ;', (command, btn_type, button_name))
        return ''
    else:
        result = {}
        for elem in query_db('select * from actionMapping'):
            result[elem['buttonName']] = elem
        return json.dumps(result)


@app.route('/', defaults={'path': 'index.html'})
@app.route('/<path:path>')
def catch_all(path):
    return send_from_directory(os.getcwd(), path)


if __name__=='__main__':
    os.chdir('../html')
    DATABASE =  'database.db'
    app.run(debug=True, host="0.0.0.0", port=8000)
