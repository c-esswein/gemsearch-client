import { ViewModus } from '../types';

export type Actions = ChangeMainViewTypeAction;

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
