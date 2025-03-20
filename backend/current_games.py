# Gets Current MLB Games for the day. Runs once per day, resetting at 12am CST

import datetime
from flask import Flask, jsonify, request
import requests
from flask_cors import CORS
import json
import os
from strike_zone.live import pitch_collector

app = Flask(__name__)
CORS(app)

base_url = "https://statsapi.mlb.com/api/v1/schedule"

# Initialize pitch data storage
pitch_data = {}

# Get Games for Today. Games now contains the time, home team, away team, and game id. 
def game_collector():
   games = []

   date = datetime.date.today().strftime("%Y-%m-%d")
   params = {
      "date" : str(date),
      "sportId" : 1,
   }
   
   response = requests.get(base_url, params=params, timeout=10)
   result = response.json()
   print(result)
   
   games_count = result.get("totalGames", [])
   
   index = 0
   for date in result.get("dates", []):
      for game in date.get("games", []):
         game_data = {"id": index, 
                      "gameId": game["gamePk"],
                      "homeTeam": game["teams"]["home"]["team"]["name"],
                      "awayTeam": game["teams"]["away"]["team"]["name"], 
                      "startTime": game["gameDate"]}
         
      
         games.append(game_data)
         index += 1
   
   return games

# Get All Game Data for Today.
@app.route("/games", methods=["GET"])
def get_games(): 
    return jsonify(games)
 
# Get Specific Game Data from Game_ID
@app.route("/games/<int:game_id>", methods=["GET"])
def get_game(game_id):
    for game in games:
       if (game["gameId"] == game_id):
          return jsonify(game)
    return jsonify({"error": "Game not found"})


# Get Pitch Data from Game_ID
@app.route("/games/<int:game_id>/live_pitch", methods=["GET"])
def get_pitch(game_id):
    return jsonify(pitch_collector(game_id))




if __name__ == "__main__":
   games = game_collector()
   app.run(debug=True, port=5000)
   