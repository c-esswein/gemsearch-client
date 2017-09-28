import { DataItem } from 'types';
import { serverFetch } from 'api';

export type Position3D = number[];

export type Cluster = DataItem[];

export interface QueryServerResult {
    data: DataItem[],
    boundingBox: Position3D[],
    clusters: Cluster[],
}

/**
 * Query GEM for items. 
 */
export function queryForItems(query: DataItem[], typeFilter: string[]) {
    const queryIds = query.map(item => item.id);

    const params = {
        'ids': queryIds.join('|'),
        'types': typeFilter.join('|'),
        'minClusterDistance': 0.1
    };
    
    return serverFetch('/api/query?', params) as Promise<QueryServerResult>;
}
