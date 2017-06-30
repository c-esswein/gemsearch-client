import { Action } from '../actions';
import { StoreState, DataItem } from '../types';
import { ADD_QUERY_ITEM, REMOVE_QUERY_ITEM, RECEIVE_ITEMS, TYPE_FILTER_CHANGE, MAIN_VIEW_TYPE_CHANGE } from '../constants';

export function items(state: StoreState, action: Action): StoreState {
  switch (action.type) {
    case ADD_QUERY_ITEM:
      // check if item is already in query
      if (state.queryItems.find(item => item.id === action.item.id)) {
        return state;
      }
      
      return { 
        ...state, 
        queryItems: state.queryItems.concat(action.item) 
      };
    case REMOVE_QUERY_ITEM:
      return { 
        ...state, 
        queryItems: state.queryItems.filter((item) => (item.id !== action.item.id))
      };
    case RECEIVE_ITEMS:
      return { 
        ...state, 
        resultItems: action.response as DataItem[]
      };
    case TYPE_FILTER_CHANGE:
      return { 
        ...state, 
        typeFilter: action.filter
      };
    case MAIN_VIEW_TYPE_CHANGE:
      return { 
        ...state, 
        views: {
          ...state.views,
          app: {
            ...state.views.app,
            viewState: action.viewState
          }
        }
      };
    default:
      return state;
  }
}
