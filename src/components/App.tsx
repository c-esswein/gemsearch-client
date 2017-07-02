import * as React from 'react';
import * as Select from 'react-select';

require('./app.scss');

import { IntroPanel } from 'components/introPanel';
import { ResultList } from 'components/resultList';
import { Graph } from 'components/graph/graph';
import { QueryBar } from 'components/queryBar/queryBar';
import { DataItem } from 'types';
import { processServerResp } from 'api';
import * as actions from 'actions';
import { DispatchContext } from 'components/dispatchContextProvider';
import { GraphIcon, ListIcon } from 'icons';


export interface Props {
  resultItems: DataItem[];
  queryItems: DataItem[];

  typeFilter: string[];
  viewState: ViewState
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
      .then(data => this.context.dispatch(actions.receiveItems(data)));
  }

  handleViewChangeClick(viewState: ViewState) {
    const viewChangeAction = actions.changeMainViewType(viewState);
    this.context.dispatch(viewChangeAction);
  }

  onTypeFilterChange(filter: {value: string}[]) {
    const filterAction = actions.changeTypeFilter(filter.map(item => item.value));
    this.context.dispatch(filterAction);
  }

  render() {
    const props = this.props;

    const renderViewLink = (title: string, state: ViewState) => {
      return (
        <span 
          className={'app__view-link ' + (this.props.viewState === state ? 'app__view-link--active' : '')}
          onClick={this.handleViewChangeClick.bind(this, state)}>
          {state === ViewState.GRAPH ? 
              <GraphIcon /> :
              <ListIcon />
          }
          <span>{title}</span>
        </span>
      );
    };

    const renderMainView = () => {
      if (this.props.queryItems.length < 1) {
        return (
          <IntroPanel />
        );
      }

      if (this.props.viewState === ViewState.LIST) {
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
            {renderViewLink('Liste', ViewState.LIST)}
            {renderViewLink('Graph', ViewState.GRAPH)}
          </div>
        </div>

        {renderMainView()}
      </div>
    );
  }
}


import { connect } from 'react-redux';
import { StoreState, ViewState } from 'types';

export const ConnectedApp = connect(
  ({ queryItems, resultItems, typeFilter, views }: StoreState) => {
    return {
      queryItems,
      resultItems,
      typeFilter,
      viewState: views.app.viewState
    };
  },
)(App as any);
// TODO: fix typings

