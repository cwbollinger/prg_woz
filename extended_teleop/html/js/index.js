import EventEmitter2 from 'eventemitter2'
window.EventEmitter2 = EventEmitter2.EventEmitter2
import SPEECH from './speech.js';
import MOTION from './motion.js';
import GAMEPAD_TELEOP from './gamepad_teleop.js';
import init from './customize.js';

document.addEventListener("DOMContentLoaded", (event) => {
  init();
});
