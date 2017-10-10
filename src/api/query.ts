import { DataItem } from 'types';
import { serverFetch } from 'api';

export type Position3D = number[];

export type Cluster = DataItem[];

export interface QueryServerResult {
    // data: DataItem[],
    boundingBox: Position3D[],
    clusters: Cluster[],
}

/**
 * Query GEM for items. 
 */
export function queryForItems(query: DataItem[], typeFilter: string[], limit = 30, offset = 0): Promise<DataItem[]> {
    const queryIds = query.map(item => item.id);

    const params = {
        'ids': queryIds.join('|'),
        'types': typeFilter.join('|'),
        'limit': limit,
        'offset': offset
    };
    
    return serverFetch('/api/query?', params)
        .then(result => result.data);
}

/**
 * Query GEM for items including 3D viz data. 
 */
export function queryForItemsForGraph(query: DataItem[], typeFilter: string[], limit = 30, offset = 0) {
    const queryIds = query.map(item => item.id);

    const params = {
        'ids': queryIds.join('|'),
        'types': typeFilter.join('|'),
        'minClusterDistance': 0.1,
        'limit': limit,
        'offset': offset
    };
    
    return serverFetch('/api/query_viz?', params) as Promise<QueryServerResult>;
}

/**
 * Get suggestions of items to autocomplete term.
 */
export function getSuggestForItems(searchTerm: string) {
    return serverFetch('/api/suggest/' + searchTerm.trim());
}
