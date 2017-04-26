class Game(object):
	players = []

	# Takes in the creator name
	def __init__(self, players):
		self.players = players

	# when somebody accepts
	# the invitation
	def join_game(self, player):
		self.players.append(player)
		return '{} joined in game'.format(player)

	def leave_game(self, player):
		if player in self.players:
			print('{} has left the match'.format(player))
			self.players.remove(player)
		else:
			print('{} is not in the game'.format(player))

	def start_game(self):
		return 'The match has been started!'

	def cancel_game(self):
		return 'The match got canceled!'