import { DataItem } from '../types';
import { QueryServerResult } from 'api/query';

export type Actions =
    AddQueryItemAction | RemoveQueryItemAction | QueryForItemsAction | 
    ReceiveItemsAction | ChangeTypeFilterAction;

export interface AddQueryItemAction {
    type: 'ADD_QUERY_ITEM';
    item: DataItem;
}
export function addQueryItem(item: DataItem): AddQueryItemAction {
    return {
        type: 'ADD_QUERY_ITEM',
        item
    };
}

export interface RemoveQueryItemAction {
    type: 'REMOVE_QUERY_ITEM';
    item: DataItem;
}
export function removeQueryItem(item: DataItem): RemoveQueryItemAction {
    return {
        type: 'REMOVE_QUERY_ITEM',
        item
    };
}

export interface QueryForItemsAction {
    type: 'QUERY_FOR_ITEMS';
    query: DataItem[];
}
export function queryForItems(query: DataItem[]): QueryForItemsAction {
    return {
        type: 'QUERY_FOR_ITEMS',
        query
    };
}

export interface ReceiveItemsAction {
    type: 'RECEIVE_ITEMS';
    response: QueryServerResult;
}
export function receiveItems(response: QueryServerResult): ReceiveItemsAction {
    return {
        type: 'RECEIVE_ITEMS',
        response
    };
}

export interface ChangeTypeFilterAction {
    type: 'TYPE_FILTER_CHANGE';
    filter: string[];
}
export function changeTypeFilter(filter: string[]): ChangeTypeFilterAction {
    return {
        type: 'TYPE_FILTER_CHANGE',
        filter
    };
}
