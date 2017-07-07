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

export async function getAuthStatus() {
    const params = getHashParams();
    const access_token = params.access_token,
        state = params.state,
        storedState = localStorage.getItem(stateKey);

    if (access_token && (state == null || state !== storedState)) {
        throw Error('There was an error during the authentication');
    } else {
        localStorage.removeItem(stateKey);
        localStorage.setItem(stateKey + '_access-token', access_token);
        if (access_token) {
            return fetch('https://api.spotify.com/v1/me', {
                headers: {
                    'Authorization': 'Bearer ' + access_token
                }
            }).then(response => {
                console.log(response);
                return response;      
            });
        } else {
            return false;
        }
    }
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

