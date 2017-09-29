
export function processServerResp(response: any) {
    if (response.success) {
        return response;
    } else {
        const errorMsg = response.errors ? response.errors.join('') : 'unknown';
        alert('Server Error: ' + errorMsg);
        throw Error(response.errors);
    }
}

export function serverFetch(route: string, params?: Object, init?: RequestInit) {
    return fetch(route + queryParams(params), init)
        .then(response => response.json())
        .then(processServerResp);
}

export function serverPost(route: string, params?: Object, postData?: Object) {
    const data = new FormData();
    if (postData) {
        Object.keys(postData).forEach(key => {
            let val = postData[key];
            if (typeof val === 'object') {
                val = JSON.stringify(val);
            }
            data.append(key, val);
        });
    }
    
    const init = {
        method: 'POST',
        body: data
    };

    return serverFetch(route, params, init);
}

function queryParams(params?: Object) {
    if (params === undefined) {
        return '';
    }

    return Object.keys(params)
        .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
        .join('&');
}
