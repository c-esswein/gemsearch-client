import * as constants from '../constants';
import {DataItem} from '../types';

export interface AddQueryItem {
    type: constants.ADD_QUERY_ITEM;
    item: DataItem;
}

export interface RemoveQueryItem {
    type: constants.REMOVE_QUERY_ITEM;
    item: DataItem;
}

export interface QueryForItems {
    type: constants.QUERY_FOR_ITEMS;
    query: DataItem[];
}

export interface RecieveItems {
    type: constants.RECIEVE_ITEMS;
    response: Object;
}

export type QueryAction = AddQueryItem | RemoveQueryItem | QueryForItems | RecieveItems;

export function addQueryItem(item: DataItem): AddQueryItem {
    return {
        type: constants.ADD_QUERY_ITEM,
        item
    };
}

export function removeQueryItem(item: DataItem): RemoveQueryItem {
    return {
        type: constants.REMOVE_QUERY_ITEM,
        item
    };
}

export function queryForItems(query: DataItem[]): QueryForItems {
    return {
        type: constants.QUERY_FOR_ITEMS,
        query
    };
}

export function recieveItems(response: Object): RecieveItems {
    return {
        type: constants.RECIEVE_ITEMS,
        response
    };
}