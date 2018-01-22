/**
 * @author Russell Toris - rctoris@wpi.edu
 */

var GAMEPADTELEOP = GAMEPADTELEOP || {
  REVISION : '0.0.1'
};

/**
 * @author Russell Toris - rctoris@wpi.edu
 */

/**
 * Manages connection to the server and all interactions with ROS.
 *
 * Emits the following events:
 *   * 'change' - emitted with a change in speed occurs
 *
 * @constructor
 * @param options - possible keys include:
 *   * ros - the ROSLIB.Ros connection handle
 *   * topic (optional) - the Twist topic to publish to, like '/cmd_vel'
 *   * throttle (optional) - a constant throttle for the speed
 */
GAMEPADTELEOP.Teleop = function(options) {
  var that = this;
  options = options || {};

  var rosClient = options.rosClient;
  var topic = options.topic || '/cmd_vel';
  var tiltTopic = options.tiltTopic || '/servo';
  // permanent throttle
  var throttle = options.throttle || 1.0;

  // used to externally throttle the speed (e.g., from a slider)
  this.scale = 1.0;
  this.rotationScale = 1.0;

  // linear x and y movement and angular z movement
  let x = 0;
  let z = 0;

  let tilt = 90;

  let oldButtons = null;

  const handleButtons = function(buttons) {
    let newButtons = buttons.map(elem => elem.pressed);
    oldButtons = oldButtons || newButtons; // hack to prevent error first pass

    for(let i = 0; i < newButtons.length; i++) {
      if(newButtons[i] && !oldButtons[i]) { // pressed
        that.emit('buttonDown', i);
      }

      if(!newButtons[i] && oldButtons[i]) { // released
        that.emit('buttonUp', i);
      }
    }
    oldButtons = newButtons;
  }

  // sets up a key listener on the page used for keyboard teleoperation
  const handleAxes = function(axes) {
    // used to check for changes in speed
    let oldX = x;
    let oldZ = z;
    let oldTilt = tilt;

    var speed = 0;
    // throttle the speed by the slider and throttle constant
    speed = throttle * that.scale;

    x = -0.5 * axes[1] * throttle * that.scale;
    z = -4 * axes[2] * throttle * that.rotationScale;

    if(axes[3] !== 0){
      tilt -= axes[3] * 3; //TODO: magic numbers need testing
    }

    // enforce safety limits
    // TODO: Make this a parameter to set on the class so it's more flexible
    if(tilt > 130) {
      tilt = 130;
    }
    if(tilt < 45) {
      tilt = 45;
    }
    tilt = Math.round(tilt); // uint16 in message

    // publish the command
    var twist = {
      angular : {
        x : 0,
        y : 0,
        z : z
      },
      linear : {
        x : x,
        y : 0,
        z : 0
      }
    };

    // only publish if moving or changing to zero from non-zero
    // prevents teleop from blocking motion on /navi with constant publishing
    if((oldX !== x) || (oldZ !== z) || (z !== 0) || (x !== 0)) {
      rosClient.topic.publish(topic, 'geometry_msgs/Twist', twist);
    }
    // check for changes
    if (oldX !== x || oldZ !== z) {
      that.emit('change', twist);
    }
    if (oldTilt !== tilt) {
      that.emit('changeTilt', tilt);
      rosClient.topic.publish(tiltTopic, 'std_msgs/UInt16', {'data': tilt});
    }
  };

  const handleGamepad = function(gamepad) {
    handleButtons(gamepad.buttons);
    handleAxes(gamepad.axes);
  }

  let controllers = [];
  let interval = null; 

  window.addEventListener('gamepadconnected', function(e) {
    controllers[e.gamepad.index] = e.gamepad;
    interval = setInterval(function() {
      handleGamepad(controllers[e.gamepad.index]);
    }, 50);
    console.log(`Gamepad connected at index ${e.gamepad.index}:${e.gamepad.id}. ${e.gamepad.buttons.length} buttons, ${e.gamepad.axes.length} axes.`);
  });
  window.addEventListener("gamepaddisconnected", function(e) {
    clearInterval(interval);
    delete controllers[e.gamepad.index];
    console.log("Gamepad disconnected from index %d: %s", e.gamepad.index, e.gamepad.id);
  });
};
GAMEPADTELEOP.Teleop.prototype.__proto__ = EventEmitter2.prototype;
