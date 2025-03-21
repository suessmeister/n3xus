# Gets live game data for a given game 

import datetime
from flask import Flask, jsonify
import requests
from flask_cors import CORS

import time

app = Flask(__name__)
CORS(app)


def error_response(status_code, message):
   with app.app_context():
    return jsonify({'error': message}), status_code

# use the API to get the current game given a game ID
MLB_API_URL = "https://statsapi.mlb.com/api/v1.1/game/{game_id}/feed/live"

def get_live_data(game_id):
   url = MLB_API_URL.format(game_id=game_id)
   response = requests.get(url)
   
   if response.status_code != 200:
      return error_response(404, "Game not found")
   
   game = response.json()
   return game
   
   
def get_current_play(game):
   game_info = []
   index = 0
   current_play = game['liveData']['plays']['currentPlay']
   
   if not current_play['playEvents']:
    print("No pitch events found.")
    return None, None, None, None, None, None
   
   isPitch = current_play['playEvents'][-1]['isPitch']
   if isPitch: 
      strike = current_play['playEvents'][-1]['details']['isStrike']
      ball = current_play['playEvents'][-1]['details']['isBall']
      pitch_x_location = current_play['playEvents'][-1]['pitchData']['coordinates']['x']
      pitch_y_location = current_play['playEvents'][-1]['pitchData']['coordinates']['y']
      count = current_play['count']
   else:
      strike = False
      ball = False
      pitch_x_location = 0
      pitch_y_location = 0
      count = None

   
   return isPitch, strike, ball, pitch_x_location, pitch_y_location, count





    
