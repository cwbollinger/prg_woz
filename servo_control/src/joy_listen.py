#!/usr/bin/env python
# BEGIN ALL
import time
import rospy
from std_msgs.msg import UInt16
from sensor_msgs.msg import Joy

#Global Variables
ang=90
inc=.5

key_pub = rospy.Publisher('servo', UInt16, queue_size=0)
rospy.init_node("key_listen")
rate = rospy.Rate(100)

def joy_handler(ps):
  global ang
  global inc
  old_ang=ang
  if ps.axes[3]>0:
    ang+=inc
  elif ps.axes[3]<0:
    ang-=inc
  if ps.axes[3]==1:
    ang+=inc*2
  elif ps.axes[3]==-1:
    ang-=inc*2
  if ang>130:
      ang=130
  elif ang<45:
      ang=45
  if not ang==old_ang:
    print "pub!"
    key_pub.publish(ang)
  #time.sleep(.1)

def listener():
    rospy.Subscriber("/joy", Joy , joy_handler)
    #rospy.Subscriber("cmd_vel", Twist, driveCallback
    rospy.spin()

if __name__ == '__main__':

  # BEGIN TERMIOS
  # END TERMIOS
  time.sleep(3)
  listener()

  # END SELECT
  # BEGIN TERMIOS_END
  # END TERMIOS_END
# END ALL