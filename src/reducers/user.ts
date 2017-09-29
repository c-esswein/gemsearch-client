import { Actions } from 'actions';
import { SpotifyUser } from 'api/spotify';

export interface UserState {
    currentUser: SpotifyUser | null,
}

const initialState: UserState = {
    currentUser: null,
};

export function userReducer(state: UserState = initialState, action: Actions): UserState {
  switch (action.type) {
    case 'SET_CURRENT_USER':
      return { 
        ...state, 
        currentUser: action.currentUser
      };
    case 'CLEAR_CURRENT_USER':
      return {
        ...state,
        currentUser: null
      };
    default:
      return state;
  }
}
