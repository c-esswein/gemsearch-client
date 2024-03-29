import { Actions } from 'actions';
import { StoreState, DataItem, QueryItem } from 'types';
import { QueryServerResult } from 'api/query';

export interface QueryState {
    queryItems: QueryItem[];
    typeFilter: string[];
}

const initialState: QueryState = {
  queryItems: [],
  typeFilter: ['track', 'artist'],
};

export function queryReducer(state: QueryState = initialState, action: Actions): QueryState {
  switch (action.type) {
    case 'ADD_QUERY_ITEM':
      // check if item is already in query
      if (state.queryItems.find(item => item.id === action.item.id)) {
        return state;
      }
      
      return { 
        ...state, 
        queryItems: state.queryItems.concat(action.item) 
      };
    case 'REMOVE_QUERY_ITEM':
      return { 
        ...state, 
        queryItems: state.queryItems.filter((item) => (item.id !== action.item.id))
      };
    case 'TYPE_FILTER_CHANGE':
      return { 
        ...state, 
        typeFilter: action.filter
      };
    default:
      return state;
  }
}
