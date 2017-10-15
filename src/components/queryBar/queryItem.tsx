import * as React from 'react';
import { DataItem, Track } from 'types';
import { RemoveIcon, PlayIcon } from 'icons';
import { SuggestionItem } from 'api/query';


export interface Props {
  item: DataItem | SuggestionItem;
  onActionClick: (item: DataItem) => void;
  actionText?: string;
  mode: 'remove' | 'item_select';
}

export class QueryItem extends React.Component<Props, {}> {

  constructor(props) {
      super(props);

      this.handleRemoveClick = this.handleRemoveClick.bind(this);
      this.handleItemClick = this.handleItemClick.bind(this);
  }

  private handleRemoveClick(e: React.MouseEvent<HTMLElement>) {
    this.props.onActionClick(this.props.item);
  }

  private handleItemClick(e: React.MouseEvent<HTMLElement>) {
    if (this.props.mode === 'item_select') {
      this.props.onActionClick(this.props.item);
    }
  }

  renderImage() {
    const item = this.props.item;

    if (item.meta && item.meta.images && item.meta.images.length > 0) {
      const imageVersion = item.meta.images.find(image => image.width === 300) || item.meta.images[0];

      return (
        <div className="queryBar__item-image" style={{backgroundImage: `url(${imageVersion.url})`}}></div>
      );
    }

    if (item.type === 'tag') {
      return (
        <div className="queryBar__item-image queryBar__item-image--tag">#</div>
      );
    }

    return (
      <div className="queryBar__item-image queryBar__item-image--empty"></div>
    );
  }

  render() {
    const item = this.props.item as SuggestionItem;

    return (
      <div className="queryBar__item" key={item.id} onClick={this.handleItemClick}>
        {this.renderImage()}
        <div className="queryBar__item-inner">
          <div className="queryBar__item-type">{item.type}</div>
          {item.highlightName ? 
            <span className="queryBar__item-name" title={item.name} dangerouslySetInnerHTML={{__html: item.highlightName}}></span>
            : 
            <span className="queryBar__item-name" title={item.name}>{item.name}</span>
          }

          {(this.props.mode === 'remove') ? 
            <span className="queryBar__item-remove" onClick={this.handleRemoveClick} title={this.props.actionText}>
              <RemoveIcon className="svg-inline svg-fill-current" />
            </span>
            : null
          }

        </div>
      </div>
    );
  }
}
