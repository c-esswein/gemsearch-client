import { Actions } from 'actions';
import { StoreState } from 'types';
import { combineReducers } from 'redux';

import { queryReducer } from 'reducers/query';
import { viewReducer } from 'reducers/views';
import { playerReducer } from 'reducers/player';
import { userReducer } from 'reducers/user';

export const mainReducer = combineReducers<StoreState>({
  query: queryReducer,
  views: viewReducer,
  player: playerReducer,
  user: userReducer,
} as any) as (oldState: StoreState, action: Actions) => StoreState;
