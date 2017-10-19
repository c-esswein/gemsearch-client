import { Actions } from 'actions';
import { SpotifyUser } from 'api/spotify';
import { DbUser, SyncResult } from 'api/user';

export interface UserState {
    currentUser: SpotifyUser | null,
    currentDbUser: DbUser | null,
    syncResult: SyncResult,
}

const initialState: UserState = {
    currentUser: null,
    currentDbUser: null,
    syncResult: null,
};

export function userReducer(state: UserState = initialState, action: Actions): UserState {
  switch (action.type) {
    case 'SET_CURRENT_USER':
      return { 
        ...state, 
        currentUser: action.currentUser
      };
    case 'SET_CURRENT_DB_USER':
      return { 
        ...state, 
        currentDbUser: action.currentUser
      };
    case 'SET_SPOTIFY_SYNC_RESULT':
      return { 
        ...state, 
        syncResult: {syncedTracks: action.result.syncedTracks},
        currentDbUser: action.result
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
