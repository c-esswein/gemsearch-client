import * as React from 'react';
import Item from './Item';
import { DataItem } from '../types';
/* import Artist from './Artist';
import Song from './Song'; */

import './ResultList.css';

export interface Props {
  items: DataItem[];
  onQueryAdd: (item: DataItem) => void;
}

class ResultList extends React.Component<Props, null> {
  render() {

    const renderItem = (item: DataItem) => {
     /* if (item['type'] === 'song') {
        return (
          <Song item={item} />
        );
      } else if (item['type'] === 'artist') {
        return (
          <Artist item={item} />
        );
      } */
      
      return (
        <Item key={item.id} item={item} onQueryAdd={this.props.onQueryAdd} />
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
