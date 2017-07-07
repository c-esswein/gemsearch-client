
import { QueryState } from 'reducers/query';
import { ViewState } from 'reducers/views';

export enum ViewModus {
    LIST, GRAPH
}

export interface StoreState {
    query: QueryState
    views: ViewState
}

export interface ImageData {
    width: number,
    height: number,
    url: string
}

export interface DataItem {
    type: ItemType;
    id: string;
    name: string;
    meta?: {
        uri?: string,
        preview_url?: string,
        images?: ImageData[]
    }
}

export type ItemType = 'tag' | 'artist' | 'track';
