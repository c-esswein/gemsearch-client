import App from '../components/app';
import { StoreState, DataItem } from '../types';
import { connect, Dispatch } from 'react-redux';

export function mapStateToProps({ queryItems, resultItems, typeFilter }: StoreState) {
  return {
    queryItems,
    resultItems,
    typeFilter 
  };
}

export default connect(mapStateToProps)(App as any);
