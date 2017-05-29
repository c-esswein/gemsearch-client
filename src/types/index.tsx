
export interface StoreState {
    queryItems: DataItem[];
    resultItems: DataItem[];
}

export interface DataItem {
    type: string;
    id: string;
    name: string;
    uri: string;
}
