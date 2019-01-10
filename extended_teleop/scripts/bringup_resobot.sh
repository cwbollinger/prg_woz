#! /usr/bin/env bash

SESSION=resolutionbot

tmux -2 new-session -d -s $SESSION

tmux select-pane -t 0
tmux send-keys "roscore" C-m
sleep 10
tmux split-window -h
tmux select-pane -t 1
tmux send-keys "roslaunch turtlebot_bringup minimal.launch" C-m

tmux split-window -v
tmux select-pane -t 2
tmux send-keys "roslaunch extended_teleop hardware.launch" C-m

tmux split-window -v
tmux select-pane -t 3
tmux send-keys "roslaunch extended_teleop web_teleop.launch" C-m

tmux split-window -v
tmux select-pane -t 4
tmux send-keys "roslaunch extended_teleop map.launch" C-m

tmux -2 attach-session -t $SESSION
