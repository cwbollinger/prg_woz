#!/usr/bin/env node

const util = require('util');
const stream = require('stream');
const Readable = stream.Readable;
const Base64Buffer = require('base64-arraybuffer');
const server = require('http').createServer();

/*
const lame = require('lame');

const mic = require('mic');
const micInstance = mic({
  device:'hw:0,0',
  rate:'44100',
  channels:'2',
  debug: true
});

const micInputStream = micInstance.getAudioStream();
const encoder = new lame.Encoder({
  // input
  channels: 2,        // 2 channels (left and right)
  bitDepth: 16,       // 16-bit samples
  sampleRate: 44100,  // 44,100 Hz sample rate
  // output
  bitRate: 128,
  outSampleRate: 22050,
  mode: lame.STEREO // STEREO (default), JOINTSTEREO, DUALCHANNEL or MONO
});
micInstance.start();
*/

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
  /*
  audioContext.decodeAudioData(data, function(buffer) {
    let source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);

    source.start(startTime);
    startTime += buffer.duration;
  });
  */
});

server.on('request', (req, res) => {
  console.log('request arrived.');
  audioStream.pipe(res);
  //micInputStream.pipe(encoder);
  //encoder.pipe(res);
});

server.listen(8001);
