
export interface StoreState {
    queryItems: DataItem[];
    resultItems: DataItem[];
    typeFilter: string[];
}

export interface DataItem {
    type: string;
    id: string;
    name: string;
    uri: string;
}
