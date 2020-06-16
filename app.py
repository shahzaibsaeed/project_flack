from time import localtime, strftime
import json
from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit, send, join_room, leave_room

# config the app
app = Flask(__name__)
app.config["SECRET_KEY"] = '22e4d35d374362b8f0975081711c4203'

# initialize the Flask-SocketIO
socketio = SocketIO(app)
CHANNELS = ['general']
MESSAGES = {'messages': [], 'displayName': [], 'timeStamp': []}

@app.route("/", methods=['POST', 'GET'])
def chat():

    return render_template("chat.html", channels = CHANNELS, messages = MESSAGES)


#New channel
@socketio.on('new channel')
def newChannel(data):
    newChannel = data['channel']
    # check if the channel is already exited in the list
    if (newChannel in CHANNELS):
        print(f"\n\nduplicate exits\n\n")
    else:
        CHANNELS.append(newChannel)
        print(f"\n\n{CHANNELS}\n\n")
        emit('add channel', newChannel, broadcast = True)

#Incoming Message
@socketio.on('incoming msg')
def message(data):
    message = data['message']
    timeStamp = strftime('%b-%d %I:%M%p', localtime())
    displayName = data['displayName']
    channel = data['channel']
    MESSAGES['messages'].append(message)
    MESSAGES['displayName'].append(displayName)
    MESSAGES['timeStamp'].append(timeStamp)
    print(f"\n\n{MESSAGES}\n\n{timeStamp}\n\n{displayName}\n\n{channel}\n\n")
    socketio.emit('new message', {'message': message, 'timeStamp': timeStamp, 'displayName': displayName, 'channel': channel}, channel = channel)


# Join Channel
@socketio.on('join')
def join(data):
    displayName = data['displayName']
    channel = data['channel']
    join_room(channel)
    print(f"\n\nChannedl joined for {channel} by {displayName}\n\n")
    message = f"{displayName} has joined the {channel} Channel."
    socketio.emit('message', {"message": message}, channel = channel)

# Leave Channel
@socketio.on('leave')
def leave(data):
    displayName = data['displayName']
    channel = data['channel']
    leave_room(channel)
    print(f"\n\nChannedl left for {channel} by {displayName}\n\n")
    message = f"{displayName} has left the {channel} Channel."
    socketio.emit('message', {"message": message}, channel = channel)

if __name__ == "__main__":
    socketio.run(app, debug=True)
