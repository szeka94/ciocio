class Game:

    class MatchActions:
        players = []

        def __init__(self, creator):
            Game.MatchActions.players.append(creator)

        @staticmethod
        def get_num_players():
            return int(len(Game.MatchActions.players))

        @staticmethod
        def get_players():
            return Game.MatchActions.players

        def join_match(self, player):
            num = Game.MatchActions.get_num_players()
            if num == 4:
                return False
            Game.MatchActions.players.append(player)
            return True

        def leave_match(self, player):
            Game.MatchActions.players.remove(player)

    class __Game:
        def __init__(self, creator):
            self.creator = creator
            self.actions = Game.MatchActions(creator)

        def start_game(self):
            num = self.actions.get_num_players()
            if num < 4:
                return {'message': '{} more people to go!'.format((4 - num)) }
            return {
                'message': 'The game has been started',
                'players': self.actions.get_players(),
            }

        def __str__(self):
            return repr(self) + self.creator

    instance = None

    def __init__(self, creator=None):
        if not Game.instance:
            Game.instance = Game.__Game(creator)

    def __getattr__(self, name):
        return getattr(self.instance, name)