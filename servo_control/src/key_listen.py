#!/usr/bin/env python
# BEGIN ALL
import sys, select, tty, termios
import rospy
from std_msgs.msg import UInt16


if __name__ == '__main__':
  key_pub = rospy.Publisher('servo', UInt16, queue_size=1)
  rospy.init_node("key_listen")
  rate = rospy.Rate(100)
  # BEGIN TERMIOS
  old_attr = termios.tcgetattr(sys.stdin)
  tty.setcbreak(sys.stdin.fileno())
  # END TERMIOS
  print "Publishing keystrokes."
  print "Press f to increase angle."
  print "Press v to decrease angle."
  print "Press Ctrl-C to exit."
  ang=90
  key_pub.publish(ang)
  old_ang=ang
  while not rospy.is_shutdown():
    # BEGIN SELECT
    if select.select([sys.stdin], [], [], 0)[0] == [sys.stdin]:
      if sys.stdin.read(1)=="f":
        ang+=3
      elif (sys.stdin.read(1)=="v"):
        ang-=3
    if ang>130:
      ang=130
    elif ang<45:
      ang=45
    if not ang==old_ang:
      key_pub.publish(ang)
    old_ang=ang
    rate.sleep()
    # END SELECT
  # BEGIN TERMIOS_END
  termios.tcsetattr(sys.stdin, termios.TCSADRAIN, old_attr)
  # END TERMIOS_END
# END ALL
