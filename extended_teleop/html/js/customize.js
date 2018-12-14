import SPEECH from './speech.js';
import MOTION from './motion.js';
import GAMEPADTELEOP from './gamepad_teleop.js';
import RosClient from 'roslibjs-client';
import { ChatHistory } from './chat.js'
import { ButtonIndicator } from './buttons.js'
import { initMap } from './map.js'

// attach these to the global namespace so we can get them by name (weird but works)
window.SPEECH = SPEECH;
window.MOTION = MOTION;

class RecordButton {
  constructor(btnElem, participantElem, sessionElem) {
    this.recording = false;
    this.recordBtn = btnElem;
    this.recordName = participantElem;
    this.recordSession = sessionElem;
    this.recordBtn.click(() => {
      this.toggleRecord();
    });
  }

  start_recording(filename) {
    this.recording = true;
    rosClient.topic.publish('/rosbagctrl/named', 'std_msgs/String', {data:`${filename}:start`});
  }

  stop_recording(filename) {
    this.recording = false;
    rosClient.topic.publish('/rosbagctrl/named', 'std_msgs/String', {data:`${filename}:stop`});
  }

  toggleRecord() {
    const recName = this.recordName.val();
    const session = this.recordSession.val();
    const bagName = `${recName}_${session}.bag`;
    if(this.recording) {
      this.chatHistory.addText('SESSION RECORDING ENDED');
      this.stop_recording(bagName);
      this.recordName.prop('disabled', false);
      this.recordSession.prop('disabled', false);
      this.recordBtn.text('Start Recording');
      this.recordBtn.addClass('success');
      this.recordBtn.removeClass('alert');
    } else {
      this.chatHistory.addText('SESSION RECORDING STARTED');
      this.recordName.prop('disabled', true);
      this.recordSession.prop('disabled', true);
      this.start_recording(bagName);
      this.recordBtn.text('Stop Recording');
      this.recordBtn.addClass('alert');
      this.recordBtn.removeClass('success');
    }
  }
}


const CAMERA_TOPIC='/camera/image_raw';
const CAMERA_QUALITY='7';

let teleop = null;
let gamepadButtonHandler = null; //TODO: this is horrible, reorder code

let CONTROLLER_MAPPING = null;
let ACTION_MAPPING = null;


export function saveButtonActions() {
  console.log('saving the controller mapping');
  $.ajax({
    type: "post",
    url: "/api/v1/actionMapping",
    contentType: "application/json; charset=utf-8",
    data: JSON.stringify(ACTION_MAPPING),
    success: function(data) {
      console.log("Save Success!");
    },
    error: function(error) {
      console.log("Save Error! Error: ");
      console.log(error);
    }
  });
}


export function loadControllerMapping() {
  console.log('loading the controller mapping');
  $.get("/api/v1/controllerMapping", function(data) {
    console.log(data);
    CONTROLLER_MAPPING = data;
  }, "json");
}


export function loadButtonActions() {
  console.log('loading the action mapping');
  $.get("/api/v1/actionMapping", function(data) {
    console.log(data);
    ACTION_MAPPING = data;
  }, "json");
}

loadControllerMapping();
loadButtonActions(); // do this fast


function updateTable(tableId, tableCommand, commandVar) {
  const threeRows = tableId === 'edit-audio' ? true : false;
  let btnMap = {};
  for(let btn in ACTION_MAPPING) {
    btn = ACTION_MAPPING[btn];
    if(btn.command === tableCommand) {
      btnMap[btn.type] = btn.buttonName;
    }
  }
  let table = $(`#${tableId}`);
  table.find('tbody').empty();
  for(let key in commandVar) {
    let str = btnMap[key];
    let selected = '';
    if(str === undefined) {
      str = 'unmapped';
      selected = 'selected';
    }
    let selectStr = `<select ${selected} class="${tableId}-select"><option value="unmapped">unmapped</option>`;
    for(let id in ACTION_MAPPING) {
      const name = ACTION_MAPPING[id].buttonName;
      selected = str === name ? 'selected' : '';
      selectStr += `<option ${selected} value="${name}">${name}</option>`;
    }
    selectStr += '</select>';
    const todo = threeRows ? '<td>TODO</td>' : '';
    table.find('tbody:last').append(`<tr><td>${key}</td>${todo}<td>${selectStr}</td></tr>`)
  }
}


