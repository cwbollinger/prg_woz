#!/usr/bin/env node

const util = require('util');
const stream = require('stream');
const Readable = stream.Readable;
const Base64Buffer = require('base64-arraybuffer');
const server = require('http').createServer();

// Connecting to ROS 
const ROSLIB = require('roslib');
console.log(ROSLIB);

var ros = new ROSLIB.Ros({
    url : 'ws://localhost:9090'
});

ros.on('connection', function() {
console.log('Connected to websocket server.');
});

ros.on('error', function(error) {
console.log('Error connecting to websocket server: ', error);
});

ros.on('close', function() {
console.log('Connection to websocket server closed.');
});

let audioListener = new ROSLIB.Topic({
  ros : ros,
  name : '/audio',
  messageType : 'audio_common_msgs/AudioData'
});

const AudioStream = function() {
  Readable.call(this, {});
}
util.inherits(AudioStream, stream.Readable);
AudioStream.prototype._read = function(){};

let audioStream = new AudioStream();

audioListener.subscribe(function(message) {
  const data = new Uint8Array(Base64Buffer.decode(message.data));
  audioStream.push(data);
});

server.on('request', (req, res) => {
  console.log('request arrived.');
  audioStream = new AudioStream();
  audioStream.pipe(res);
});

server.listen(8001);
