import * as React from 'react';
import * as Select from 'react-select';

require('./app.scss');

import { IntroPanel } from 'components/introPanel';
import { ResultList } from 'components/resultList';
import { ConnectedPlayerBar } from 'components/playerBar';
import { Graph } from 'components/graph/graph';
import { QueryBar } from 'components/queryBar/queryBar';
import { DataItem } from 'types';
import { processServerResp } from 'api';
import * as queryActions from 'actions/query';
import * as viewActions from 'actions/views';
import { DispatchContext } from 'components/dispatchContextProvider';
import { GraphIcon, ListIcon } from 'icons';


export interface Props {
  resultItems: DataItem[];
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

    this.onTypeFilterChange = this.onTypeFilterChange.bind(this);
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.queryItems !== this.props.queryItems ||
      nextProps.typeFilter !== this.props.typeFilter) {
      this.queryForItems(nextProps.queryItems, nextProps.typeFilter);
    }
  }

  queryForItems(query: DataItem[], typeFilter: string[]) {
    const queryIds = query.map(item => item.id);

    function queryParams(params: Object) {
      return Object.keys(params)
          .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
          .join('&');
    }

    fetch('/api/query?' + queryParams({
      'ids': queryIds.join('|'),
      'types': typeFilter.join('|')
    }))
      .then(response => response.json())
      .then(processServerResp)
      .then(data => this.context.dispatch(queryActions.receiveItems(data)));
  }

  handleViewChangeClick(viewState: ViewModus) {
    const viewChangeAction = viewActions.changeMainViewType(viewState);
    this.context.dispatch(viewChangeAction);
  }

  onTypeFilterChange(filter: {value: string}[]) {
    const filterAction = queryActions.changeTypeFilter(filter.map(item => item.value));
    this.context.dispatch(filterAction);
  }

  render() {
    const props = this.props;
    const hasQueryItems = (props.queryItems.length > 0);

    const renderViewLink = (title: string, state: ViewModus) => {
      if (!hasQueryItems) {
        return null;
      }

      return (
        <span 
          className={'app__view-link ' + (this.props.viewModus === state ? 'app__view-link--active' : '')}
          onClick={this.handleViewChangeClick.bind(this, state)}>
          {state === ViewModus.GRAPH ? 
              <GraphIcon /> :
              <ListIcon />
          }
          <span>{title}</span>
        </span>
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
          <Graph items={props.resultItems} />
        );        
      }
    };

    const typeOptions = ['track', 'tag', 'artist', 'user'].map(item => ({value: item, label: item}));

    return (
      <div className="app">
        <QueryBar queryItems={props.queryItems} />
        
        <div className="app-wrap app__filter">
          <Select
            value={props.typeFilter}
            options={typeOptions}
            onChange={this.onTypeFilterChange}
            multi={true} clearable={false}
          />

          <div className="app__view-links">
            {renderViewLink('Liste', ViewModus.LIST)}
            {renderViewLink('Graph', ViewModus.GRAPH)}
          </div>
        </div>

        {renderMainView()}

        <ConnectedPlayerBar />
      </div>
    );
  }
}


import { connect } from 'react-redux';
import { StoreState, ViewModus } from 'types';

export interface ConnectedProps extends Props {

}

export const ConnectedApp = connect(
  ({ query, views }: StoreState, ownProps: ConnectedProps) => ({
    resultItems: query.resultItems,
    queryItems: query.queryItems,
    typeFilter: query.typeFilter,
    viewModus: views.app.viewModus
  }),
)(App as any);

// TODO: fix typings
