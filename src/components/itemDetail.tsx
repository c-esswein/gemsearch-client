import * as React from 'react';
import { DataItem, Track } from 'types';
import { PlayIcon } from 'icons';
import { DispatchContext } from 'components/dispatchContextProvider';
import * as playerActions from 'actions/player';
import * as viewActions from 'actions/views';
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

  private handleRequestClose() {
      this.context.dispatch(
          viewActions.closeItemDetail()
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
                  <div className="itemDetail__type">{item.type}</div>
                  {item.type !== 'tag' ? this.renderImage() : null}
                </div>
                <div className="itemDetail__main">
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
