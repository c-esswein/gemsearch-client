import { Actions } from 'actions';
import { SpotifyUser } from 'api/spotify';
import { DbUser } from 'api/user';

export interface UserState {
    currentUser: SpotifyUser | null,
    currentDbUser: DbUser | null,
    useUserAsContext: boolean,
}

const initialState: UserState = {
    currentUser: null,
    currentDbUser: null,
    useUserAsContext: true,
};

/**
 * Returns true if user is contained in embedding and can be used for query.
 */
export function isUserEmbedded(user: DbUser) {
  return user && (user.userStatus === 'EMBEDDED' || user.userStatus === 'PARTIAL_EMBEDDED');
}

/**
 * Returns true if user is fully embedded (no ongoing sync).
 */
export function isUserFullyEmbedded(user: DbUser) {
  return user && user.userStatus === 'EMBEDDED';
}


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
    case 'CLEAR_CURRENT_USER':
      return {
        ...state,
        currentUser: null
      };
    case 'SET_USE_USER_AS_CONTEXT':
      return {
        ...state,
        useUserAsContext: action.useUserAsContext
      };
    default:
      return state;
  }
}
