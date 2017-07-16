
import { QueryState } from 'reducers/query';
import { ViewState } from 'reducers/views';
import { PlayerState } from 'reducers/player';

export enum ViewModus {
    LIST, GRAPH
}

export interface StoreState {
    query: QueryState,
    views: ViewState,
    player: PlayerState,
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
    embeddingIndex: number;
    meta?: {
        uri?: string,
        images?: ImageData[]
    }
}


export interface Track extends DataItem {
    type: 'track',
    meta: {
        uri: string,
        images: ImageData[]
        preview_url: string,
    }
}

export type ItemType = 'tag' | 'artist' | 'track';
