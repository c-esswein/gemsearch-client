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
import { GraphIcon, ListIcon, HeartIcon } from 'icons';
import { ConnectedItemDetail } from 'components/itemDetail';
import { DetailGraph } from 'components/graph/detailGraph';
import { connect } from 'react-redux';
import { StoreState, ViewModus } from 'types';
import { filterItemTypes } from 'constants/itemTypes';
import { ConnectedConnectDialog } from 'components/connectDialog';
import { checkSpotifyAuth } from 'sagas/user';
import { DbUser } from 'api/user';
import { RecommendationList } from 'components/recommendationList';
import { isUserEmbedded } from 'reducers/user';

export interface Props {
  queryItems: DataItem[];
  typeFilter: string[];
  viewModus: ViewModus;

  useUserAsContext: boolean,
  user: DbUser,
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
  }

  componentDidMount(): void {
    this.context.dispatch(checkSpotifyAuth());
  }

  private handleViewChangeClick(viewState: ViewModus) {
    const viewChangeAction = viewActions.changeMainViewType(viewState);
    this.context.dispatch(viewChangeAction);
  }

  private handleTypeFilterClick(filter: string) {
    const filterAction = queryActions.changeTypeFilter([filter]);
    this.context.dispatch(filterAction);
  }

  private renderViewLink(title: string, state: ViewModus, icon: JSX.Element) {
    return (
      <span 
        className={'app__view-link ' + (this.props.viewModus === state ? 'app__view-link--active' : '')}
        title={'Show results as ' + title}
        onClick={this.handleViewChangeClick.bind(this, state)}>
        {icon}
        <span>{title}</span>
      </span>
    );
  }

  private renderMainView(hasQueryItems: boolean) {
    const {viewModus, queryItems, typeFilter, useUserAsContext, user} = this.props;

    if (!hasQueryItems) {
      return (
        <IntroPanel />
      );
    }

    switch (viewModus) {
      case ViewModus.GRAPH:
        return (
          <DetailGraph queryItems={queryItems} typeFilter={typeFilter} useUserAsContext={useUserAsContext} user={user} />
          // <Graph items={props.resultItems} />
        );
      case ViewModus.RECOMMENDATIONS:
        return (
          <RecommendationList typeFilter={typeFilter} user={user} />
        );
    
      default:
        return (
          <ResultList queryItems={queryItems} typeFilter={typeFilter} useUserAsContext={useUserAsContext} user={user} />
        );
    }
  }

  render() {
    const { queryItems, typeFilter, user} = this.props;
    const hasQueryItems = (queryItems && queryItems.length > 0);
    const canShowRecommendations = isUserEmbedded(user);

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
              {canShowRecommendations ? this.renderViewLink('Recommended for you', ViewModus.RECOMMENDATIONS, <HeartIcon />) : null}
              {this.renderViewLink('List', ViewModus.LIST, <ListIcon />)}
              {this.renderViewLink('Graph', ViewModus.GRAPH, <GraphIcon />)}
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
    useUserAsContext: user.useUserAsContext,
    user: user.currentDbUser,
  }),
)(App as any);

// TODO: fix typings
