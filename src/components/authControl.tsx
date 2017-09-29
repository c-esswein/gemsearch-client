import * as React from 'react';

import * as spotifyApi from 'api/spotify';
import * as SpotifyWebApi from 'spotify-web-api-js';
import { DispatchContext } from 'components/dispatchContextProvider';
import { clearCurrentUser, setCurrentUser } from 'actions/user';
import { syncUser } from 'api/user';

export interface Props {
  user: spotifyApi.SpotifyUser | null;
}

export class AuthControl extends React.Component<Props, null> {

  static contextTypes = {
    dispatch: React.PropTypes.func.isRequired,
  };
  
  context: DispatchContext;

  constructor(props: Props) {
    super(props);

    this.handleLoginClick = this.handleLoginClick.bind(this);
    this.handleLogoutClick = this.handleLogoutClick.bind(this);
    this.handleSyncClick = this.handleSyncClick.bind(this);
  }

  private async handleLoginClick() {
    spotifyApi.authorize();
  }

  private handleLogoutClick() {
    spotifyApi.logout();
    this.context.dispatch(clearCurrentUser());
  }

  private handleSyncClick() {
    const token = spotifyApi.getAccessToken();
    syncUser(token).then(response => {
      alert('sync done');
    });
  }

  render() {
    const {user} = this.props;

    if (user !== null) {
      return (
        <div className="tmp__auth">
          Logged in as: {user.display_name}
          <button onClick={this.handleLogoutClick}>logout</button><br />
          <button onClick={this.handleSyncClick}>sync lib</button>
        </div>
      );
    }

    return (
      <div className="tmp__auth">
        <button onClick={this.handleLoginClick}>login</button><br />
      </div>
    );
  }
  
}
