import * as React from 'react';
import * as actions from 'actions';
import { DispatchContext } from 'components/dispatchContextProvider';

import { getAuthStatus, authorize } from 'api/spotify';
import * as SpotifyWebApi from 'spotify-web-api-js';

require('./playerBar.scss');

export interface Props {
}

export class PlayerBar extends React.Component<Props, null> {

  static contextTypes = {
    dispatch: React.PropTypes.func.isRequired,
  };
  context: DispatchContext;

  constructor(props: Props) {
    super(props);

    this.handleLoginClick = this.handleLoginClick.bind(this);
    this.getUserMusic = this.getUserMusic.bind(this);
  }

  private handleLoginClick() {
    getAuthStatus().then(code => {
      console.log(code);

      if (!code) {

        authorize();
      }
    });
  }

  private getUserMusic() {
    const token = 'BQD6KSFis0jllYEA1gx6wIVa_CjuQcGWJUcrjQHPKdkLyQaxeyvKr1pgzHpEzowHKDCYOI35qkTWRRx9LrwFhpZZyjKhn70LqSDyU6MGNzpy3kp1R3v0sjbqBKWLjKhqNliaZGxtyv-voIPS2Fyy3w';

    const spotifyApi = new SpotifyWebApi();
    spotifyApi.setAccessToken(token);

    // spotifyApi.getMyRecentlyPlayedTracks().then(res => console.log(res));
    spotifyApi.getMySavedTracks({limit: 50}).then(res => console.log(res));
  }

  render() {


    return (
      <div className="playerBar">
          <span onClick={this.handleLoginClick}>login</span><br />
          <span onClick={this.getUserMusic}>get info</span>
      </div>
    );
  }
  
}
