class Game:


    def __init__(self, creator=None):
        self.creator = creator
        self.players = []
        self.in_progress = False

    def create_game(self, creator):
        self.creator = creator
        self.in_progress = True
        self.players.append(creator)

    def join_match(self, player):
        num = self.get_num_players()
        if num == 4:
            return False
        self.players.append(player)
        return True

    def get_num_players(self):
        return int(len(self.players))

    def get_players(self):
        return self.players

    def leave_match(self, player):
        self.players.remove(player)

    def start_game(self):
        num = self.get_num_players()
        if num < 4:
            return False
        self.in_progress = True
        return True

    def game_over(self):
        self.players = []
        self.in_progress = False
        self.creator = None