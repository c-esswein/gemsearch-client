import { ViewModus, DataItem } from '../types';

export type Actions = ChangeMainViewTypeAction 
    | OpenItemDetailAction | CloseItemDetailAction | SetConnectDialogOpenStateAction
    | SetGraphClusterActiveAction | SetGraphIntersectionIdAction;

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

export interface SetGraphClusterActiveAction {
    type: 'SET_GRAPH_CLUSTER_ACTIVE';
    clusterId: string | null;
}
export function setGraphClusterActive(clusterId: string | null): SetGraphClusterActiveAction {
    return {
        type: 'SET_GRAPH_CLUSTER_ACTIVE',
        clusterId
    };
}

export interface SetGraphIntersectionIdAction {
    type: 'SET_GRAPH_INTERSECTION_ID';
    intersectionId: string | null;
    intersectionPoint: THREE.Vector3 | null;
}
export function setGraphIntersection(intersectionId: string | null, intersectionPoint: THREE.Vector3 | null = null): SetGraphIntersectionIdAction {
    return {
        type: 'SET_GRAPH_INTERSECTION_ID',
        intersectionId,
        intersectionPoint
    };
}



