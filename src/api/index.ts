
export function processServerResp(response: any) {
    if (response.success) {
        return response;
    } else {
        const errorMsg = response.errors ? response.errors.join('') : 'unknown';
        alert('Server Error: ' + errorMsg);
        throw Error(response.errors);
    }
}

export function serverFetch(route: string, params: Object) {
    return fetch(route + queryParams(params))
        .then(response => response.json())
        .then(processServerResp);
}

function queryParams(params: Object) {
    return Object.keys(params)
        .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
        .join('&');
}
