import * as React from 'react';
import { DataItem } from 'types';
import { Item } from 'components/item';

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

    const renderImage = () => {
      if (item.meta && item.meta.images && item.meta.images.length > 0) {
        const imageVersion = item.meta.images.find(image => image.width === 300) || item.meta.images[0];
        return (
          <div className="item__image" style={{backgroundImage: `url(${imageVersion.url})`}}></div>
        );
      }

      return (
        <div className="item__image item__image--empty"></div>
      );
    };

    const renderTitle = () => {
        if (item.meta && item.meta.uri) {
            return (
                <a className="item__name" href={item.meta.uri} title="View on Spotify">{item.name}</a>
            );
        } else {
          return (
              <span>{item.name}</span>
          );
        }
    };

    return (
      <div className="item" key={item.id}>
        <div className="item__type">{item.type}</div>
        {item.type !== 'tag' ? renderImage() : null}
        <div className="item__inner">
          {renderTitle()}
          <span className="item__query-link" onClick={this.handleFilterClick_}>
            {this.props.actionText}
          </span>
        </div>
      </div>
    );
  }
}
