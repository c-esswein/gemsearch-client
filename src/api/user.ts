import { serverFetch, serverPost, processServerResp } from 'api';
import {sha256} from 'js-sha256';


export type UserStatus = 'SPOTIFY_SYNCED' | 'EMBEDDED' | 'PARTIAL_EMBEDDED';

export interface DbUser {
    userName: string,
    userStatus: UserStatus,
    latest_sync: number,
    missingTrackCount: number,
    syncedTracks: number,
}

/**
 * Checks if given user is known in system. Returnes DbUser obj or 
 * null if user is not in DB.
 */
export function checkUser(hashedUsername: string): Promise<DbUser | null> {
    return serverFetch('/api/user/check/'+hashedUsername).
        then(processServerResp).
        then(response => response.data);
}


export function hashUserName(username: string): string {
    return sha256(username);
}


/**
 * Sync spotify music lib with server.
 */
export function syncMusic(userName: string, token: string): Promise<DbUser> {
    const hashedUsername = hashUserName(userName);    
    return serverPost('/api/user/sync', undefined, {
        userName: hashedUsername,
        token
    }).
    then(processServerResp).
    then(response => response.data);    
}
