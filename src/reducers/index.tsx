import { QueryAction } from '../actions';
import { StoreState } from '../types/index';
import { ADD_QUERY_ITEM, REMOVE_QUERY_ITEM, RECIEVE_ITEMS } from '../constants/index';
import { DataItem } from '../types';

export function items(state: StoreState, action: QueryAction): StoreState {
  switch (action.type) {
    case ADD_QUERY_ITEM:
      return { 
        ...state, 
        queryItems: state.queryItems.concat(action.item) 
      };
    case REMOVE_QUERY_ITEM:
      return { 
        ...state, 
        queryItems: state.queryItems.filter((item) => (item.id !== action.item.id))
      };
    case RECIEVE_ITEMS:
      return { 
        ...state, 
        resultItems: action.response as DataItem[]
      };
    default:
      return state;
  }
}