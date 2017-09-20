import * as React from 'react';
import { DataItem } from 'types';
import { Item } from 'components/item';
import { AddIcon } from 'icons';

require('./item.scss');


export class ResultItem extends Item {

  constructor(props) {
      super(props);

      this.handleFilterClick_ = this.handleFilterClick_.bind(this);
  }

  handleFilterClick_(e: React.MouseEvent<HTMLElement>) {
    this.props.onActionClick(this.props.item);
  }

  render() {
    const item = this.props.item;

    return (
      <div className={'item resultItem item--' + item.type} key={item.id}>      
        <div className="item__type">{item.type}</div>
        {item.type !== 'tag' ? this.renderImage() : null}
        <div className="item__inner">
          {this.renderTitle()}
          <span className="item__query-link" onClick={this.handleFilterClick_} title={this.props.actionText}>
            <AddIcon className="svg-inline svg-fill-current item__query-link-icon" />
          </span>
        </div>
      </div>
    );
  }
}
