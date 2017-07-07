import { Actions } from 'actions';
import { StoreState, DataItem, ViewModus } from 'types';

export interface ViewState {
    app: {
        viewModus: ViewModus
    }
}

const initialState: ViewState = {
  app: {
    viewModus: ViewModus.LIST
  }
};

export function viewReducer(state: ViewState = initialState, action: Actions): ViewState {
  switch (action.type) {
    case 'MAIN_VIEW_TYPE_CHANGE':
      return { 
        ...state, 
          app: {
            ...state.app,
            viewModus: action.viewModus
          }
      };
    default:
      return state;
  }
}
