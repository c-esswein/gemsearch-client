import * as React from 'react';
import { DataItem, Track } from 'types';
import { PlayIcon } from 'icons';
import { DispatchContext } from 'components/dispatchContextProvider';
import * as playerActions from 'actions/player';
import * as viewActions from 'actions/views';

require('./item.scss');

export interface Props {
  item: DataItem;
  actionText: string;
  onActionClick: (item: DataItem) => void;
}

export class Item extends React.Component<Props, null> {

  static contextTypes = {
    dispatch: React.PropTypes.func.isRequired,
  };
  context: DispatchContext;


  constructor(props: Props) {
      super(props);

      this.handlePlayClick = this.handlePlayClick.bind(this);
      this.handleDetailClick = this.handleDetailClick.bind(this);
  }

  private handlePlayClick() {
    const item = this.props.item;

    this.context.dispatch(
      playerActions.playTrack(item as Track)
    );
  }

  private handleDetailClick() {
    this.context.dispatch(
      viewActions.openItemDetail(this.props.item)
    );
  }

  renderImage() {
    const item = this.props.item;

    if (item.meta && item.meta.images && item.meta.images.length > 0) {
      const imageVersion = item.meta.images.find(image => image.width === 300) || item.meta.images[0];

      if (item.type === 'track' && item.meta.uri) {
        return (
          <div className="item__image item__link" style={{backgroundImage: `url(${imageVersion.url})`}} onClick={this.handlePlayClick}>
            {/*<div className="item__play" onClick={this.handlePlayClick}>*/}
              <PlayIcon className="item__play-icon" />
            {/*</div>*/}
          </div>
        );
      }
      return (
        <div className="item__image" style={{backgroundImage: `url(${imageVersion.url})`}} onClick={this.handleDetailClick}></div>
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
      <div className={'item item--' + item.type} key={item.id}>
        <div className="item__type">{item.type}</div>
        {item.type !== 'tag' ? this.renderImage() : null}
        <div className="item__inner">
          {this.renderTitle()}
        </div>
      </div>
    );
  }
}
