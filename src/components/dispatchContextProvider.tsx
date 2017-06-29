import * as React from 'react';
import * as redux from 'redux';
import { StoreState } from '../types';

export interface Props {
  dispatch: redux.Dispatch<StoreState>,
}

interface State {
}

export interface DispatchContext {
  dispatch: redux.Dispatch<StoreState>,
}

/** 
 * this component exposes the redux dispatch function to its child components via context
 * 
 * this allows to dispatch redux-actions from within your component without having to connect explicitly
 * 
 * use the vscode templates `react with dispatch-context` or `dispatch context` to include the context into your component
 * 
 * note that the usage of dispatch within your component tightly couples the component with a certain behavior which reduces its reusability
 */
export class DispatchContextProvider extends React.Component<Props, State> {
  
  static childContextTypes = {
    dispatch: React.PropTypes.func,
  };

  getChildContext(){
    return {
      dispatch: this.props.dispatch,
    };
  }

  render() {
    return React.Children.only(this.props.children);
  }
}
