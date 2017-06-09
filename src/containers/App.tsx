import App from '../components/app';
import * as actions from '../actions';
import { StoreState, DataItem } from '../types';
import { connect, Dispatch } from 'react-redux';

export function mapStateToProps({ queryItems, resultItems }: StoreState) {
  return {
    queryItems,
    resultItems
  };
}

export function mapDispatchToProps(dispatch: Dispatch<actions.Action>) {
  return {
    onAddQueryItem: (item: DataItem) => dispatch(actions.addQueryItem(item)),
    onRemoveQueryItem: (item: DataItem) => dispatch(actions.removeQueryItem(item)),
    queryForItems: (query: DataItem[]) => dispatch(actions.queryForItems(query)),
    receiveItems: (response: Object) => dispatch(actions.receiveItems(response)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(App as any);
