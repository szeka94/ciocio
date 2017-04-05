from flask import Flask, url_for
from flask_socketio import SocketIO


app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
app.config['CLIENT_ID'] = '227902951678-a49mp4eq1hqf6tjflnado8d5adnc50ed.apps.googleusercontent.com'
app.config['CLIENT_SECRET'] = 'yLbY_1HX94jg4nXjxxYh-uLE'

@app.route("/")
def hello():
	return 'Hi there'


if __name__ == "__main__":
	app.run(debug=True)