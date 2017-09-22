import * as React from 'react';

import { authorize } from 'api/spotify';
import * as SpotifyWebApi from 'spotify-web-api-js';


export interface Props {
}

export class AuthControl extends React.Component<Props, null> {

  constructor(props: Props) {
    super(props);

    this.handleLoginClick = this.handleLoginClick.bind(this);
  }

  private handleLoginClick() {
    alert('not active');
    /* getAuthStatus().then(code => {
      console.log(code);

      if (!code) {

        authorize();
      } else {
      }
    }); */
  }

  private getUserMusic() {
    /* const scopes = ['user-read-private', 'user-read-email'],
                  redirectUri = 'https://example.com/callback',
                  clientId = '5fe01282e44241328a84e7c5cc169165',
                  state = 'some-state-of-my-choice';

    // Setting credentials can be done in the wrapper's constructor, or using the API object's setters.
    const spotifyApi = new SpotifyWebApi({
      redirectUri : redirectUri,
      clientId : clientId
    });

    // Create the authorization URL
    const authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);

    console.log(authorizeURL); */


    // spotifyApi.getMyRecentlyPlayedTracks().then(res => console.log(res));
    // spotifyApi.getMySavedTracks({limit: 50}).then(res => console.log(res));
  }

  render() {
    return (
        <div className="tmp__auth">
            <button onClick={this.handleLoginClick}>login</button><br />
            <button onClick={this.getUserMusic}>get info</button>
        </div>
    );
  }
  
}
