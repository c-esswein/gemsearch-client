import { DataItem } from '../types';
import { QueryServerResult } from 'api/query';

export type Actions =
    AddQueryItemAction | RemoveQueryItemAction  | ChangeTypeFilterAction;

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
