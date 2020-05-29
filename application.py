import os

from flask import Flask, render_template
from flask_socketio import SocketIO, emit, send

# config the app
app = Flask(__name__)
app.config["SECRET_KEY"] = '22e4d35d374362b8f0975081711c4203'

# initialize the Flask-SocketIO
socketio = SocketIO(app)


@app.route("/")
def index():
    return render_template("index.html")

@socketio.on('message')
def message(data):
    print(f"\n\n{data}\n\n")
    send(data)

if __name__ == "__main__":
    socketio.run(app, debug=True)
