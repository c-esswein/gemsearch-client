import * as spotifyApi from 'api/spotify';
import * as userApi from 'api/user';
import { setCurrentUser, setCurrentDbUser, SetCurrentDbUserAction } from 'actions/user';
import * as viewActions from 'actions/views';
import { takeEvery, call, put } from 'redux-saga/effects';
import { delay } from "utils";

export const SAGAS = [
    watchSpotifyAuthCheck,
    watchSetDbUser
];

/**
 * Action creator for saga.
 */
export function checkSpotifyAuth() {
    return {
        type: 'SAGA_CHECK_SPOTIFY_AUTH'
    };
}

export function* watchSpotifyAuthCheck() {
    yield takeEvery('SAGA_CHECK_SPOTIFY_AUTH', handleCheckSpotifyAuth);
}

export function* watchSetDbUser() {
    yield takeEvery('SET_CURRENT_DB_USER', handleSetDbUser);
}


/**
 * Check if access token is set or contained in url. If so, load spotify user
 * and check current state of user in own db.
 */
function* handleCheckSpotifyAuth() {
    if (spotifyApi.checkUrlForAuth() || spotifyApi.getAccessToken()) {
        try {
            const user = yield call(spotifyApi.getUserInfo);
            yield call(handleSpotifyUserLoaded, user);
        } catch (ex) {
            console.error(ex);
            alert('spotify auth error');
        }
    }
}

/**
 * Handles successful login with spotify account. (initial or relogin)
 */
function* handleSpotifyUserLoaded(user: spotifyApi.SpotifyUser) {
    // set user state
    yield put(setCurrentUser(user));

    // check api for known user
    const hashedUsername = userApi.hashUserName(user.id);    
    const dbUser = yield call(userApi.checkUser, hashedUsername);
    yield put(setCurrentDbUser(dbUser));

    if (dbUser === null) {
        yield call(handleNewUser, user);
    }
}

/**
 * First login of user.
 * --> start syncing music.
 */
function* handleNewUser(user: spotifyApi.SpotifyUser) {
    try {
        // open connect dialog to show status
        yield put(viewActions.setConnectDialogOpenState(true));
        
        const token = spotifyApi.getAccessToken();
        const dbUser = yield call(userApi.syncMusic, user.id, token);
        yield put(setCurrentDbUser(dbUser));
    } catch (error) {
        console.error(error);
        alert('Unknown error while syncing your spotify music:' + error);
    }
}

/**
 * Handles new db user set. If user is not yet fully embedded, status will be updated
 * again after delay.
 */
function* handleSetDbUser(action: SetCurrentDbUserAction) {
    const user = action.currentUser;
    if (user !== null && user.userStatus !== 'EMBEDDED') {
        yield call(delay, 10 * 1000);

        // update status
        const dbUser = yield call(userApi.checkUser, user.userName);
        yield put(setCurrentDbUser(dbUser));    
    }
}
