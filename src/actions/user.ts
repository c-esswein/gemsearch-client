
import { SpotifyUser } from 'api/spotify';

export type Actions = SetCurrentUserAction | ClearCurrentUserAction;


export interface SetCurrentUserAction {
    type: 'SET_CURRENT_USER';
    currentUser: SpotifyUser;
}
export function setCurrentUser(currentUser: SpotifyUser): SetCurrentUserAction {
    return {
        type: 'SET_CURRENT_USER',
        currentUser
    };
}

export interface ClearCurrentUserAction {
    type: 'CLEAR_CURRENT_USER';
}
export function clearCurrentUser(): ClearCurrentUserAction {
    return {
        type: 'CLEAR_CURRENT_USER',
    };
}
