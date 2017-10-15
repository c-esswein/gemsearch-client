import * as React from 'react';
import { DataItem, Track } from 'types';
import { PlayIcon, AddIcon } from 'icons';
import { DispatchContext } from 'components/dispatchContextProvider';
import * as playerActions from 'actions/player';
import * as viewActions from 'actions/views';
import * as queryActions from 'actions/query';
import { xFetch } from 'utils';
import { LoadingIndicator } from 'components/loadingIndicator';
import { filterItemTypes } from 'constants/itemTypes';

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
        neighbors: null
      };

      this.handlePlayClick = this.handlePlayClick.bind(this);
      this.handleNeighborClick = this.handleNeighborClick.bind(this);
      this.handleFilterClick_ = this.handleFilterClick_.bind(this);
      this.handleRequestClose = this.handleRequestClose.bind(this);
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.item !== this.props.item) {
      
      getNeighbors(nextProps.item.id, filterItemTypes).then(result => 
        this.setState({
          neighbors: result.nodes
        })
      );
      
    }
  }

  private handlePlayClick() {
    const item = this.props.item;

    this.context.dispatch(
      playerActions.playTrack(item as Track)
    );
  }

  private handleNeighborClick(item: DataItem) {
    if (item.type === 'track') {
      this.context.dispatch(
        playerActions.playTrack(item as Track)
      );
    } else {
      this.context.dispatch(
        viewActions.openItemDetail(item)
      );
    }

  }



  private handleFilterClick_(e: React.MouseEvent<HTMLElement>) {
    this.context.dispatch(queryActions.addQueryItem(this.props.item));
  }

  private handleRequestClose() {
      this.context.dispatch(
          viewActions.closeItemDetail()
      );
      
      this.state = {
        neighbors: null
      };
  }

  private renderImage() {
    const item = this.props.item;

    if (!item) {
      return (
        <div className="resultItem__img resultItem__img--empty"></div>
      );
    }

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

  private renderNeighbors() {
    if (this.state.neighbors === null) {
      return <LoadingIndicator />;
    }

    return this.state.neighbors.map(item => {
      if (item.type === 'track') {
        return (
          <div className="itemDetail__neighbor" key={item.id} onClick={() => this.handleNeighborClick(item)}>
            <div className="itemDetail__neighbor-type">
              {item.type}
            </div>
            <div className="itemDetail__neighbor-name smallTrackInfo">
              <PlayIcon />
              <span className="smallTrackInfo__name">{item.name}</span>
            </div>
          </div>
        );
      } else {
        return (
          <div className="itemDetail__neighbor" key={item.id} onClick={() => this.handleNeighborClick(item)}>
            <div className="itemDetail__neighbor-type">
              {item.type}
            </div>
            <div className="itemDetail__neighbor-name">
              {item.name}
            </div>
          </div>
        );
      }
    });
  }

  render() {
    const { item, isOpen } = this.props;

    return (
      <div className={'itemDetail__container ' + (isOpen ? 'itemDetail--open' : 'itemDetail--closed')}> 
        <div className="itemDetail__overlay" onClick={this.handleRequestClose}></div>   
        <div className="itemDetail">
          <div className="itemDetail__left">
            {this.renderImage()}
          </div>
          <div className="itemDetail__main">
            <div className="itemDetail__type textappear-anim">{item ? item.type : ''}</div>
            <span className="itemDetail__name textappear-anim">{item ? item.name : ''}</span>
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
import { getNeighbors } from 'api/query';

export interface ConnectedProps {

}

export const ConnectedItemDetail = connect(
  ({ views }: StoreState, ownProps: ConnectedProps) => ({
    item: views.itemDetail.item,
    isOpen: views.itemDetail.isOpen
  }),
)(ItemDetail as any);

// TODO: fix typings
