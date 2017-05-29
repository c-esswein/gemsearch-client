import * as React from 'react';
import ResultList from './ResultList';
import SearchFilter from './SearchFilter';
import {DataItem} from '../types';
import './App.css';

export interface Props {
  resultItems: DataItem[];
  queryItems: DataItem[];
  onAddQueryItem: (item: DataItem) => void;
  onRemoveQueryItem: (item: DataItem) => void;
  queryForItems: (query: DataItem[]) => void;
  recieveItems: (query: DataItem[]) => void;
}

class App extends React.Component<Props, null> {

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
      .then(json => this.props.recieveItems);
  }

  render() {
    const props = this.props;

    return (
      <div className="App">
        <SearchFilter 
          queryItems={props.queryItems} onQueryAdd={props.onAddQueryItem} onQueryRemove={props.onRemoveQueryItem} />
        <ResultList items={props.resultItems} />
      </div>
    );
  }
}


export default App;
