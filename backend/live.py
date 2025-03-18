# for the architecture of managing a live game
import requests
from live_game import get_live_data

# Fetch games from the Flask API
response = requests.get('http://127.0.0.1:5000/games')
games = response.json()
game_ids = [game['gameId'] for game in games]

for id in game_ids:
    print(id)
    
if (len(game_ids) == 0):
   print("no games")
    
for id in game_ids:
    get_live_data(id)

