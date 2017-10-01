import * as React from 'react';
import { DataItem, Track } from 'types';
import { PlayIcon, AddIcon } from 'icons';
import { DispatchContext } from 'components/dispatchContextProvider';
import * as playerActions from 'actions/player';
import * as viewActions from 'actions/views';
import * as queryActions from 'actions/query';
import { xFetch } from 'utils';


require('./itemDetail.scss');

export interface Props {
  item: DataItem;
  isOpen: boolean;
  onPlayClick: (track: Track) => void;
}

interface State {
  neighbors: DataItem[]
}

export class ItemDetail extends React.Component<Props, State> {

  static contextTypes = {
    dispatch: React.PropTypes.func.isRequired,
  };
  context: DispatchContext;


  constructor(props: Props) {
      super(props);

      this.state = {
        neighbors: []
      };

      this.handlePlayClick = this.handlePlayClick.bind(this);
      this.handleFilterClick_ = this.handleFilterClick_.bind(this);
      this.handleRequestClose = this.handleRequestClose.bind(this);
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.item !== this.props.item) {
      
      // TODO: do not use state!
      xFetch('/api/neighbors/' + nextProps.item.id)
        .then(response => response.json())
        .then(json => this.setState({
          neighbors: json.nodes
        }));
      
    }
  }

  private handlePlayClick() {
    const item = this.props.item;

    this.context.dispatch(
      playerActions.playTrack(item as Track)
    );
  }

  private handleFilterClick_(e: React.MouseEvent<HTMLElement>) {
    this.context.dispatch(queryActions.addQueryItem(this.props.item));
  }

  private handleRequestClose() {
      this.context.dispatch(
          viewActions.closeItemDetail()
      );
      
      this.state = {
        neighbors: []
      };
  }

  private renderImage() {
    const item = this.props.item;

    if (item.meta && item.meta.images && item.meta.images.length > 0) {
      const imageVersion = item.meta.images.find(image => image.width === 300) || item.meta.images[0];

      return (
        <div className="resultItem__img" style={{backgroundImage: `url(${imageVersion.url})`}}>
            <div className="resultItem__hover">
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
  

  renderTitle() {
    const item = this.props.item;

    if (item.meta && item.meta.uri) {
        return (
            <a className="itemDetail__name" href={item.meta.uri} title="View on Spotify">{item.name}</a>
        );
    } else {
      return (
          <span>{item.name}</span>
      );
    }
  }

  private renderNeighbors() {
    return this.state.neighbors.map(item => {
      if (item.type === 'track') {
        const handlePlayClick = () => {
          this.context.dispatch(
            playerActions.playTrack(item as Track)
          );
        };
        return (
          <div className="smallTrackInfo" key={item.id} onClick={handlePlayClick}>
            <PlayIcon />
            <span className="smallTrackInfo__name">{item.name}</span>
          </div>
        );
      } else {
        return (
          <div key={item.id}>
            {item.type}:
            {item.name}
          </div>
        );
      }
    });
  }

  render() {
    const { item, isOpen } = this.props;

    if (!isOpen) {
        return null;
    }

    return (
      <div className="itemDetail__container"> 
        <div className="itemDetail__overlay" onClick={this.handleRequestClose}></div>   
        <div className="itemDetail">
          <div className="itemDetail__left">
            {item.type !== 'tag' ? this.renderImage() : null}
          </div>
          <div className="itemDetail__main">
            <div className="itemDetail__type">{item.type}</div>
            {this.renderTitle()}
            <div className="itemDetail__neighbors">
              {this.renderNeighbors()}
            </div>
          </div>
        </div>
      </div>
    );
  }
}



import { connect } from 'react-redux';
import { StoreState, ViewModus } from 'types';

export interface ConnectedProps {

}

export const ConnectedItemDetail = connect(
  ({ views }: StoreState, ownProps: ConnectedProps) => ({
    item: views.itemDetail.item,
    isOpen: views.itemDetail.isOpen
  }),
)(ItemDetail as any);

// TODO: fix typings
