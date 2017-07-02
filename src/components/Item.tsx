import * as React from 'react';
import { DataItem } from 'types';

require('./item.scss');

export interface Props {
  item: DataItem;
  actionText: string;
  onActionClick: (item: DataItem) => void;
}

export class Item extends React.Component<Props, null> {

  constructor(props: Props) {
      super(props);

  }

  renderImage() {
    const item = this.props.item;

    if (item.meta && item.meta.images && item.meta.images.length > 0) {
      const imageVersion = item.meta.images.find(image => image.width === 300) || item.meta.images[0];
      return (
        <div className="item__image" style={{backgroundImage: `url(${imageVersion.url})`}}></div>
      );
    }

    return (
      <div className="item__image item__image--empty"></div>
    );
  }
  

  renderTitle() {
    const item = this.props.item;

    if (item.meta && item.meta.uri) {
        return (
            <a className="item__name" href={item.meta.uri} title="View on Spotify">{item.name}</a>
        );
    } else {
      return (
          <span>{item.name}</span>
      );
    }
  }

  render() {
    const item = this.props.item;

    return (
      <div className="item" key={item.id}>
        <div className="item__type">{item.type}</div>
        {item.type !== 'tag' ? this.renderImage() : null}
        <div className="item__inner">
          {this.renderTitle()}
        </div>
      </div>
    );
  }
}
