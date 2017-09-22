import { Actions } from 'actions';
import { StoreState, DataItem, ViewModus } from 'types';

export interface ViewState {
    app: {
        viewModus: ViewModus
    },
    itemDetail: {
      isOpen: boolean,
      item?: DataItem
    }
}

const initialState: ViewState = {
  app: {
    viewModus: ViewModus.GRAPH,
  },
  itemDetail: {
    isOpen: false
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
    case 'OPEN_ITEM_DETAIL':
      return { 
        ...state, 
          itemDetail: {
            ...state.itemDetail,
            isOpen: true,
            item: action.item
          }
      };
    case 'CLOSE_ITEM_DETAIL':
      return { 
        ...state, 
          itemDetail: {
            ...state.itemDetail,
            isOpen: false
          }
      };
    default:
      return state;
  }
}
