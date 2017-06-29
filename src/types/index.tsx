
export interface StoreState {
    queryItems: DataItem[];
    resultItems: DataItem[];
    typeFilter: string[];
}

export interface ImageData {
    width: number,
    height: number,
    url: string
}

export interface DataItem {
    type: string;
    id: string;
    name: string;
    meta?: {
        uri?: string,
        preview_url?: string,
        images?: ImageData[]
    }
}
