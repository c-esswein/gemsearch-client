import * as React from 'react';
import * as spotifyApi from 'api/spotify';
import { DispatchContext } from 'components/dispatchContextProvider';
import { clearCurrentUser } from 'actions/user';
import { SpotifyIcon } from 'icons';
import { setConnectDialogOpenState } from 'actions/views';

require('./authControl.scss');

export interface Props {
  user: spotifyApi.SpotifyUser | null;
  isOpenConnectDialog: boolean;
}

/**
 * Spotify Login / user indication button.
 */
export class AuthControl extends React.Component<Props, null> {

  static contextTypes = {
    dispatch: React.PropTypes.func.isRequired,
  };
  
  context: DispatchContext;

  constructor(props: Props) {
    super(props);

    this.handleIconClick = this.handleIconClick.bind(this);
    this.handleLogoutClick = this.handleLogoutClick.bind(this);
  }

  private async handleIconClick() {
    const {isOpenConnectDialog} = this.props;
    
    window.setTimeout(() => {
      this.context.dispatch(
        setConnectDialogOpenState(!isOpenConnectDialog)
      );
    }, 5);
  }

  private handleLogoutClick() {
    spotifyApi.logout();
    this.context.dispatch(clearCurrentUser());
  }

  render() {
    const {user, isOpenConnectDialog} = this.props;

    if (user !== null) {
      const imgUrl = user.images ? (user.images.find(image => image.width === 160) || user.images[0]).url : '';
      
      return (
        <div className="authControl authControl--user">
          <div className="authControl__info">
            <div className="authControl__name">{user.display_name}</div>
            <a onClick={this.handleLogoutClick}>logout</a>
          </div>
          <div className="authControl__userimg" style={{backgroundImage: `url(${imgUrl})`}} onClick={this.handleIconClick}></div>
        </div>
      );
    }

    return (
      <div className={'authControl authControl--login ' + (isOpenConnectDialog ? 'authControl--connect-open' : '')}
        title="connect with Spotify" onClick={this.handleIconClick}>
        <SpotifyIcon className="authControl__logo" />
      </div>
    );
  }
  
}





import { connect } from 'react-redux';
import { StoreState } from 'types';

export interface ConnectedProps {

}

export const ConnectedAuthControl = connect(
  ({ views, user }: StoreState, ownProps: ConnectedProps) => ({
    isOpenConnectDialog: views.connectDialog.isOpen,
    user: user.currentUser
  }),
)(AuthControl as any);

// TODO: fix typings
