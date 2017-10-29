import * as React from 'react';
import { DispatchContext } from 'components/dispatchContextProvider';
import * as spotifyApi from 'api/spotify';
import { connect } from 'react-redux';
import { StoreState, ViewModus } from 'types';
import { setConnectDialogOpenState } from 'actions/views';
import { SpotifyIcon, CheckIcon } from 'icons';
import * as userApi from 'api/user';
import { LoadingIndicator } from 'components/loadingIndicator';
import { setCurrentDbUser } from "actions/user";

require('./connectDialog.scss');

export interface Props {
  isOpen: boolean;
  user: spotifyApi.SpotifyUser | null;  
  dbUser: userApi.DbUser | null;  
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
  
  private async handleSyncClick() {
    // start syncing music
    try {
        const {user} = this.props;
        const token = spotifyApi.getAccessToken();
        const dbUser = await userApi.syncMusic(user.id, token);
        this.context.dispatch(setCurrentDbUser(dbUser));
      } catch (error) {
        console.error(error);
        alert('Unknown error while syncing your spotify music:' + error);
      }
  }

  private renderSyncStep() {
    const { user, dbUser } = this.props;
    const isSpotifySyncing = user && !dbUser;
    const crawlingTimePerTrack = 1.5; // in seconds

    const heading = <h3>2. We analyze your music taste</h3>;

    const explainText = (
        <p>
            First your Spotify music library is compared against our database to find matching music tracks. Then our machine learning algorithm will analyze your music taste and creates a personal embedding.
        </p>
    );

    if (!user) {
        return (
            <div className="connectDialog__next-steps">
                {explainText}
            </div>
        );
    }

    if (isSpotifySyncing) {
        return (
            <div>
                {heading}
                <div>We currently synchronize your Spotify music.</div>
                <LoadingIndicator inverted={true} />                
            </div>
        );
    }

    // music just synced
    if (dbUser.missingTrackCount > 0) {
        let timeToCrawl = dbUser.missingTrackCount * crawlingTimePerTrack;
        if (timeToCrawl > 0) {
            // cast to minutes
            timeToCrawl = Math.ceil(timeToCrawl / 60);
        }
        return (
            <div>
                {heading}
                <div><CheckIcon /> We successfully synchronized {dbUser.syncedTracks} tracks. </div>
                {dbUser.missingTrackCount > 0 ?
                    <div>
                        There were {dbUser.missingTrackCount} tracks in your library we did not know yet. But no problem, we start our crawlers and analyser to include this songs. This
                        can take up to {timeToCrawl} minutes. Afterwards our machine learning algorithms will analyze your music taste and create your personal embedding.
                    </div>
                :
                    <div>Our machine learning algorithms are analyzing your music taste currently. This can take up to 30min.</div>
                }
                <LoadingIndicator inverted={true} />                
            </div>
        );
    }

    // waiting for embedding
    if (dbUser.userStatus === 'SPOTIFY_SYNCED' || dbUser.userStatus === 'PARTIAL_EMBEDDED') {
        return (
            <div>
                {heading}
                <div><CheckIcon /> We successfully synchronized your music.</div>                
                <div>Our machine learning algorithms are analyzing your music taste currently. This can take up to 30min.</div>    
                <LoadingIndicator inverted={true} />                                            
            </div>
        );
    }

    // restart sync
    return (
        <div>
            {heading}
            {explainText}
            <br />
            <div><CheckIcon /> We successfully synchronized your music. Do you have new music which you want to include? Just restart the sync process:</div>
            <div className="btn-raised" onClick={this.handleSyncClick}>Synchronize again</div>
        </div>
    );
  }

  private renderEnjoy() {
    const { dbUser } = this.props;
    const ready = dbUser && (dbUser.userStatus === 'EMBEDDED' || dbUser.userStatus === 'PARTIAL_EMBEDDED');

    if (ready) {
        return (
            <div className="">
                <h3>3. Enjoy</h3>
                <p>
                    <CheckIcon />
                    Start using your personalized results! :)
                </p>
            </div>
        );

    } else {
        return (
            <div className="connectDialog__next-steps">
                <h3>3. Enjoy</h3>
                <p>
                    Start using your personalized results! :)
                </p>
            </div>
        );
    }

  }

  render() {
    const { isOpen, user, dbUser } = this.props;
    
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

                {this.renderSyncStep()}

                {this.renderEnjoy()}

            </div>
        </div>
    );
  }
}

export interface ConnectedProps {

}

export const ConnectedConnectDialog = connect(
  ({ views, user }: StoreState, ownProps: ConnectedProps) => ({
    isOpen: views.connectDialog.isOpen,
    user: user.currentUser,
    dbUser: user.currentDbUser,
  }),
)(ConnectDialog as any);

// TODO: fix typings
