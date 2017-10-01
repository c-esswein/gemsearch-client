import * as React from 'react';
import { DataItem, Track } from 'types';
import { AddIcon } from 'icons';
import { RemoveIcon, PlayIcon, OptionsIcon } from 'icons';
import * as playerActions from 'actions/player';
import * as viewActions from 'actions/views';
import * as queryActions from 'actions/query';
import { DispatchContext } from 'components/dispatchContextProvider';

export interface Props {
  item: DataItem;
}

export class ResultItem extends React.Component<Props, {}> {

  static contextTypes = {
    dispatch: React.PropTypes.func.isRequired,
  };  
  context: DispatchContext;

  constructor(props) {
      super(props);

      this.handleFilterClick_ = this.handleFilterClick_.bind(this);
      this.handleDetailClick = this.handleDetailClick.bind(this);
      this.handlePlayClick = this.handlePlayClick.bind(this);
  }

  private handleFilterClick_(e: React.MouseEvent<HTMLElement>) {
    this.context.dispatch(queryActions.addQueryItem(this.props.item));
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

  private renderImage() {
    const item = this.props.item;

    if (item.meta && item.meta.images && item.meta.images.length > 0) {
      const imageVersion = item.meta.images.find(image => image.width === 300) || item.meta.images[0];

      return (
        <div className="resultItem__img" style={{backgroundImage: `url(${imageVersion.url})`}}>
            <div className="resultItem__hover">
              <div className="resultItem__detail-btn" title="Show details" onClick={this.handleDetailClick}>
                <OptionsIcon className="svg-inline svg-fill-current resultItem__detail-ico" />                
              </div>
              <div className="resultItem__query-add" title="Add to search" onClick={this.handleFilterClick_}>
                <AddIcon className="svg-inline svg-fill-current resultItem__query-add-ico" />                
              </div>

              {item.type === 'track' ? 
                <PlayIcon className="resultItem__play-icon" onClick={this.handlePlayClick} />
                : null
              }
            </div>
        </div>
      );
    }

    if (item.type === 'tag') {
      return (
        <div className="resultItem__img resultItem__img--tag">
          <span>#</span>
          <div className="resultItem__hover">
            <div className="resultItem__query-add" title="Add to search" onClick={this.handleFilterClick_}>
              <AddIcon className="svg-inline svg-fill-current resultItem__query-add-ico" />                
            </div>
          </div>
        </div>      
      );
    }

    return (
      <div className="resultItem__img resultItem__img--empty"></div>
    );
  }
  
  private renderTitle() {
    const item = this.props.item;

    if (item.meta && item.meta.uri) {
      return (
        <a className="resultItem__title" href={item.meta.uri} title="View on Spotify" target="_blank">
          {item.name}
        </a>
      );
    } else {
      return (
          <span className="resultItem__title">{item.name}</span>
      );
    }
  }

  render() {
    const item = this.props.item;

    return (
      <div className={'resultItem resultItem--' + item.type} key={item.id}>      
        {this.renderImage()}
        <div className="resultItem__inner">
          {this.renderTitle()}

          {item.meta && item.meta.artist ?
            <span className="resultItem__artist">{item.meta.artist}</span>            
          : null}
        </div>
      </div>
    );
  }
}
