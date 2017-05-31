import * as React from 'react';
import Item from './Item';
import { DataItem } from '../types';

import './ResultList.css';

export interface Props {
  items: DataItem[];
  onQueryAdd: (item: DataItem) => void;
}

class ResultList extends React.Component<Props, null> {
  render() {

    const renderItem = (item: DataItem) => {
      return (
        <Item key={item.id} item={item} actionText="Use for query" onActionClick={this.props.onQueryAdd} />
      );
    };

    return (
      <div className="ResultList">
        {this.props.items.map(renderItem)}
      </div>
    );
  }
}

export default ResultList;