export function updateEditTable() {
    updateTable('edit-audio', 'speak', SPEECH);
    updateTable('edit-motion', 'move', MOTION);
}


function remapButton(buttonName, command, type) {
  let foundId = false;
  let id = null;
  for(id in ACTION_MAPPING) {
    if(ACTION_MAPPING[id].buttonName === buttonName) {
      foundId = true;
      break;
    }
  }
  if(!foundId) {
    console.log(`button not found matching ${buttonName}, clearing binding for ${command}:${type}`);
    for(let action in ACTION_MAPPING) {
      if(ACTION_MAPPING[action].type === type && ACTION_MAPPING[action].command === command) {
        ACTION_MAPPING[action].command = null;
        ACTION_MAPPING[action].type = null;
      }
    }
    return;
  } else {
    ACTION_MAPPING[id].command = command;
    ACTION_MAPPING[id].type = type;
    console.log(`remapped ${buttonName} to Command ${command}: ${type}`);
    console.log(ACTION_MAPPING);
  }
  updateEditTable();
}


function setupButtons(type, category) {
  // console.log(`setting up ${type} buttons for ${category}`);
  // category: basic/question/fact/guide
  const group = $(`.${category}-buttons`)[0];
  // console.log(group);
  // type: motion/speech/miscellaneous
  const commands = window[type.toUpperCase()];
  for(let command in commands) {
    // console.log(command);
    // command = say-x
    if(commands[command].category === category) {
      const text = `<button type="button" id="${command}" class="button ${type}-control">${commands[command].name}</button>\n`;
      $(group).last().append(text);
    }
  }
}


let rosClient = null;
let chatHistory = null;


function sendSpeech(speech_string) {
  console.log('sending audio to robot');
  rosClient.topic.publish('/web_audio', 'std_msgs/String', {data: speech_string});
}


function triggerSpeech(speechId) {
  const sayings = SPEECH[speechId].data;
  const sentence = sayings[Math.floor(Math.random() * sayings.length)];
  chatHistory.addText(sentence);
  sendSpeech(sentence);
}


/**
 * Setup all GUI elements when the page is loaded. 
 */
