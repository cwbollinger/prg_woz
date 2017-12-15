#!/usr/bin/env python

import rospy

from sound_play.libsoundplay import SoundClient
from sound_play.msg import SoundRequest

from Tkinter import *


class SpeechGui(Frame):

    def __init__(self, master=None):
        Frame.__init__(self, master)
        self.master = master
        self.soundhandle = SoundClient()
        self.init_window()

    def init_window(self):
        self.master.title("Speech Control Prototype")
        self.pack(fill=BOTH, expand=1)
        Button(self, text="Hello!", command=self.say_hello).pack()
        Button(self, text="Goodbye!", command=self.say_goodbye).pack()
        Button(self, text="Motivate!", command=self.say_motivation).pack()

    def speak(self, text):
        self.soundhandle.say(text, rospy.get_param("/synth_voice"))

    def say_hello(self):
        self.speak("Hello there, fellow robot!")

    def say_goodbye(self):
        self.speak("See you later, fellow robot!")

    def say_motivation(self):
        self.speak("It is a new year, time for a new you!")


if __name__=="__main__":
    rospy.init_node('turtlebot_speech')
    rospy.set_param("/synth_voice", "voice_kal_diphone")  # Initialize as default voice


    root = Tk()
    app = SpeechGui(root)
    app.mainloop()
