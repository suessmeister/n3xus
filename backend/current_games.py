# Gets Current MLB Games for the day. Runs once per day, resetting at 12am CST

import datetime
from flask import Flask, jsonify, request
import requests
from flask_cors import CORS
# `from live_game import get_live_data`
from leaderboard import register_leaderboard_routes
import json
import os

app = Flask(__name__)
CORS(app)
base_url = "https://statsapi.mlb.com/api/v1/schedule"

# Path to store active multiplayer games
MULTIPLAYER_GAMES_FILE = os.path.join(os.path.dirname(__file__), 'multiplayer_games.json')

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

# Initialize multiplayer games storage
def init_multiplayer_games():
    if not os.path.exists(MULTIPLAYER_GAMES_FILE):
        with open(MULTIPLAYER_GAMES_FILE, 'w') as f:
            json.dump({
                "games": {},
                "lastUpdated": datetime.datetime.now().isoformat()
            }, f)

# Get current multiplayer games
def get_multiplayer_games():
    init_multiplayer_games()
    with open(MULTIPLAYER_GAMES_FILE, 'r') as f:
        return json.load(f)

# Save multiplayer games
def save_multiplayer_games(data):
    data["lastUpdated"] = datetime.datetime.now().isoformat()
    with open(MULTIPLAYER_GAMES_FILE, 'w') as f:
        json.dump(data, f)

# setting up an api to access the games! 
@app.route("/games", methods=["GET"])
def get_games(): 
    return jsonify(games)
 
@app.route("/games/<int:game_id>", methods=["GET"])
def get_game(game_id):
    for game in games:
       if (game["gameId"] == game_id):
          return jsonify(game)
    return jsonify({"error": "Game not found"})

# Multiplayer game routes
@app.route("/multiplayer/create", methods=["POST"])
def create_multiplayer_game():
    data = request.json
    required_fields = ["hostId", "hostName", "gameType"]
    
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400
    
    game_id = datetime.datetime.now().strftime("%Y%m%d%H%M%S") + data["hostId"][:8]
    
    multiplayer_data = get_multiplayer_games()
    
    multiplayer_data["games"][game_id] = {
        "id": game_id,
        "hostId": data["hostId"],
        "hostName": data["hostName"],
        "gameType": data["gameType"],
        "status": "waiting",
        "guestId": None,
        "guestName": None,
        "currentTurn": data["hostId"],
        "created": datetime.datetime.now().isoformat(),
        "lastUpdated": datetime.datetime.now().isoformat(),
        "gameState": {
            "points": {
                "host": 0,
                "guest": 0
            },
            "currentPitch": None
        }
    }
    
    save_multiplayer_games(multiplayer_data)
    
    return jsonify({
        "gameId": game_id,
        "game": multiplayer_data["games"][game_id]
    })

@app.route("/multiplayer/join/<game_id>", methods=["POST"])
def join_multiplayer_game(game_id):
    data = request.json
    required_fields = ["guestId", "guestName"]
    
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400
    
    multiplayer_data = get_multiplayer_games()
    
    if game_id not in multiplayer_data["games"]:
        return jsonify({"error": "Game not found"}), 404
    
    game = multiplayer_data["games"][game_id]
    
    if game["status"] != "waiting":
        return jsonify({"error": "Game is not available to join"}), 400
    
    game["guestId"] = data["guestId"]
    game["guestName"] = data["guestName"]
    game["status"] = "active"
    game["lastUpdated"] = datetime.datetime.now().isoformat()
    
    save_multiplayer_games(multiplayer_data)
    
    return jsonify(game)

@app.route("/multiplayer/games", methods=["GET"])
def get_available_multiplayer_games():
    multiplayer_data = get_multiplayer_games()
    available_games = {}
    
    for game_id, game in multiplayer_data["games"].items():
        if game["status"] == "waiting":
            available_games[game_id] = game
    
    return jsonify(available_games)

@app.route("/multiplayer/game/<game_id>", methods=["GET"])
def get_multiplayer_game(game_id):
    multiplayer_data = get_multiplayer_games()
    
    if game_id not in multiplayer_data["games"]:
        return jsonify({"error": "Game not found"}), 404
    
    return jsonify(multiplayer_data["games"][game_id])

@app.route("/multiplayer/game/<game_id>/throw", methods=["POST"])
def throw_pitch(game_id):
    data = request.json
    required_fields = ["playerId", "pitchCoordinates"]
    
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400
    
    multiplayer_data = get_multiplayer_games()
    
    if game_id not in multiplayer_data["games"]:
        return jsonify({"error": "Game not found"}), 404
    
    game = multiplayer_data["games"][game_id]
    
    if game["status"] != "active":
        return jsonify({"error": "Game is not active"}), 400
    
    if game["currentTurn"] != data["playerId"]:
        return jsonify({"error": "Not your turn"}), 400
    
    # Update game state with the pitch
    coordinates = data["pitchCoordinates"]
    pitch_result = calculate_pitch_result(coordinates)
    game["gameState"]["currentPitch"] = {
        "playerId": data["playerId"],
        "coordinates": coordinates,
        "result": pitch_result["result"],
        "points": pitch_result["points"]
    }
    
    # Update points
    if data["playerId"] == game["hostId"]:
        game["gameState"]["points"]["host"] += pitch_result["points"]
        game["currentTurn"] = game["guestId"]
    else:
        game["gameState"]["points"]["guest"] += pitch_result["points"]
        game["currentTurn"] = game["hostId"]
    
    game["lastUpdated"] = datetime.datetime.now().isoformat()
    
    # Check if game is over (player reaches 10 points)
    if (game["gameState"]["points"]["host"] >= 10 or 
        game["gameState"]["points"]["guest"] >= 10):
        game["status"] = "completed"
        winner_id = game["hostId"] if game["gameState"]["points"]["host"] >= 10 else game["guestId"]
        game["winnerId"] = winner_id
    
    save_multiplayer_games(multiplayer_data)
    
    return jsonify(game)

def calculate_pitch_result(coordinates):
    x, y = coordinates
    
    # Strike zone is divided into 9 sections (3x3 grid)
    # Center section (strike) = 1 point
    # Corner sections (corners) = 3 points
    # Edge sections (edges) = 2 points
    
    # Check if pitch is in strike zone (0.0-1.0 for both x and y)
    if 0.0 <= x <= 1.0 and 0.0 <= y <= 1.0:
        # Define zones within strike zone
        if 0.0 <= x < 0.33:
            if 0.0 <= y < 0.33:
                return {"result": "Corner Strike", "points": 3}
            elif 0.33 <= y < 0.67:
                return {"result": "Edge Strike", "points": 2}
            else:  # 0.67 <= y <= 1.0
                return {"result": "Corner Strike", "points": 3}
        elif 0.33 <= x < 0.67:
            if 0.0 <= y < 0.33 or 0.67 <= y <= 1.0:
                return {"result": "Edge Strike", "points": 2}
            else:  # 0.33 <= y < 0.67
                return {"result": "Center Strike", "points": 1}
        else:  # 0.67 <= x <= 1.0
            if 0.0 <= y < 0.33:
                return {"result": "Corner Strike", "points": 3}
            elif 0.33 <= y < 0.67:
                return {"result": "Edge Strike", "points": 2}
            else:  # 0.67 <= y <= 1.0
                return {"result": "Corner Strike", "points": 3}
    else:
        return {"result": "Ball", "points": 0}

# Register leaderboard routes
register_leaderboard_routes(app)

if __name__ == "__main__":
   games = game_collector()
   app.run(debug=True, port=5000)
   