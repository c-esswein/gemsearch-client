import { Actions } from 'actions';
import { StoreState, DataItem, ViewModus } from 'types';

export interface ViewState {
    app: {
        viewModus: ViewModus
    },
    itemDetail: {
      isOpen: boolean,
      item?: DataItem
    },
    connectDialog: {
      isOpen: boolean,
    },
}

const initialState: ViewState = {
  app: {
    viewModus: ViewModus.LIST,
  },
  itemDetail: {
    isOpen: false
  },
  connectDialog: {
    isOpen: false,
  },
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
    case 'SET_CONNECT_DIALOG_OPEN_STATE':
      return { 
        ...state, 
        connectDialog: {
            ...state.connectDialog,
            isOpen: action.isOpen
          }
      };
    default:
      return state;
  }
}
