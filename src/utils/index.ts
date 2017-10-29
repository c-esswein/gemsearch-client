
/**
 * Wrapper for fetch to set XMLHttpRequest header. Response from server is 
 * pretty printed (and huge) otherwise.
 * @inheritDoc
 */
export function xFetch(input: RequestInfo, init: RequestInit = {}) {
    init = {headers: {'X-Requested-With': 'XMLHttpRequest'}, ...init};
    return fetch(input, init);
}

/**
 * Returns new promise which will be resolved after ms milliseconds.
 */
export function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
