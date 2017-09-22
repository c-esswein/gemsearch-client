import { DataItem } from 'types';

export function processServerResp(response: any) {
    if (response.success) {
        return response.data;
    } else {
        alert('Error');
        throw Error(response.errors);
    }
}

function serverFetch(route: string, params: Object) {
    return fetch(route + queryParams(params))
        .then(response => response.json())
        .then(processServerResp);
}

function queryParams(params: Object) {
    return Object.keys(params)
        .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
        .join('&');
}

export function queryForItems(query: DataItem[], typeFilter: string[]) {
    const queryIds = query.map(item => item.id);

    const params = {
        'ids': queryIds.join('|'),
        'types': typeFilter.join('|'),
        'minClusterDistance': 0.1
    };
    
    return serverFetch('/api/query?', params);
}
