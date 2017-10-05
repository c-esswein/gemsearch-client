import { ViewModus, DataItem } from '../types';

export type Actions = ChangeMainViewTypeAction 
    | OpenItemDetailAction | CloseItemDetailAction | SetConnectDialogOpenStateAction;

export interface ChangeMainViewTypeAction {
    type: 'MAIN_VIEW_TYPE_CHANGE';
    viewModus: ViewModus;
}
export function changeMainViewType(viewModus: ViewModus): ChangeMainViewTypeAction {
    return {
        type: 'MAIN_VIEW_TYPE_CHANGE',
        viewModus
    };
}

export interface OpenItemDetailAction {
    type: 'OPEN_ITEM_DETAIL';
    item: DataItem;
}
export function openItemDetail(item: DataItem): OpenItemDetailAction {
    return {
        type: 'OPEN_ITEM_DETAIL',
        item
    };
}

export interface CloseItemDetailAction {
    type: 'CLOSE_ITEM_DETAIL';
}
export function closeItemDetail(): CloseItemDetailAction {
    return {
        type: 'CLOSE_ITEM_DETAIL',
    };
}

export interface SetConnectDialogOpenStateAction {
    type: 'SET_CONNECT_DIALOG_OPEN_STATE';
    isOpen: boolean;
}
export function setConnectDialogOpenState(isOpen: boolean): SetConnectDialogOpenStateAction {
    return {
        type: 'SET_CONNECT_DIALOG_OPEN_STATE',
        isOpen
    };
}
