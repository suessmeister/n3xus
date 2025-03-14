# Gets Current MLB Games for the day. Runs once per day, resetting at 12am CST

import datetime
from flask import Flask, jsonify
import requests

app = Flask(__name__)
base_url = "https://statsapi.mlb.com/api/v1/schedule"
def game_collector():
   
   # date = datetime.date.today().strftime("%y-%m-%d")
   date = "2025-03-14"
   params = {
      "date" : date,
      "sportId" : 1,
   }
   
   response = requests.get(base_url, params=params)
   result = response.json()
   
   games_count = result.get("totalGames", [])
   # print(games_count)
   
   games_today = []
   index = 0
   for date in result.get("dates", []):
      for game in date.get("games", []):
         game_data = {"id": index, 
                      "gameId": game["gamePk"],
                      "homeTeam": game["teams"]["home"]["team"]["name"],
                      "awayTeam": game["teams"]["away"]["team"]["name"], 
                      "startTime": game["gameDate"].split('T')[1]}
         
         games_today.append(game_data)
   
   return games_today
   
# setting up an api to access the games! 
@app.route("/games", methods=["GET"])
def get_games():
    games = game_collector()  
    return jsonify(games)

if __name__ == "__main__":
    app.run(debug=True, port=5000)
   