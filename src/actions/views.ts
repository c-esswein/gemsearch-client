import { ViewModus } from '../types';

export type Actions = ChangeMainViewType;

export interface ChangeMainViewType {
    type: 'MAIN_VIEW_TYPE_CHANGE';
    viewModus: ViewModus;
}
export function changeMainViewType(viewModus: ViewModus): ChangeMainViewType {
    return {
        type: 'MAIN_VIEW_TYPE_CHANGE',
        viewModus
    };
}
