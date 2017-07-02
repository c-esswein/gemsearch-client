import * as React from 'react';
import { DataItem } from 'types';
import { Item } from 'components/item';
import { RemoveIcon } from 'icons';

export class QueryItem extends Item {

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
      <div className="item queryBar__item" key={item.id}>
        {/*{item.type !== 'tag' ? this.renderImage() : null}*/}
        <div className="item__inner">
          <div className="item__type">{item.type}</div>
          {this.renderTitle()}
          <span className="item__query-link" onClick={this.handleFilterClick_}>
            <RemoveIcon className="svg-inline svg-fill-current" />
          </span>
        </div>
      </div>
    );
  }
}
