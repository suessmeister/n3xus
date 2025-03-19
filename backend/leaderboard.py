from flask import Flask, jsonify, request
import json
import os
import datetime

# Path to store leaderboard data
LEADERBOARD_FILE = os.path.join(os.path.dirname(__file__), 'leaderboard_data.json')

# Initialize leaderboard if it doesn't exist
def init_leaderboard():
    if not os.path.exists(LEADERBOARD_FILE):
        with open(LEADERBOARD_FILE, 'w') as f:
            json.dump({
                "players": {},
                "lastUpdated": datetime.datetime.now().isoformat()
            }, f)

# Get current leaderboard data
def get_leaderboard_data():
    init_leaderboard()
    with open(LEADERBOARD_FILE, 'r') as f:
        return json.load(f)

# Save leaderboard data
def save_leaderboard_data(data):
    data["lastUpdated"] = datetime.datetime.now().isoformat()
    with open(LEADERBOARD_FILE, 'w') as f:
        json.dump(data, f)

# Update player stats
def update_player(player_id, username, win=False):
    data = get_leaderboard_data()
    
    if player_id not in data["players"]:
        data["players"][player_id] = {
            "id": player_id,
            "username": username,
            "wins": 0,
            "gamesPlayed": 0,
            "lastPlayed": datetime.datetime.now().isoformat()
        }
    
    player = data["players"][player_id]
    player["gamesPlayed"] += 1
    if win:
        player["wins"] += 1
    player["lastPlayed"] = datetime.datetime.now().isoformat()
    
    save_leaderboard_data(data)
    return player

# Get top players
def get_top_players(limit=10):
    data = get_leaderboard_data()
    players = list(data["players"].values())
    
    # Sort by wins (descending) then by games played (ascending)
    players.sort(key=lambda x: (-x["wins"], x["gamesPlayed"]))
    
    return players[:limit]

# Record a multiplayer game result
def record_game_result(player1_id, player1_name, player2_id, player2_name, winner_id):
    update_player(player1_id, player1_name, win=(winner_id == player1_id))
    update_player(player2_id, player2_name, win=(winner_id == player2_id))

# Flask routes to be integrated with the main app
def register_leaderboard_routes(app):
    @app.route("/leaderboard", methods=["GET"])
    def get_leaderboard():
        limit = request.args.get('limit', default=10, type=int)
        return jsonify(get_top_players(limit))
    
    @app.route("/leaderboard/player/<player_id>", methods=["GET"])
    def get_player(player_id):
        data = get_leaderboard_data()
        if player_id in data["players"]:
            return jsonify(data["players"][player_id])
        return jsonify({"error": "Player not found"}), 404
    
    @app.route("/games/result", methods=["POST"])
    def submit_game_result():
        data = request.json
        required_fields = ["player1Id", "player1Name", "player2Id", "player2Name", "winnerId"]
        
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        record_game_result(
            data["player1Id"],
            data["player1Name"],
            data["player2Id"],
            data["player2Name"],
            data["winnerId"]
        )
        
        return jsonify({"success": True}) 