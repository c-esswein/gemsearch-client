import * as React from 'react';
import * as redux from 'redux';
import { StoreState } from '../types';

export interface Props {
  dispatch: redux.Dispatch<StoreState>;
}

interface State {
}

export interface DispatchContext {
  dispatch: redux.Dispatch<StoreState>;
}

/** 
 * this component exposes the redux dispatch function to its child components via context
 * this allows to dispatch redux-actions from within your component without having to connect explicitly
 */
export class DispatchContextProvider extends React.Component<Props, State> {
  
  static childContextTypes = {
    dispatch: React.PropTypes.func,
  };

  getChildContext() {
    return {
      dispatch: this.props.dispatch,
    };
  }

  render() {
    return React.Children.only(this.props.children);
  }
}