export function init() {

  // Connecting to ROS.
  rosClient = new RosClient({
    url : `ws://${window.location.hostname}:9090`
  });
  window.rosClient = rosClient;
  console.log("ROS CLIENT:");
  console.log(rosClient);

  setupButtons('motion', 'motion');

  setupButtons('speech', 'basic');
  setupButtons('speech', 'question');
  setupButtons('speech', 'fact');
  setupButtons('speech', 'guide');

  initMap(rosClient);

  const chatInput = document.getElementById('chat-input');
  const chatHistoryDiv = document.getElementById('chat-history');
  chatHistory = new ChatHistory(chatInput, chatHistoryDiv);
  chatHistory.onEnterCallback = (text) => {
    sendSpeech(text);
  };

  // Setup video stream
  document.getElementById('video-display').setAttribute('src', `http://${window.location.hostname}:8080/stream?topic=${CAMERA_TOPIC}&quality=${CAMERA_QUALITY}`);


  $('#edit-audio').on('change', '.edit-audio-select', (e) => {
    const boundBtnName = e.target.value;
    const target = $(e.target);
    const commandType = target.parents('tr').children()[0].childNodes[0]['data']; 
    console.log('mapping changed');
    remapButton(boundBtnName, 'speak', commandType);
  });


  $('#edit-motion').on('change', '.edit-motion-select', (e) => {
    const boundBtnName = e.target.value;
    const target = $(e.target);
    const commandType = target.parents('tr').children()[0].childNodes[0]['data']; 
    console.log('mapping changed');
    remapButton(boundBtnName, 'move', commandType);
  });


  const redIndicator = document.getElementById('red-btn-indicator');
  const yellowIndicator = document.getElementById('yellow-btn-indicator');
  const greenIndicator = document.getElementById('green-btn-indicator');
  const buttonIndicator = new ButtonIndicator(rosClient, [redIndicator, yellowIndicator, greenIndicator]);
  buttonIndicator.chatHistory = chatHistory;


  teleop = new GAMEPADTELEOP.Teleop({
    rosClient : rosClient,
    topic : '/cmd_vel_mux/input/teleop'
  });


  teleop.on('buttonDown', idx => {
    console.log(`pressed:${idx}`);
    gamepadButtonHandler(idx);
  });


  // Create a UI slider using JQuery UI.
  const speedSlider = $('#speed-slider');
  const speedLabel = $('#speed-label');
  speedSlider.slider({
    range : 'min',
    min : 0,
    max : 100,
    value : 60,
    slide : (e, ui) => {
      // Change the speed label.
      speedLabel.html(`Linear Speed:${ui.value}%`);
      // Scale the speed.
      teleop.scale = (ui.value / 100.0);
    }
  });
  // Set the initial speed .
  speedLabel.html(`Speed: ${speedSlider.slider('value')}%`);
  teleop.scale = speedSlider.slider('value') / 100.0;


  const rotSpeedSlider = $('#rotation-slider');
  const rotSpeedLabel = $('#rotation-label');
  rotSpeedSlider.slider({
    range : 'min',
    min : 0,
    max : 100,
    value : 60,
    slide : (e, ui) => {
      // Change the speed label.
      rotSpeedLabel.html(`Rotation Speed:${ui.value}%`);
      // Scale the speed.
      teleop.rotationScale = (ui.value / 100.0);
    }
  });
  // Set the initial speed .
  rotSpeedLabel.html(`Speed: ${rotSpeedSlider.slider('value')}%`);
  teleop.rotationScale = rotSpeedSlider.slider('value') / 100.0;


  const recordBtn = $('#record-ctrl');
  const recordName = $('#record-name');
  const recordSession = $('#record-session');
  const recordButton = new RecordButton(recordBtn, recordName, recordSession);
  recordButton.chatHistory = chatHistory; // hack for logging


  $('.speech-control').click((e) => {
    triggerSpeech(e.target.id)
  });


  const motionBtns = $('.motion-control');
  function sendSequence(sequence, duration) {
    motionBtns.prop('disabled', true);
    let step = 0;
    let loopTimer;
    const pub = () => {
      console.log('publishing');
      rosClient.topic.publish('/cmd_vel_mux/input/navi', 'geometry_msgs/Twist', sequence[step]);
      step += 1;
      if (step >= sequence.length) {
        clearInterval(loopTimer);
        motionBtns.prop('disabled', false);
      }
    }
    loopTimer = setInterval(pub, 100);
  }


  function triggerMotion(motionId) {
    chatHistory.addText(`'${motionId.toUpperCase()}' Motion Triggered`);
    const sequence = MOTION[motionId].data;
    //console.log('sending sequence');
    sendSequence(sequence, null);
  }


  motionBtns.click((e) => {
    triggerMotion(e.target.id)
  });


  gamepadButtonHandler = function(buttonIdx) {
      let action = ACTION_MAPPING[CONTROLLER_MAPPING[buttonIdx]];
      console.log(action);
      if(action) {
          switch(action.command) {
            case 'record':
              toggleRecord();
              break;
            case 'speak':
              triggerSpeech(action.type);
              break;
            case 'move':
              triggerMotion(action.type);
              break;
            default:
              console.log('No valid action assigned to this button');
              console.log(`Button action: ${action.command}`);
          }
      }
  }
}
