import { CONFIG } from 'config';

const stateKey = 'spotify_auth_state';

/**
 * Obtains parameters from the hash of the URL.
 * 
 * @return Object
 */
function getHashParams(): any {
    const hashParams = {};
    let e;
    const r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    while (e = r.exec(q)) {
        hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
}

/**
 * Generates a random string containing numbers and letters.
 * 
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
function generateRandomString(length) {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}


export interface SpotifyUser {
    display_name: string,
    id: string,
    images: ImageData[],
}

/**
 * Returns user profile. Throws exception if no token is set.
 * 
 */
export function getUserInfo(): Promise<SpotifyUser> {
    const accessToken = getAccessToken();

    if (!accessToken) {
        throw new Error('access token is not set');
    }

    return fetch('https://api.spotify.com/v1/me', {
        headers: {
            'Authorization': 'Bearer ' + accessToken
        }
    })
    .then(response => response.json())
    .then(result => {
        if (!result) {
            throw new Error('no spotify result object');
        }
        if (result.error) {
            if (result.error.status === 401) {
                // token is not valid or has expired
                logout();
            }
            throw new Error('spotify error: ' + JSON.stringify(result.error));
        }

        return result as Promise<SpotifyUser>;
    });
}

/**
 * Checks url for redirect auth tokens. If they are present, access token is 
 * stored and hash params are cleared.
 */
export function checkUrlForAuth() {
    const params = getHashParams();
    const accessToken = params.access_token,
        state = params.state,
        storedState = localStorage.getItem(stateKey);

    if (!accessToken) {
        return false;
    }

    if (state == null || state !== storedState) {
        throw new Error('There was an error during the authentication');
    } else {
        localStorage.setItem(stateKey + '_access-token', accessToken);
    }

    localStorage.removeItem(stateKey);
    // remove hash from url
    document.location.hash = '';

    return true;
}

export function getAccessToken() {
    return localStorage.getItem(stateKey + '_access-token');
}

/**
 * Removes access token from local storage.
 */
export function logout() {
    localStorage.removeItem(stateKey + '_access-token');
}


export function authorize() {    
    const state = generateRandomString(16);
    localStorage.setItem(stateKey, state);

    // TODO
    const scopes = [
        'user-library-read',
    ];

    let url = 'https://accounts.spotify.com/authorize';
    url += '?response_type=token';
    url += '&client_id=' + encodeURIComponent(CONFIG.SPOTIFY_CLIENT_ID);
    url += '&scope=' + encodeURIComponent(scopes.join(' '));
    url += '&redirect_uri=' + encodeURIComponent(CONFIG.SPOTIFY_REDIRECT_URI);
    url += '&state=' + encodeURIComponent(state);
    window.location.href = url;
}

