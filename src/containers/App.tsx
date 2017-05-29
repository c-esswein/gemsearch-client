import App from '../components/App';
import * as actions from '../actions/';
import { StoreState } from '../types/index';
import { connect, Dispatch } from 'react-redux';
import {DataItem} from '../types';

export function mapStateToProps({ queryItems, resultItems }: StoreState) {
  return {
    queryItems,
    resultItems
  };
}

export function mapDispatchToProps(dispatch: Dispatch<actions.QueryAction>) {
  return {
    onAddQueryItem: (item: DataItem) => dispatch(actions.addQueryItem(item)),
    onRemoveQueryItem: (item: DataItem) => dispatch(actions.removeQueryItem(item)),
    queryForItems: (query: DataItem[]) => dispatch(actions.queryForItems(query)),
    recieveItems: (response: Object) => dispatch(actions.recieveItems(response)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(App as any);
