import * as constants from '../constants';
import { DataItem } from '../types';

export type Action = AddQueryItem | RemoveQueryItem | QueryForItems | ReceiveItems | ChangeTypeFilter;

export interface AddQueryItem {
    type: constants.ADD_QUERY_ITEM;
    item: DataItem;
}
export function addQueryItem(item: DataItem): AddQueryItem {
    return {
        type: constants.ADD_QUERY_ITEM,
        item
    };
}

export interface RemoveQueryItem {
    type: constants.REMOVE_QUERY_ITEM;
    item: DataItem;
}
export function removeQueryItem(item: DataItem): RemoveQueryItem {
    return {
        type: constants.REMOVE_QUERY_ITEM,
        item
    };
}

export interface QueryForItems {
    type: constants.QUERY_FOR_ITEMS;
    query: DataItem[];
}
export function queryForItems(query: DataItem[]): QueryForItems {
    return {
        type: constants.QUERY_FOR_ITEMS,
        query
    };
}

export interface ReceiveItems {
    type: constants.RECEIVE_ITEMS;
    response: Object;
}
export function receiveItems(response: Object): ReceiveItems {
    return {
        type: constants.RECEIVE_ITEMS,
        response
    };
}

export interface ChangeTypeFilter {
    type: constants.TYPE_FILTER_CHANGE;
    filter: string[];
}
export function changeTypeFilter(filter: string[]): ChangeTypeFilter {
    return {
        type: constants.TYPE_FILTER_CHANGE,
        filter
    };
}
