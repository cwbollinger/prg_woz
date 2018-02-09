#!/usr/bin/env python
import rospy
import math
import time
import sys, select, tty, termios
from std_msgs.msg import UInt16


from geometry_msgs.msg import Twist
from geometry_msgs.msg import PoseWithCovarianceStamped
from sensor_msgs.msg import LaserScan
from std_msgs.msg import Float32MultiArray


#Global Variables
vel = 0.0 #m/s
pub = rospy.Publisher('/cmd_vel', Twist, queue_size=1)
drive_command = Twist()
drive_command.linear.x = 1
drive_command.linear.y = 0
drive_command.linear.z = 0
drive_command.angular.x = 0
drive_command.angular.y = 0
drive_command.angular.z = 0
glob_ang=0
glob_x=0
glob_y=0
scan_points=[[1,2],[3,4]]
array_pub=Float32MultiArray()

#Callback function
def callback(lscan):
    global scan_points
    global vel
    global drive_command
    #driveCallback()
    print "A pressed."  
    
#Driver callback function
def driveCallback():
    global drive_command
    drive_command.linear.x = 1
    drive_command.linear.y = 0
    drive_command.linear.z = 0
    drive_command.angular.x = 0
    drive_command.angular.y = 0
    drive_command.angular.z = 0

def bot_angle(ang):
    global glob_x
    global glob_y
    global glob_ang

    glob_x=ang.pose.pose.position.x
    glob_y=ang.pose.pose.position.y
    glob_ang=quaternion_to_euler_angle(ang.pose.pose.orientation.w,ang.pose.pose.orientation.x,ang.pose.pose.orientation.y,ang.pose.pose.orientation.z)


#Initialize node
def listener():
    rospy.Subscriber("/amcl_pose", PoseWithCovarianceStamped , bot_angle)
    #rospy.Subscriber("/scan", LaserScan, callback)
    #rospy.Subscriber("cmd_vel", Twist, driveCallback)

    rospy.spin()

#Function for publishing velocities turtlebot
def publisher():
    global pub
    global drive_command
    rate = rospy.Rate(10)
    pub.publish(drive_command)
    driveCallback()
    rate.sleep()

def quaternion_to_euler_angle(w, x, y, z):
    ysqr = y * y
    
    t0 = +2.0 * (w * x + y * z)
    t1 = +1.0 - 2.0 * (x * x + ysqr)
    X = math.degrees(math.atan2(t0, t1))
    
    t2 = +2.0 * (w * y - z * x)
    t2 = +1.0 if t2 > +1.0 else t2
    t2 = -1.0 if t2 < -1.0 else t2
    Y = math.degrees(math.asin(t2))
    
    t3 = +2.0 * (w * z + x * y)
    t4 = +1.0 - 2.0 * (ysqr + z * z)
    Z = math.degrees(math.atan2(t3, t4))
    
    #print "X rotation is:" + format(X)
    #print "Y rotation is:" + format(Y)
    if Z<0 & Z>-180:
        Z+=360
    print "Z rotation is:" + format(Z) 
    return math.radians(Z)

def point_x(theta,alpha,a,r):
    ang=theta-alpha
    return a+r*math.cos(ang)
    #return_y = b+r*math.sin(ang)

def point_y(theta,alpha,b,r):
    ang=theta-alpha
    #return_x = a+r*math.cos(ang)
    return b+r*math.sin(ang)

if __name__ == '__main__':
    rospy.init_node('macros', anonymous=True)
    rate = rospy.Rate(100)
    old_attr = termios.tcgetattr(sys.stdin)
    tty.setcbreak(sys.stdin.fileno())
    #Allow time for Rviz to open
    while not rospy.is_shutdown():
    # BEGIN SELECT
        if select.select([sys.stdin], [], [], 0)[0] == [sys.stdin]:
            if sys.stdin.read(1)=="a":
                listener()
            # key_pub.publish(ang)S
        rate.sleep()
    # END SELECT
    # BEGIN TERMIOS_END
    termios.tcsetattr(sys.stdin, termios.TCSADRAIN, old_attr)
    time.sleep(3)