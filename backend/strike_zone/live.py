# for the architecture of managing one live game
import requests
from .live_methods import get_live_data, get_current_play

game_id = 778715


def pitch_collector(game_id):
    
    json_data = {"game_id": game_id}
    
    game = get_live_data(game_id)

    # make sure the game is live
    if game['gameData']['status']['abstractGameState'] == 'Final':
        print("Game is now over. ")
        exit()


    isPitch, strike, ball, pitch_x_location, pitch_y_location, count = get_current_play(game)

    json_data = {
        "isPitch": isPitch,
        "strike": strike,
        "ball": ball,
        "pitch_x_location": pitch_x_location,
        "pitch_y_location": pitch_y_location,
        "count": count
    }


    if isPitch == False:
        print("no pitch")
        exit()
        
    return json_data








