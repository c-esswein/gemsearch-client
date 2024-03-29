import * as React from 'react';
import * as actions from 'actions';

import { Track } from 'types';
import { PlayIcon, PauseIcon, WarningIcon } from 'icons';
import { DispatchContext } from 'components/dispatchContextProvider';
import { AuthControl } from 'components/authControl';
import * as playerActions from 'actions/player';

require('./playerBar.scss');

export interface Props {
  currentTrack: Track,
  isPlaying: boolean,
}

/**
 * Bottom bar to play and control preview playing.
 */
export class PlayerBar extends React.Component<Props, null> {

  static contextTypes = {
    dispatch: React.PropTypes.func.isRequired,
  };
  context: DispatchContext;

  private audio: HTMLAudioElement;

  constructor(props: Props) {
    super(props);

    this.audio = new Audio();

    this.handleControlsClick = this.handleControlsClick.bind(this);
  }

  componentWillReceiveProps(nextProps: Props): void {
    if (nextProps.currentTrack !== this.props.currentTrack) {
      this.playTrack(nextProps.currentTrack);
    }
    
    this.setPlaying(nextProps.isPlaying);
  }

  private playTrack(track: Track) {
    if (this.audio.src) {
      this.audio.pause();
    }

    if (track.meta.preview_url) {
      this.audio.src = track.meta.preview_url;
      this.audio.play();
    } else {
      this.audio.src = '';
    }
  }

  private setPlaying(isPlaying: boolean) {
    if (!this.audio.src) {
      return;
    }

    if (this.props.isPlaying && !isPlaying) {
      this.audio.pause();
    }
    if (!this.props.isPlaying && isPlaying) {
      this.audio.play();
    }
  }

  private handleControlsClick() {
    const isPlaying = this.props.isPlaying;
    const action = playerActions.setPlaying(!isPlaying);

    this.context.dispatch(action);
  }

  render() {
    const track = this.props.currentTrack;

    if (!track) {
      return null;
    }

    const isPlayable = !!track.meta.preview_url;

    return (
      <div className="playerBar">
          {isPlayable ? 
            <div className="playerBar__control playerBar__control--pa" onClick={this.handleControlsClick}>
              {this.props.isPlaying ? 
                <PauseIcon className="playerBar__control-play-icon" /> :
                <PlayIcon className="playerBar__control-play-icon" />
              }
            </div>
          :
            <div className="playerBar__control" title="No preview available">
              <WarningIcon className="playerBar__control-warning-icon" />
            </div>
          }
          <div className="playerBar__meta">
            <div className="playerBar__meta-name">{track.name}</div>
            {track.meta && track.meta.artist ?
              <div className="playerBar__meta-artist">{track.meta.artist}</div>
              : null}
          </div>

      </div>
    );
  }
  
}


import { StoreState } from 'types';
import { connect } from 'react-redux';


interface ConnectedProps {

}

export const ConnectedPlayerBar = connect(
  ({player, user}: StoreState, ownProps: ConnectedProps) => ({
    currentTrack: player.currentTrack,
    isPlaying: player.isPlaying,
  }),
)(PlayerBar as any);
// TODO: fix typings

