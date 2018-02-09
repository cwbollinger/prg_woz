#!/usr/bin/env python
# BEGIN ALL
import sys, select, tty, termios
import rospy
from std_msgs.msg import String


if __name__ == '__main__':
  key_pub = rospy.Publisher('macro_pub', String , queue_size=1)
  rospy.init_node("macro_pub")
  rate = rospy.Rate(100)
  # BEGIN TERMIOS
  old_attr = termios.tcgetattr(sys.stdin)
  tty.setcbreak(sys.stdin.fileno())
  # END TE  RMIOS
  print "Publishing keystrokes."
  print "Press a to run 180 macro."
  print "Press Ctrl-C to exit."
  while not rospy.is_shutdown():
    # BEGIN SELECT
    if select.select([sys.stdin], [], [], 0)[0] == [sys.stdin]:
      if sys.stdin.read(1)=="a":
        key_pub.publish("a")
    rate.sleep()
    # END SELECT
  # BEGIN TERMIOS_END
  termios.tcsetattr(sys.stdin, termios.TCSADRAIN, old_attr)
  # END TERMIOS_END
# END ALL