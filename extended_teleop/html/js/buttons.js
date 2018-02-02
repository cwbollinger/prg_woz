
export class ButtonIndicator {
  constructor(rosClient, indicators) {
    this.rosClient = rosClient;
    this.lightData = 0;

    this.redIndicator = indicators[0];
    this.redIndicator.addEventListener('click', (evt) => {
      this.sendLight('red', 1000);
    });

    this.yellowIndicator = indicators[1];
    this.yellowIndicator.addEventListener('click', (evt) => {
      this.sendLight('yellow', 1000);
    });

    this.greenIndicator = indicators[2];
    this.greenIndicator.addEventListener('click', (evt) => {
      this.sendLight('green', 1000);
    });

    this.redPressed = false;
    this.yellowPressed = false;
    this.greenPressed = false;
    rosClient.topic.subscribe('/pushed', 'std_msgs/Int8', this.buttonMessageCallback);
  }



  sendLight(btn, duration) {
    console.log(`user clicked ${btn}`);
    let lightValue = 0;
    if( btn === 'red' && !(this.lightData & 1) ) {
      lightValue = 1;
    } else if( btn === 'yellow' && !(this.lightData & 2) ) {
      lightValue = 2;
    } else if( btn === 'green'  && !(this.lightData & 4) ) {
      lightValue = 4;
    }
    this.lightData += lightValue;

    const pub = () => {
      this.rosClient.topic.publish('/light', 'std_msgs/Int8', {'data': this.lightData});
    }

    let loopTimer = setInterval(pub, 100);
    setTimeout( () => {
      clearInterval(loopTimer);
      this.lightData -= lightValue;
    }, duration);
  }

  buttonMessageCallback(message) {
    let newRedPressed = (1 & message.data) > 0;
    let newYellowPressed = (2 & message.data) > 0;
    let newGreenPressed = (4 & message.data) > 0;

    this.redIndicator.style.backgroundColor = newRedPressed ? 'red' : 'maroon';
    this.yellowIndicator.style.backgroundColor = newWhitePressed ? 'yellow' : 'olive';
    this.greenIndicator.style.backgroundColor = newGreenPressed ? 'lime' : 'green';

    if(newRedPressed && !this.redPressed) {
      chatHistory.addText("User Pressed Red Button!");
    }
    if(newYellowPressed && !this.yellowPressed) {
      chatHistory.addText("User Pressed White Button!");
    }
    if(newGreenPressed && !this.greenPressed) {
      chatHistory.addText("User Pressed Green Button!");
    }
    this.redPressed = newRedPressed;
    this.yellowPressed = newYellowPressed;
    this.greenPressed = newGreenPressed;
  }
}
