import * as React from 'react';
import Item from './item';
import { DataItem } from '../types';
import * as actions from '../actions';

import './resultList.css';
import { DispatchContext } from '../containers/dispatchContextProvider';

export interface Props {
  items: DataItem[];
}

class ResultList extends React.Component<Props, null> {

  static contextTypes = {
    dispatch: React.PropTypes.func.isRequired,
  };
  context: DispatchContext;

  constructor(props: Props) {
    super(props);

    this.handleItemActionClick = this.handleItemActionClick.bind(this);
  }

  render() {

    const renderItem = (item: DataItem) => {
      return (
        <Item key={item.id} item={item} actionText="Use for query" onActionClick={this.handleItemActionClick} />
      );
    };

    return (
      <div className="ResultList App-wrap">
        {this.props.items.map(renderItem)}
      </div>
    );
  }
  
  private handleItemActionClick(item: DataItem) {
    this.context.dispatch(actions.addQueryItem(item));
  }
}

export default ResultList;
