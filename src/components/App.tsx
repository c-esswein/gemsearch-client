import * as React from 'react';
import { ResultList } from 'components/resultList';
import { Graph } from 'components/graph';
import { SearchFilter } from 'components/searchFilter';
import { DataItem } from 'types';
import { processServerResp } from 'api';
import * as actions from 'actions';
import * as Select from 'react-select';

require('./app.css');
require('react-select/dist/react-select.css');
import { DispatchContext } from 'components/dispatchContextProvider';

export interface Props {
  resultItems: DataItem[];
  queryItems: DataItem[];

  typeFilter: string[];
}

interface State {
  viewState: ViewState;
}

enum ViewState {
    LIST, GRAPH
}

export class App extends React.Component<Props, State> {
  static contextTypes = {
    dispatch: React.PropTypes.func.isRequired,
  };

  context: DispatchContext;

  constructor(props: Props) {
    super(props);

    this.state = {viewState: ViewState.LIST};

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
    this.setState({viewState});
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
          className={'App__view-link ' + (this.state.viewState === state ? 'App__view-link--active' : '')}
          onClick={this.handleViewChangeClick.bind(this, state)}>
          {title}
        </span>
      );
    };

    const renderMainView = () => {
      if (this.state.viewState === ViewState.LIST) {
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
      <div className="App">
        <SearchFilter queryItems={props.queryItems} />
        
        <div className="App-wrap">
          <Select
            value={props.typeFilter}
            options={typeOptions}
            onChange={this.onTypeFilterChange}
            multi={true}
          />
          <div className="App__view-links">
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
import { StoreState } from 'types';

export const ConnectedApp = connect(
  ({ queryItems, resultItems, typeFilter }: StoreState) => {
    return {
      queryItems,
      resultItems,
      typeFilter 
    };
  },
)(App as any);
// TODO: fix typings

