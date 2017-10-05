import * as React from 'react';
import { DispatchContext } from 'components/dispatchContextProvider';
import * as spotifyApi from 'api/spotify';

require('./connectDialog.scss');

export interface Props {
  isOpen: boolean;
  user: spotifyApi.SpotifyUser | null;  
}

/**
 * Dialog to explain and start actions for spotify connect and sync.
 */
export class ConnectDialog extends React.Component<Props, {}> {
  private elRef: HTMLDivElement;  
    
  static contextTypes = {
    dispatch: React.PropTypes.func.isRequired,
  };
  context: DispatchContext;

  constructor(props: Props) {
    super(props);

    this.handleDocumentClick = this.handleDocumentClick.bind(this);
    this.handleLoginClick = this.handleLoginClick.bind(this);
    this.handleSyncClick = this.handleSyncClick.bind(this);
  }

  public componentDidMount() {
    document.addEventListener('click', this.handleDocumentClick);
  }

  public componentWillUnmount() {
    document.removeEventListener('click', this.handleDocumentClick);
  }

  /**
   * Close modal on outside click.
   */
  private handleDocumentClick(e: MouseEvent) {
    const target = e.target as HTMLElement;

    if (!this.elRef || !this.props.isOpen) {
      return;
    }

    if(this.elRef === target || this.elRef.contains(target)) {
      return;
    }
    this.context.dispatch(setConnectDialogOpenState(false));    
  }

  private handleLoginClick() {
    spotifyApi.authorize();
  }
  
  private handleSyncClick() {
    const token = spotifyApi.getAccessToken();
    syncUser(token).then(response => {
        alert('sync done');
    });
  }

  render() {
    const { isOpen, user } = this.props;

    return (
        <div className={'connectDialog__container ' + (isOpen ? 'connectDialog--open' : '')}>
            <div className="connectDialog__overlay"></div>
            
            <div className="connectDialog" ref={ref => this.elRef = ref}>
                <h2>Connect your Spotify account</h2>
                <p>
                    Authenticate your Spotify account to get personalized search results based on your music preferences.
                </p>

                <h3>1. You authenticate with Spotify</h3>
                {user ? 
                    <div className="connectDialog__user">
                        Logged in as: {user.display_name}
                    </div>
                :
                    <div className="btn-raised" onClick={this.handleLoginClick}>
                        <SpotifyIcon className="connectDialog__spotify-logo" />
                        Login with spotify
                    </div>
                }

                <div className="connectDialog__next-steps">
                    <h3>2. We analyze your music taste</h3>
                    <p>
                        First your Spotify music library is compared against our database to find matching music tracks. Then our machine learning algorithm will analyze your music taste and creates a personal embedding.
                    </p>
                    {user ? 
                        <div className="btn-raised" onClick={this.handleSyncClick}>
                            Sync music
                        </div>
                    : null}

                    <h3>3. Enjoy</h3>
                    <p>
                        Start using your personalized results! :)
                    </p>

                    <h3>4. We scan missing songs</h3>
                    <p>
                        For tracks in your library which we did not know yet, we start our crawlers and analyser. Then we include this data and recalculate the prediction model to improve your experience.
                    </p>
                </div>

            </div>
        </div>
    );
  }
}





import { connect } from 'react-redux';
import { StoreState, ViewModus } from 'types';
import { setConnectDialogOpenState } from 'actions/views';
import { SpotifyIcon } from 'icons';
import { syncUser } from 'api/user';

export interface ConnectedProps {

}

export const ConnectedConnectDialog = connect(
  ({ views, user }: StoreState, ownProps: ConnectedProps) => ({
    isOpen: views.connectDialog.isOpen,
    user: user.currentUser,
  }),
)(ConnectDialog as any);

// TODO: fix typings
