#!/usr/bin/env python
import Tkinter as tk

import rospy
import cv2
from cv_bridge import CvBridge, CvBridgeError

# Message for image
from sensor_msgs.msg import Image

cvbridge = CvBridge()


class ConvertImage:

    def __init__(self, from_image_topic, to_image_topic,
                 node_name='color_conversion'):
        rospy.init_node(node_name)

        #subscribe to color image messages
        rospy.Subscriber(from_image_topic, Image, self.to_grayscale)

        # publish grayscale image messages
        self.imPub = rospy.Publisher(to_image_topic, Image, queue_size=1)

    def to_grayscale(self, image_msg):
        gray_img = cvbridge.imgmsg_to_cv2(image_msg, 'mono8')
        ros_img = cvbridge.cv2_to_imgmsg(gray_img, 'mono8')
        self.imPub.publish(ros_img)

if __name__ == '__main__':
    foo = ConvertImage('color_image', 'gray_image')
    while not rospy.is_shutdown():
        rospy.spin()
