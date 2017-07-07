import { DataItem } from '../types';

export type Actions = AddQueryItem | RemoveQueryItem | QueryForItems | ReceiveItems | ChangeTypeFilter;

export interface AddQueryItem {
    type: 'ADD_QUERY_ITEM';
    item: DataItem;
}
export function addQueryItem(item: DataItem): AddQueryItem {
    return {
        type: 'ADD_QUERY_ITEM',
        item
    };
}

export interface RemoveQueryItem {
    type: 'REMOVE_QUERY_ITEM';
    item: DataItem;
}
export function removeQueryItem(item: DataItem): RemoveQueryItem {
    return {
        type: 'REMOVE_QUERY_ITEM',
        item
    };
}

export interface QueryForItems {
    type: 'QUERY_FOR_ITEMS';
    query: DataItem[];
}
export function queryForItems(query: DataItem[]): QueryForItems {
    return {
        type: 'QUERY_FOR_ITEMS',
        query
    };
}

export interface ReceiveItems {
    type: 'RECEIVE_ITEMS';
    response: Object;
}
export function receiveItems(response: Object): ReceiveItems {
    return {
        type: 'RECEIVE_ITEMS',
        response
    };
}

export interface ChangeTypeFilter {
    type: 'TYPE_FILTER_CHANGE';
    filter: string[];
}
export function changeTypeFilter(filter: string[]): ChangeTypeFilter {
    return {
        type: 'TYPE_FILTER_CHANGE',
        filter
    };
}
