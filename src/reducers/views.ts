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
    graph: {
      activeCluster: string | null,
      intersectionId: string | null,
      intersectionPoint: THREE.Vector3 | null,
    }
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
  graph: {
    activeCluster: null,
    intersectionId: null,
    intersectionPoint: null,
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
    case 'SET_GRAPH_CLUSTER_ACTIVE':
      return { 
        ...state, 
        graph: {
            ...state.graph,
            activeCluster: action.clusterId
          }
      };
    case 'SET_GRAPH_INTERSECTION_ID':
      return { 
        ...state, 
        graph: {
            ...state.graph,
            intersectionId: action.intersectionId,
            intersectionPoint: action.intersectionPoint || state.graph.intersectionPoint,
          }
      };
    default:
      return state;
  }
}
