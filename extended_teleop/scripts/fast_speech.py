#! /usr/bin/env python

import sys
import os
import time
import signal
import psutil
from base64 import b64encode
import threading
from subprocess import Popen, PIPE, STDOUT

import rospy
from std_msgs.msg import String
from sound_play.msg import SoundRequest
from sound_play.libsoundplay import SoundClient


class FastSpeech(object):
    def __init__(self):
        rospy.init_node('fast_speech')
        self.speech_dir = rospy.get_param('~speech_directory', '/home/blood/speech_files')
        os.chdir(self.speech_dir) # so we can save the files
        self.sound_client = SoundClient()
        listen_topic = rospy.get_param('~text_topic', '/web_audio')
        self.textSub = rospy.Subscriber(listen_topic, String, self.send_speech, queue_size=1)

    def play_saved_speech(self, filename):
        self.sound_client.playWave('{}/{}.wav'.format(self.speech_dir, filename))

    def save_speech(self, string):
        encoded = b64encode(string, '__') # safe string for filename
        c = Popen(['text2wave', '-o', '{}.wav'.format(encoded)], stdin=PIPE)
        c.communicate(input=b'{}'.format(string))

    def send_speech(self, message):
        filename = b64encode(message.data, '__')
        if os.path.isfile('./{}.wav'.format(filename)):
            play_saved_speech(filename)
        else:
            self.sound_client.voiceSound(message.data);
            self.save_speech(message.data)

if __name__ == "__main__":
    fs = FastSpeech()
    while not rospy.is_shutdown():
        rospy.spin()
