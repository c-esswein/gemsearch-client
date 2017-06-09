import * as React from 'react';
import ResultList from './resultList';
import Graph from './graph';
import SearchFilter from './searchFilter';
import { DataItem } from '../types';
import { processServerResp } from '../api';

import './app.css';

export interface Props {
  resultItems: DataItem[];
  queryItems: DataItem[];
  onAddQueryItem: (item: DataItem) => void;
  onRemoveQueryItem: (item: DataItem) => void;
  queryForItems: (query: DataItem[]) => void;
  receiveItems: (query: DataItem[]) => void;
}

interface State {
  viewState: ViewState;
}

enum ViewState {
    LIST, GRAPH
}

class App extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);

    this.state = {viewState: ViewState.LIST};
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.queryItems !== this.props.queryItems) {
      // this.props.queryForItems(nextProps.queryItems);
      this.queryForItems(nextProps.queryItems);
    }
  }

  queryForItems(query: DataItem[]) {
    const queryIds = query.map(item => item.id);

    function queryParams(params: Object) {
      return Object.keys(params)
          .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
          .join('&');
    }

    fetch('/api/query?' + queryParams({'ids': queryIds.join('|')}))
      .then(response => response.json())
      .then(json => processServerResp(json))
      .then(data => this.props.receiveItems(data));
  }

  handleViewChangeClick(viewState: ViewState) {
    this.setState({viewState});
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
          <ResultList items={props.resultItems} onQueryAdd={props.onAddQueryItem} />
        );
      } else {
        return (
          <Graph items={props.resultItems} onQueryAdd={props.onAddQueryItem} />
        );        
      }
    };

    return (
      <div className="App">
        <SearchFilter 
          queryItems={props.queryItems} onQueryAdd={props.onAddQueryItem} onQueryRemove={props.onRemoveQueryItem} />
        
        <div className="App__view-links">
          {renderViewLink('Liste', ViewState.LIST)}
          {renderViewLink('Graph', ViewState.GRAPH)}
        </div>

        {renderMainView()}
      </div>
    );
  }
}

export default App;
