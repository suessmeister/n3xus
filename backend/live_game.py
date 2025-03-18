# Gets live game data for a given game 

import datetime
from flask import Flask, jsonify
import requests
from flask_cors import CORS

import time


def error_response(status_code, message):
    return jsonify({'error': message}), status_code

# use the API to get the current game given a game ID
MLB_API_URL = "https://statsapi.mlb.com/api/v1.1/game/{game_id}/feed/live"

def get_live_data(game_id):
   url = MLB_API_URL.format(game_id=game_id)
   response = requests.get(url)
   
   if response.status_code != 200:
      return error_response(404, "Game not found")
   
   game = response.json()

   if game['gameData']['status']['abstractGameState'] != 'Live':
      time.sleep(5)
      get_live_data(game_id)
   
   
   get_current_play(game)
   
def get_current_play(game):
   game_info = []
   index = 0
   current_play = game['liveData']['plays']['currentPlay']
   
   isPitch = current_play['playEvents'][-1]['isPitch']
   strike = current_play['playEvents'][-1]['details']['isStrike']
   ball = current_play['playEvents'][-1]['details']['isBall']
   
   print("isPitch: ", isPitch)
   print("strike: ", strike)
   print("ball: ", ball)
   
   





    
