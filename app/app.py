from flask import Flask, url_for, request, jsonify
import json
from flask_cors import CORS, cross_origin

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
app.config['CORS_HEADERS'] = 'Content-Type'

# You should solve this with Access-Control-Allow-Origin header
# Now its accessuble
CORS(app)

dumy_users = [
	{
		'face': 'img/profile_image.jpg',
		'name': 'Ata',
	},
	{
		'face': 'img/profile_image.jpg',
		'name': 'Andras',
	},
	{
		'face': 'img/profile_image.jpg',
		'name': 'Dani',
	},
	{
		'face': 'img/profile_image.jpg',
		'name': 'Dragos',
	},
	{
		'face': 'img/profile_image.jpg',
		'name': 'Norbi',
	},
	{
		'face': 'img/profile_image.jpg',
		'name': 'Szeka',
	},
]

@app.route("/api/users", methods=['GET', 'POST'])
def add_new_user():
	if request.method == 'GET':
		return jsonify(dumy_users)
	else:
		print(request.data)
		return jsonify([{'resp' : 'Hey yea'}])

if __name__ == "__main__":
	app.run(debug=True)