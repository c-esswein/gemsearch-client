
import { QueryState } from 'reducers/query';
import { ViewState } from 'reducers/views';
import { PlayerState } from 'reducers/player';
import { UserState } from 'reducers/user';

export enum ViewModus {
    LIST, GRAPH
}

export interface StoreState {
    query: QueryState,
    views: ViewState,
    player: PlayerState,
    user: UserState,
}

export interface ImageData {
    width: number,
    height: number,
    url: string
}

export interface QueryItem {
    type: ItemType;
    id: string;
    name: string;
}

export interface DataItem {
    type: ItemType;
    id: string;
    name: string;
    embeddingIndex: number;
    /** position of item in 3D, coordinates are relative to queryVec */
    position: number[];
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
