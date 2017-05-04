import json
from itsdangerous import (TimedJSONWebSignatureSerializer
							as Serializer, BadSignature, SignatureExpired)
from functools import wraps 	

from flask import Flask, url_for, request, jsonify, g
from flask import session
from flask_cors import CORS, cross_origin
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO, emit
from game import Game




app = Flask(__name__)
############# Config #############
app.config['SECRET_KEY'] = 'secret!'
app.config['CORS_HEADERS'] = 'Content-Type'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///test.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True

socketio = SocketIO(app)
db = SQLAlchemy(app)
# You should solve this with Access-Control-Allow-Origin header
# Now its accessuble
CORS(app)


############# Models #############
class User(db.Model):
	id = db.Column(db.Integer, primary_key=True)
	name = db.Column(db.String(69), unique=True)
	face = db.Column(db.String(69))
	
	def __init__(self, name, face='img/profile_image.jpg'):
		self.name = name
		self.face = face

	def generate_auth_token(self):
		s = Serializer(app.config['SECRET_KEY'])
		token = s.dumps({ 'id': self.id })
		return token
	
	@staticmethod
	def verify_auth_token(token):
		s = Serializer(app.config['SECRET_KEY'])
		try:
			data = s.loads(token)
		except SignatureExpired:
			return None # valid token, but expired
		except BadSignature:
			return None # invalid token
		user = User.query.filter_by(id=data['id']).first()
		return user

	def __repr__(self):
		return '<User: {}>'.format(self.name)



############# Helpers #############
def serialize_user(users):
	data = []
	for user in users:
		tmp = {
			'id': user.id,
			'name': user.name,
			'face': user.face,
		}
		data.append(tmp)
	return data


############# Routes #############
@app.route("/api/users", methods=['GET', 'POST'])
def add_new_user():
	if request.method == 'GET':
		users = User.query.all()
		data = serialize_user(users)
		return jsonify(data)
	else:
		data = json.loads(request.get_data(as_text=True))
		user = User(name=data['nickname'])
		try:	
			db.session.add(user)
			db.session.commit()
			status = 'success'
		except:
			status = 'error'
		token = user.generate_auth_token()
		return jsonify({ 'token': token.decode('UTF-8'),
						'username': user.name,
						'result': status })

@app.route('/api/users/<username>/delete', methods=['POST'])
def delete_user(username):
	token = request.data.decode('utf-8')
	user = User.query.filter_by(name=username).first()
	if user is None:
		return jsonify({'error': 'There is no such a user called {}'.format(username)}), 404
	if user.verify_auth_token(token) is None:
		return jsonify({'error': 'You cannot delete this user'}), 400
	db.session.delete(user)
	db.session.commit()
	return jsonify({'message': 'User deleted successfully'})

# Maybe I dont need this
# @app.route('/api/match/create', methods=['POST'])
# def create_match():
# 	data = json.loads(request.get_data(as_text=True))
# 	if 'invited' in data and len(a) == 4:
# 		players = [creator]
# 		players.append(player) for player in invited
# 		game = Game(players)

# 	return jsonify({'message': 'Success'})


# SocketIO - msg sender
match_created = False

@socketio.on('new match')
def handle_new_match(data):
	global match_created
	if match_created:		
		resp = json.dumps({'message': 'You cannot create match!'})
		emit('new match response', resp)
	else: 
		match_created = True
		game = Game(data)
		resp = json.dumps({
					'message': '{} created a match'.format(data),
					'player_num': 1,
					'players': game.actions.get_players(),
					'creator': data,
						})
		emit('new match response', resp, broadcast=True)

@socketio.on('invite player')
def handle_invitation(data):
	emit(data['person']['name'], data['creator'], broadcast=True)

@socketio.on('join game')
def join_game(player):
	game=Game()
	if not game.actions.join_match(player):
		data = 'Error'
		emit('joined', data, broadcast=True)

	print('Joined {}'.format(player))
	data = json.dumps({'match_created': match_created,
				'players': game.actions.get_players(),
				'num_players': game.actions.get_num_players(),})
	emit('joined', data, broadcast=True)



if __name__ == "__main__":
	socketio.run(app, debug=True)