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

game = Game()

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

@app.route('/api/match/initialize', methods=['GET'])
def initalize_data():
	return jsonify({
			'match_created' : game.in_progress,
			'num_players' : game.get_num_players(),
			'players' : game.get_players(),
			'creator' : game.creator
		})


@app.route('/api/match/new', methods=['POST'])
def create_new_match():
	data = json.loads(request.get_data(as_text=True))
	username = data['username']
	if game.in_progress:
		return jsonify({ 'message' : 'There is a game in progress' }), 404
	game.create_game(username)
	game.in_progress = True
	game_type = data.get('type', None)
	if game_type is not None:
		for player in data['players']:
			game.join_match(player)
	resp = json.dumps({
				'type' : game_type,
				'match_created' : game.in_progress,
				'num_players' : game.get_num_players(),
				'players' : game.get_players(),
				'creator' : game.creator
			})
	socketio.emit('new match response', resp, broadcast=True)
	return jsonify(resp)



@app.route('/api/match/delete', methods=['POST'])
def delete_match():
	data = json.loads(request.get_data(as_text=True))
	username = data['username']
	if not game.in_progress:
		return jsonify({'error' : 'Game not found'}), 404
	if not game.creator == username:
		return jsonify({'error' : '{} cannot delete this game!'
						.format(username)}), 400
	game.game_over()
	players = json.dumps({'players' : game.get_players()})
	# should brodcast a message to refresh the page
	socketio.emit('refresh', brodcast=True)
	print(game.in_progress)
	return jsonify({
			'match_created' : game.in_progress,
			'num_players' : game.get_num_players(),
			'players' : game.get_players(),
			'creator' : game.creator
		})


@app.route('/api/match/join', methods=['POST'])
def join_match():
	data = json.loads(request.get_data(as_text=True))
	username = data['username']
	if game.in_progress:
		game.join_match(username)
		socketio.emit('refresh', brodcast=True)
		return jsonify({
			'match_created' : game.in_progress,
			'num_players' : game.get_num_players(),
			'players' : game.get_players(),
			'creator' : game.creator
		})
	return jsonify({'error' : 'Match not found'}), 404


@app.route('/api/match/invite', methods=['POST'])
def invite_somebody():
	data = json.loads(request.get_data(as_text=True))
	print(data)
	socketio.emit(data['person']['name'], data['creator'], broadcast=True)
	return jsonify({ 'message' : 'Looks good!' })


# SocketIO - msg sender


if __name__ == "__main__":
	socketio.run(app, debug=True)