/*
 * rosserial Servo Control Example
 *
 * This sketch demonstrates the control of hobby R/C servos
 * using ROS and the arduiono
 * 
 * For the full tutorial write up, visit
 * www.ros.org/wiki/rosserial_arduino_demos
 *
 * For more information on the Arduino Servo Library
 * Checkout :
 * http://www.arduino.cc/en/Reference/Servo
 */

#if (ARDUINO >= 100)
 #include <Arduino.h>
#else
 #include <WProgram.h>
#endif

#include <Servo.h> 
#include <ros.h>
#include <std_msgs/Int8.h>
#include <std_msgs/UInt16.h>

ros::NodeHandle  nh;

std_msgs::Int8 pushed_msg;
ros::Publisher pub_button("pushed", &pushed_msg);

Servo servo;

const int buttonPin0 = 4;     // the number of the pushbutton pin
const int buttonPin1 = 3;
const int buttonPin2 = 2;
int buttonState0 = 0;         // variable for reading the pushbutton status
int buttonState1 = 0;
int buttonState2 = 0;
int button=0;
int old_button=button;

void servo_cb( const std_msgs::UInt16& cmd_msg){
  servo.write(cmd_msg.data); //set servo angle, should be from 0-180  
  digitalWrite(13, HIGH-digitalRead(13));  //toggle led  
}

int button_press(){
  buttonState0 = digitalRead(buttonPin0);
  buttonState1 = digitalRead(buttonPin1);
  buttonState2 = digitalRead(buttonPin2);
  if (buttonState0 == HIGH) {
    delay(200);
    return 0;
  }
  else if (buttonState1 == HIGH) {
    delay(200);
    return 1;
  }
  else if (buttonState2 == HIGH) {
    delay(200);
    return 2;   
  }
  else return -1;
  }

ros::Subscriber<std_msgs::UInt16> sub("servo", servo_cb);

void setup(){
  nh.initNode();
  nh.advertise(pub_button);
  pinMode(buttonPin0, INPUT);
  pinMode(buttonPin1, INPUT);
  pinMode(buttonPin2, INPUT);
  pinMode(13, OUTPUT);
  nh.subscribe(sub);
  servo.attach(9); //attach it to pin 9
  pushed_msg.data=-1;
}

void loop(){
  pushed_msg.data=button_press();
  
  if (pushed_msg.data!=-1){
  pub_button.publish(&pushed_msg);
  }
  pushed_msg.data=-1;
  nh.spinOnce();
  delay(1);
}

