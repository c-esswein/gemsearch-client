import App from '../components/app';
import * as actions from '../actions';
import { StoreState, DataItem } from '../types';
import { connect, Dispatch } from 'react-redux';

export function mapStateToProps({ queryItems, resultItems, typeFilter }: StoreState) {
  return {
    queryItems,
    resultItems,
    typeFilter 
  };
}

export function mapDispatchToProps(dispatch: Dispatch<actions.Action>) {
  return {
    onAddQueryItem: (item: DataItem) => dispatch(actions.addQueryItem(item)),
    onRemoveQueryItem: (item: DataItem) => dispatch(actions.removeQueryItem(item)),
    queryForItems: (query: DataItem[]) => dispatch(actions.queryForItems(query)),
    receiveItems: (response: Object) => dispatch(actions.receiveItems(response)),
    onTypeFilterChange: (filter: string[]) => dispatch(actions.changeTypeFilter(filter))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(App as any);
