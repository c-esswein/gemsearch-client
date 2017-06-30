
export enum ViewState {
    LIST, GRAPH
}

export interface StoreState {
    queryItems: DataItem[];
    resultItems: DataItem[];
    typeFilter: string[];
    views: {
        app: {
            viewState: ViewState;
        }
    }
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
