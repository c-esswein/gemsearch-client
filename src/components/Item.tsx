import * as React from 'react';
import {DataItem} from '../types';
import './Item.css';

export interface Props {
  item: DataItem;
}

class Item extends React.Component<Props, null> {

  constructor(props: Props) {
      super(props);

      this.handleFilterClick_ = this.handleFilterClick_.bind(this);
  }

  handleFilterClick_() {
    alert('TODO');
  }

  render() {
    const item = this.props.item;

    const renderTitle = () => {
        if (item.uri) {
            return (
                <a className="Item-name" href={item.uri} title="View on Spotify">{item.name}</a>
            );
        }

        return (
            <span>{item.name}</span>
        );
    };

    return (
      <div className="Item" key={item.id}>
        <div className="Item-type">{item.type}</div>
        <div className="Song-inner">
          {renderTitle()}
          <span className="Item-query-link" onClick={this.handleFilterClick_}>Use for query</span>
        </div>
      </div>
    );
  }
}

export default Item;
