import { DataItem } from 'types';
import { serverFetch } from 'api';
import { DbUser } from 'api/user';

export type Position3D = number[];

export interface Cluster {
    items: DataItem[],
    center: Position3D,
}

export interface QueryServerResult {
    // data: DataItem[],
    boundingBox: Position3D[],
    clusters: Cluster[],
}

export type SuggestionItem = DataItem & {
    highlightName: string,
};

/**
 * Query GEM for items. 
 */
export function queryForItems(query: DataItem[], typeFilter: string[], limit = 30, offset = 0, dbUser: DbUser = null): Promise<DataItem[]> {
    const queryIds = query.map(item => item.id);

    const params = {
        'ids': queryIds.join('|'),
        'types': typeFilter.join('|'),
        'limit': limit,
        'offset': offset,
        'user': dbUser ? dbUser.userName : undefined,
    };

    if (!params.user) {
        delete params.user;
    }
    
    return serverFetch('/api/query?', params)
        .then(result => result.data);
}

/**
 * Query GEM for items including 3D viz data. 
 */
export function queryForItemsForGraph(query: DataItem[], typeFilter: string[], limit = 30, offset = 0, dbUser: DbUser = null) {
    const queryIds = query.map(item => item.id);

    const params = {
        'ids': queryIds.join('|'),
        'types': typeFilter.join('|'),
        'minClusterDistance': 0.01,
        'limit': limit,
        'offset': offset,
        'user': dbUser ? dbUser.userName : undefined,
    };

    if (!params.user) {
        delete params.user;
    }
    
    return serverFetch('/api/query_viz?', params) as Promise<QueryServerResult>;
}


/**
 * Query GEM for items including 3D viz data. 
 */
export function queryGraphItemsAround(vec: Position3D, typeFilter: string[], limit = 30, offset = 0, dbUser: DbUser = null) {
    const params = {
        'vec': vec.join(','),
        'types': typeFilter.join('|'),
        'minClusterDistance': 0.01,
        'limit': limit,
        'offset': offset,
        'user': dbUser ? dbUser.userName : undefined,
    };

    if (!params.user) {
        delete params.user;
    }
    
    return serverFetch('/api/items_near_viz?', params) as Promise<QueryServerResult>;
}


/**
 * Get suggestions of items to autocomplete term.
 */
export function getSuggestForItems(searchTerm: string, typeFilter?: string): Promise<{data: SuggestionItem[]}> {
    const urlParam = encodeURIComponent(searchTerm.trim());
    const params: {typeFilter?: string} = {};

    if (typeFilter) {
        params.typeFilter = typeFilter;
    }

    return serverFetch('/api/suggest/' + urlParam, params);
}

/**
 * Returns graph neighbors for given node.
 */
export function getNeighbors(nodeId: string, typeFilter: string[]): Promise<{nodes: DataItem[]}> {
    return serverFetch('/api/neighbors/' + nodeId, {
        'types': typeFilter.join('|')
    });   
}

/**
 * Load recommendations for given user.
 */
export function queryForRecommendations(user: DbUser, typeFilter: string[], limit = 30, offset = 0): Promise<DataItem[]> {

    const params = {
        'types': typeFilter.join('|'),
        'limit': limit,
        'offset': offset,
        'user': user.userName,
    };

    return serverFetch('/api/recommendations?', params)
        .then(result => result.data);
}
