import { Actions } from 'actions';
import { StoreState } from 'types';
import { combineReducers } from 'redux';

import { queryReducer } from 'reducers/query';
import { viewReducer } from 'reducers/views';
import { playerReducer } from 'reducers/player';

export const mainReducer = combineReducers<StoreState>({
  query: queryReducer,
  views: viewReducer,
  player: playerReducer,
} as any) as (oldState: StoreState, action: Actions) => StoreState;
