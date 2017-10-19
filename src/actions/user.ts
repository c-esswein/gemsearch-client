
import { SpotifyUser } from 'api/spotify';
import { DbUser, SyncResult } from 'api/user';

export type Actions = 
    & SetCurrentUserAction 
    | ClearCurrentUserAction 
    | SetCurrentDbUserAction 
    | SetSpotifySyncResultAction;


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

export interface SetCurrentDbUserAction {
    type: 'SET_CURRENT_DB_USER';
    currentUser: DbUser;
}
export function setCurrentDbUser(currentUser: DbUser): SetCurrentDbUserAction {
    return {
        type: 'SET_CURRENT_DB_USER',
        currentUser
    };
}

export interface SetSpotifySyncResultAction {
    type: 'SET_SPOTIFY_SYNC_RESULT';
    result: DbUser & SyncResult;
}
export function setSpotifySyncResult(result: DbUser & SyncResult): SetSpotifySyncResultAction {
    return {
        type: 'SET_SPOTIFY_SYNC_RESULT',
        result
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
