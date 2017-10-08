import * as React from 'react';
// import * as Select from 'react-select';

require('./app.scss');

import { IntroPanel } from 'components/introPanel';
import { ResultList } from 'components/resultList';
import { ConnectedPlayerBar } from 'components/playerBar';
import { Graph } from 'components/graph/graph';
import { QueryBar } from 'components/queryBar/queryBar';
import { DataItem } from 'types';
import { queryForItems, QueryServerResult } from 'api/query';
import * as queryActions from 'actions/query';
import * as viewActions from 'actions/views';
import { DispatchContext } from 'components/dispatchContextProvider';
import { GraphIcon, ListIcon } from 'icons';
import { ConnectedItemDetail } from 'components/itemDetail';
import { ConnectedDetailGraph } from 'components/graph/detailGraph';
import * as spotifyApi from 'api/spotify';
import { setCurrentUser } from 'actions/user';
import { connect } from 'react-redux';
import { StoreState, ViewModus } from 'types';
import { filterItemTypes } from 'constants/itemTypes';
import { ConnectedConnectDialog } from 'components/connectDialog';


export interface Props {
  resultItems: DataItem[];
  result: QueryServerResult;
  queryItems: DataItem[];

  typeFilter: string[];
  viewModus: ViewModus;
}

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
    // check for spotify auth
    if (spotifyApi.checkUrlForAuth() || spotifyApi.getAccessToken()) {
      try {
        spotifyApi.getUserInfo().then(user => {
          this.context.dispatch(setCurrentUser(user));      
        });
      } catch (ex) {
        console.error(ex);
        alert('spotify auth error');
      }
      
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.queryItems !== this.props.queryItems ||
      nextProps.typeFilter !== this.props.typeFilter) {
      this.queryForItems(nextProps.queryItems, nextProps.typeFilter);
    }
  }

  /**
   * Query api for items.
   */
  private queryForItems(query: DataItem[], typeFilter: string[]) {
    queryForItems(query, typeFilter)
      .then(data => this.context.dispatch(queryActions.receiveItems(data)));
  }

  private handleViewChangeClick(viewState: ViewModus) {
    const viewChangeAction = viewActions.changeMainViewType(viewState);
    this.context.dispatch(viewChangeAction);
  }

  private handleTypeFilterClick(filter: string) {
    const filterAction = queryActions.changeTypeFilter([filter]);
    this.context.dispatch(filterAction);
  }

  render() {
    const props = this.props;
    const hasQueryItems = (props.queryItems.length > 0);

    const renderViewLink = (title: string, state: ViewModus) => {
      return (
        <span 
          className={'app__view-link ' + (props.viewModus === state ? 'app__view-link--active' : '')}
          title={'Show results as ' + title}
          onClick={this.handleViewChangeClick.bind(this, state)}>
          {state === ViewModus.GRAPH ? 
              <GraphIcon /> :
              <ListIcon />
          }
          <span>{title}</span>
        </span>
      );
    };

    const renderTypeFilter = (filterName: string) => {
      const isActive = props.typeFilter.indexOf(filterName) > -1;
      return (
        <div key={filterName} className={'app__type-filter ' + (isActive ? 'app__type-filter--active' : '')} 
          title={'Filter for ' + filterName}
          onClick={() => this.handleTypeFilterClick(filterName)}>
          {filterName}
        </div>
      );
    };

    const renderMainView = () => {
      if (!hasQueryItems) {
        return (
          <IntroPanel />
        );
      }

      if (props.viewModus === ViewModus.LIST) {
        return (
          <ResultList items={props.resultItems} />
        );
      } else {
        return (
          <ConnectedDetailGraph />
          // <Graph items={props.resultItems} />
        );        
      }
    };


    return (
      <div className="app">
        <QueryBar queryItems={props.queryItems} />
        
        {hasQueryItems ? 
          <div className="app__filter">
            <div className="app__type-filters">
              {filterItemTypes.map(renderTypeFilter)}
            </div>

            <div className="app__view-links">
              {renderViewLink('List', ViewModus.LIST)}
              {renderViewLink('Graph', ViewModus.GRAPH)}
            </div>
          </div>
          : null 
        }

        {renderMainView()}

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
    resultItems: query.resultItems,
    result: query.result,
    queryItems: query.queryItems,
    typeFilter: query.typeFilter,
    viewModus: views.app.viewModus,
  }),
)(App as any);

// TODO: fix typings
