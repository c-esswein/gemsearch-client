import * as React from 'react';
// import * as Select from 'react-select';

require('./app.scss');

import { IntroPanel } from 'components/introPanel';
import { ResultList } from 'components/resultList';
import { ConnectedPlayerBar } from 'components/playerBar';
import { Graph } from 'components/graph/graph';
import { QueryBar } from 'components/queryBar/queryBar';
import { DataItem } from 'types';
import * as queryActions from 'actions/query';
import * as viewActions from 'actions/views';
import { DispatchContext } from 'components/dispatchContextProvider';
import { GraphIcon, ListIcon } from 'icons';
import { ConnectedItemDetail } from 'components/itemDetail';
import { DetailGraph } from 'components/graph/detailGraph';
import * as spotifyApi from 'api/spotify';
import * as userApi from 'api/user';
import { setCurrentUser, setCurrentDbUser, setSpotifySyncResult } from 'actions/user';
import { connect } from 'react-redux';
import { StoreState, ViewModus } from 'types';
import { filterItemTypes } from 'constants/itemTypes';
import { ConnectedConnectDialog } from 'components/connectDialog';

export interface Props {
  queryItems: DataItem[];
  typeFilter: string[];
  viewModus: ViewModus;
}

/**
 * Main app wrapper.
 */
export class App extends React.Component<Props, null> {

  static contextTypes = {
    dispatch: React.PropTypes.func.isRequired,
  };
  context: DispatchContext;

  constructor(props: Props) {
    super(props);

    this.handleTypeFilterClick = this.handleTypeFilterClick.bind(this);
    this.handleSpotifyUserLoaded = this.handleSpotifyUserLoaded.bind(this);
  }

  componentDidMount(): void {
    this.checkSpotifyAuth(); 
  }

  /**
   * Check if access token is set or contained in url. If so, load spotify user
   * and check current state of user in own db.
   */
  private checkSpotifyAuth() {
    if (spotifyApi.checkUrlForAuth() || spotifyApi.getAccessToken()) {
      try {
        spotifyApi.getUserInfo().then(this.handleSpotifyUserLoaded);
      } catch (ex) {
        console.error(ex);
        alert('spotify auth error');
      }
      
    }
  }

  /**
   * Handles successful login with spotify account. (initial or relogin)
   */
  private async handleSpotifyUserLoaded(user: spotifyApi.SpotifyUser) {
    // set user state
    this.context.dispatch(setCurrentUser(user));
    
    // check api for known user
    const dbUser = await userApi.checkUser(user.id);
    this.context.dispatch(setCurrentDbUser(dbUser));
    
    if (dbUser === null) {
      // new user --> start syncing music
      try {
        // open connect dialog to show status
        this.context.dispatch(viewActions.setConnectDialogOpenState(true));
        
        const token = spotifyApi.getAccessToken();
        const syncResult = await userApi.syncMusic(user.id, token);
        this.context.dispatch(setSpotifySyncResult(syncResult));
      } catch (error) {
        console.error(error);
        alert('Unknown error while syncing your spotify music:' + error);
      }

    }
  }

  private handleViewChangeClick(viewState: ViewModus) {
    const viewChangeAction = viewActions.changeMainViewType(viewState);
    this.context.dispatch(viewChangeAction);
  }

  private handleTypeFilterClick(filter: string) {
    const filterAction = queryActions.changeTypeFilter([filter]);
    this.context.dispatch(filterAction);
  }

  private renderViewLink(title: string, state: ViewModus) {
    return (
      <span 
        className={'app__view-link ' + (this.props.viewModus === state ? 'app__view-link--active' : '')}
        title={'Show results as ' + title}
        onClick={this.handleViewChangeClick.bind(this, state)}>
        {state === ViewModus.GRAPH ? 
            <GraphIcon /> :
            <ListIcon />
        }
        <span>{title}</span>
      </span>
    );
  }

  private renderMainView(hasQueryItems: boolean) {
    const {viewModus, queryItems, typeFilter} = this.props;

    if (!hasQueryItems) {
      return (
        <IntroPanel />
      );
    }

    if (viewModus === ViewModus.LIST) {
      return (
        <ResultList queryItems={queryItems} typeFilter={typeFilter} />
      );
    } else {
      return (
        <DetailGraph queryItems={queryItems} typeFilter={typeFilter} />
        // <Graph items={props.resultItems} />
      );        
    }
  }

  render() {
    const {queryItems, typeFilter} = this.props;
    const hasQueryItems = (queryItems && queryItems.length > 0);

    return (
      <div className="app">
        <QueryBar queryItems={queryItems} />
        
        {hasQueryItems ? 
          <div className="app__filter">
            <div className="app__type-filters">
              {filterItemTypes.map(filterName => {
                const isActive = typeFilter.indexOf(filterName) > -1;
                return (
                  <div key={filterName} className={'app__type-filter ' + (isActive ? 'app__type-filter--active' : '')} 
                    title={'Filter for ' + filterName}
                    onClick={() => this.handleTypeFilterClick(filterName)}>
                    {filterName}
                  </div>
                );
              })}
            </div>

            <div className="app__view-links">
              {this.renderViewLink('List', ViewModus.LIST)}
              {this.renderViewLink('Graph', ViewModus.GRAPH)}
            </div>
          </div>
          : null 
        }

        {this.renderMainView(hasQueryItems)}

        <ConnectedPlayerBar />

        {/* --- Modals --- */}
        <ConnectedItemDetail />
        <ConnectedConnectDialog />
      </div>
    );
  }
}



export interface ConnectedProps extends Props {

}

export const ConnectedApp = connect(
  ({ query, views, user }: StoreState, ownProps: ConnectedProps) => ({
    queryItems: query.queryItems,
    typeFilter: query.typeFilter,
    viewModus: views.app.viewModus,
  }),
)(App as any);

// TODO: fix typings
