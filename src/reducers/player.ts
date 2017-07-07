import { Actions } from 'actions';
import { Track } from 'types';

export interface PlayerState {
    currentTrack?: Track,
    isPlaying: boolean,
}

const initialState: PlayerState = {
  isPlaying: false,
};

export function playerReducer(state: PlayerState = initialState, action: Actions): PlayerState {
  switch (action.type) {
    case 'PLAY_TRACK':
      return { 
        ...state, 
        isPlaying: true,
        currentTrack: action.track
      };
    case 'SET_PLAYING':
      return { 
        ...state, 
        isPlaying: action.isPlaying
      };
    default:
      return state;
  }
}
