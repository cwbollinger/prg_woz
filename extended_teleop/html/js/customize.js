import SPEECH from './speech.js';
import MOTION from './motion.js';
import GAMEPADTELEOP from './gamepad_teleop.js';
import RosClient from 'roslibjs-client';

const CAMERA_TOPIC='/camera/image_raw';
const CAMERA_QUALITY='10';

let teleop = null;
let gamepadButtonHandler = null; //TODO: this is horrible, reorder code

let BUTTON_ACTIONS = null;

function saveButtonActions() {
  console.log('saving the controller mapping');
  $.ajax({
    type: "post",
    url: "/api/v1/mapping/map",
    contentType: "application/json; charset=utf-8",
    data: JSON.stringify(BUTTON_ACTIONS),
    success: function(data) {
      console.log("Save Success!");
    },
    error: function(error) {
      console.log("Save Error! Error: ");
      console.log(error);
    }
  });
}

function loadButtonActions() {
  console.log('loading the controller mapping');
  $.get("/api/v1/mapping/map", function(data) {
    console.log(data);
    BUTTON_ACTIONS = data;
  }, "json");
}
loadButtonActions(); // do this fast

function updateTable(tableId, tableCommand, commandVar) {
  const threeRows = tableId === 'edit-audio' ? true : false;
  let btnMap = {};
  for(let btn in BUTTON_ACTIONS) {
    btn = BUTTON_ACTIONS[btn];
    if(btn.command === tableCommand) {
      btnMap[btn.type] = btn.buttonName;
    }
  }
  let table = $('#'+tableId);
  table.find('tbody').empty();
  for(let key in commandVar) {
    let str = btnMap[key];
    let selected = '';
    if(str === undefined) {
      str = 'unmapped';
      selected = 'selected';
    }
    let selectStr = '<select '+selected+' class="'+tableId+'-select"><option value="unmapped">unmapped</option>';
    for(let id in BUTTON_ACTIONS) {
      const name = BUTTON_ACTIONS[id].buttonName;
      selected = str === name ? 'selected' : '';
      selectStr += '<option '+selected+' value="'+name+'">'+name+'</option>';
    }
    selectStr += '</select>';
    const todo = threeRows ? '<td>TODO</td>' : '';
    table.find('tbody:last').append('<tr><td>'+key+'</td>'+todo+'<td>'+selectStr+'</td></tr>')
  }
}

function updateEditTable() {
    updateTable('edit-audio', 'speak', SPEECH);
    updateTable('edit-motion', 'move', MOTION);
}

function remapButton(buttonName, command, type) {
  let foundId = false;
  let id = null;
  for(id in BUTTON_ACTIONS) {
    if(BUTTON_ACTIONS[id].buttonName === buttonName) {
      foundId = true;
      break;
    }
  }
  if(!foundId) {
    console.log(`button not found matching ${buttonName}, clearing binding for ${command}:${type}`);
    for(let action in BUTTON_ACTIONS) {
      if(BUTTON_ACTIONS[action].type === type && BUTTON_ACTIONS[action].command === command) {
        BUTTON_ACTIONS[action].command = null;
        BUTTON_ACTIONS[action].type = null;
      }
    }
    return;
  } else {
    BUTTON_ACTIONS[id].command = command;
    BUTTON_ACTIONS[id].type = type;
    console.log(`remapped ${buttonName} to Command ${command}: ${type}`);
    console.log(BUTTON_ACTIONS);
  }
  updateEditTable();
}

function setupButtons(type, category) {
  console.log('setting up '+type+' buttons for '+category);
  // category: basic/question/fact/guide
  const group = $('.'+category+'-buttons')[0];
  // type: motion/speech/miscellaneous
  for(command in window[type.toUpperCase()]) {
    // command = say-x
    const text = '<button type="button" id="'+command+'" class="button '+type+'-control">'+command+'</button>';
    $(group).last().append(text);
  }
}

/**
 * Setup all GUI elements when the page is loaded. 
 */
