                                                            # PROJECT (FLACK) WAS STARTED ON 3rd July, 2020, code written by "Shahzaib Saeed"

from time import localtime, strftime
import json
import requests
from flask import Flask,jsonify, render_template, request
from flask_socketio import SocketIO, emit, send, join_room, leave_room

# config the app
app = Flask(__name__)
app.config["SECRET_KEY"] = '22e4d35d374362b8f0975081711c4203'

# initialize the Flask-SocketIO
socketio = SocketIO(app)


CHANNELS = ["general"]
oldMessages = {'#general': [{'messages': [],
                        'displayName': [],
                        'timeStamp': []
                        }]
                        }

typing_users = {"#general": []}

@app.route('/')
def index():
    return render_template('chat.html', channels = CHANNELS)
    
# User Typing
@socketio.on("type")
def on_type(data):
    username = data['username']
    channel = data['channel']
    if data['status'] == "end":
        if data['username'] in typing_users[data['channel']]:
            typing_users[data['channel']].remove(data['username'])

        message = {"usernames": typing_users[channel], "channel": channel}
        emit('typing', message, broadcast=True)
        print(f"\n\nUser not typing\n\n")

    else:
        if channel not in typing_users:
            typing_users[channel] = []

        if username not in typing_users[channel]:
            typing_users[channel].append(username)

        message = {"usernames": typing_users[channel], "channel": channel}
        emit('typing', message, broadcast=True)
        print(f"\n\n{username} typing\n\n")

# Displaying Old Channels
@socketio.on('old msgs')
def oldMsgs(data):
    currentChannel = data['currentChannel']
    displayName = data['displayName']
    if currentChannel not in oldMessages:
        channel = currentChannel
        oldMessages[channel] = [{'messages': [],
                                'displayName': [],
                                'timeStamp': []
                                }]
    else:
        socketio.emit('display old msgs', {'messages': oldMessages[currentChannel][0], "currentChannel": currentChannel, "displayName": displayName})
        print(f"\n\ndisplaying old msgs for channel {currentChannel}\n\n")


# New channel
@socketio.on('new channel')
def newChannel(data):
    newChannel = data['channel']
    # check if the channel is already exited in the list
    if (newChannel in CHANNELS):
        print(f"\n\nduplicate exits\n\n")
    else:
        CHANNELS.append(newChannel)
        emit('add channel', newChannel, broadcast = True)

# New Message
@socketio.on('incoming msg')
def message(data):
    displayName = data['displayName']
    channel = data['channel']
    message = data['message']
    timeStamp = strftime('%b-%d,  %I:%M%p', localtime())
    # if channel existed, save the messages in respective channel else create new history JSON object for new channel and save the messages
    if channel in oldMessages:
        current_channel = channel
        oldMessages[current_channel][0]['messages'].append(message)
        oldMessages[current_channel][0]['displayName'].append(displayName)
        oldMessages[current_channel][0]['timeStamp'].append(timeStamp)
        if (len(oldMessages[current_channel][0]['messages']) == 100):
            del oldMessages[current_channel][0]['messages'][0]
    else:
        new_channel = channel
        oldMessages[new_channel] = [{'messages': [],
                                'displayName': [],
                                'timeStamp': []
                                }]
        oldMessages[new_channel][0]['messages'].append(message)
        oldMessages[new_channel][0]['displayName'].append(displayName)
        oldMessages[new_channel][0]['timeStamp'].append(timeStamp)
    print(f"\n\n{oldMessages}\n\n")
    socketio.emit('new message', {'message': message, 'timeStamp': timeStamp, 'displayName': displayName}, room = channel)
    print(f"\n\nMsg '{message}' send by '{displayName}' at channel '{channel}'\n\n")

# Join New Channel
@socketio.on('join')
def join(data):
    displayName = data['displayName']
    channel = data['channel']
    join_room(channel)
    socketio.emit('joinChannelAnnouncement', data, room = channel)
    print(f"\n\nchannel '{channel}' joined by {displayName}\n\n")

# Leave Current Channel
@socketio.on('leave')
def leave(data):
    displayName = data['displayName']
    channel = data['channel']
    leave_room(channel)
    socketio.emit('leaveChannelAnnouncement', data, room = channel)
    print(f"\n\nchannel '{channel}' left by {displayName}\n\n")



if __name__ == "__main__":
    socketio.run(app, debug=True)
