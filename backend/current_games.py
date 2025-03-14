# Gets Current MLB Games for the day. Runs once per day, resetting at 12am CST

import datetime
import requests

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
   
   
   
   print(games_today)   
game_collector()
   