function init() {
  setupButtons('motion', 'motion');
  setupButtons('speech', 'basic');
  setupButtons('speech', 'question');
  setupButtons('speech', 'fact');
  setupButtons('speech', 'guide');

  // Setup audio control
  const audioCtrl = $('#audio-ctrl');
  audioCtrl.attr('src', 'http://'+window.location.hostname+':8001');
  audioCtrl.attr('type', 'audio/mp3');

  $('#button-edit').click(()=>{
    updateEditTable();
  });

  $('#save-mapping').click(()=>{
    saveButtonActions();
  });

  $('#load-mapping').click(()=>{
    loadButtonActions();
  });


  $('#edit-audio').on('change', '.edit-audio-select', function(e) {
    const boundBtnName = e.target.value;
    const target = $(e.target);
    const commandType = target.parents('tr').children()[0].childNodes[0]['data']; 
    console.log('mapping changed');
    remapButton(boundBtnName, 'speak', commandType);
  });

  $('#edit-motion').on('change', '.edit-motion-select', function(e) {
    const boundBtnName = e.target.value;
    const target = $(e.target);
    const commandType = target.parents('tr').children()[0].childNodes[0]['data']; 
    console.log('mapping changed');
    remapButton(boundBtnName, 'move', commandType);
  });

  // Setup video stream
  $('#video-display').attr('src', 'http://'+window.location.hostname+':8080/stream?topic='+CAMERA_TOPIC+'&quality='+CAMERA_QUALITY);


  // Connecting to ROS.
  let rosClient = new RosClient({
    url : 'ws://'+window.location.hostname+':9090'
  });

  let redPressed = false;
  let whitePressed = false;
  let greenPressed = false;
  rosClient.topic.subscribe('/pushed', 'std_msgs/Int8', function(message) {
    let newRedPressed = (1 & message.data) > 0;
    let newWhitePressed = (2 & message.data) > 0;
    let newGreenPressed = (4 & message.data) > 0;
    if(newRedPressed && !redPressed) {
      appendChat("User Pressed Red Button!");
    }
    if(newWhitePressed && !whitePressed) {
      appendChat("User Pressed White Button!");
    }
    if(newGreenPressed && !greenPressed) {
      appendChat("User Pressed Green Button!");
    }
    redPressed = newRedPressed;
    whitePressed = newWhitePressed;
    greenPressed = newGreenPressed;
  });

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
    slide : function(e, ui) {
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
    slide : function(e, ui) {
      // Change the speed label.
      rotSpeedLabel.html(`Rotation Speed:${ui.value}%`);
      // Scale the speed.
      teleop.rotationScale = (ui.value / 100.0);
    }
  });
  // Set the initial speed .
  rotSpeedLabel.html(`Speed: ${rotSpeedSlider.slider('value')}%`);
  teleop.rotationScale = rotSpeedSlider.slider('value') / 100.0;


  const chatHistory = $('#chat-history');
  function appendChat(text) {
    let history = chatHistory.text();
    history += text+'\n';
    chatHistory.text(history);
    chatHistory.scrollTop(chatHistory[0].scrollHeight);
  }


  function sendSpeech(speech_string) {
    appendChat(speech_string);
    // sound -3 is "SAY"
    // command 1 is "PLAY_ONCE"
    rosClient.topic.publish('/robotsound', 'sound_play/SoundRequest', {
      sound: -3,
      command: 1,
      volume: 1.0,
      arg: speech_string,
      arg2:'voice_kal_diphone'
    });
  }
  
  function triggerSpeech(speechId) {
    const sayings = SPEECH[speechId].data;
    const sentence = sayings[Math.floor(Math.random() * sayings.length)];
    sendSpeech(sentence);
  }

  let recording = false;
  function start_recording(filename) {
    recording = true;
    rosClient.topic.publish('/rosbagctrl/named', 'std_msgs/String', {data:`${filename}:start`});
  }

  function stop_recording(filename) {
    recording = false;
    rosClient.topic.publish('/rosbagctrl/named', 'std_msgs/String', {data:`${filename}:stop`});
  }

  const recordBtn = $('#record-ctrl');
  const recordName = $('#record-name');
  const recordSession = $('#record-session');
  function toggleRecord() {
    const recName = recordName.val();
    const session = recordSession.val();
    const bagName = `${recName}_${session}.bag`;
    if(recording) {
      appendChat('SESSION RECORDING ENDED');
      stop_recording(bagName);
      recordName.prop('disabled', false);
      recordSession.prop('disabled', false);
      recordBtn.text('Start Recording');
      recordBtn.addClass('success');
      recordBtn.removeClass('alert');
    } else {
      appendChat('SESSION RECORDING STARTED');
      recordName.prop('disabled', true);
      recordSession.prop('disabled', true);
      start_recording(bagName);
      recordBtn.text('Stop Recording');
      recordBtn.addClass('alert');
      recordBtn.removeClass('success');
    }
  }
  recordBtn.click(toggleRecord);

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
    appendChat(`'${motionId.toUpperCase()}' Motion Triggered`);
    const sequence = MOTION[motionId].data;
    console.log('sending sequence');
    sendSequence(sequence, null);
  }

  motionBtns.click((e) => {
    triggerMotion(e.target.id)
  });

  $('#chat-input').on('keydown', (ev) => {
    if(ev.which === 13) {
      const text = $('#chat-input').val();
      sendSpeech(text);
      $('#chat-input').val('');
      return false;
    }
  });

  gamepadButtonHandler = function(buttonIdx) {
      let action = BUTTON_ACTIONS[buttonIdx]
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
              console.log('Button action: '+action.command);
          }
      }
  }
}

export default init;
