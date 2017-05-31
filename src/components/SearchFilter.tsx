import * as React from 'react';
import {DataItem} from '../types';
import Item from './Item';

import './SearchFilter.css';

export interface Props {
  queryItems: DataItem[];
  onQueryAdd: (item: DataItem) => void;
  onQueryRemove: (item: DataItem) => void;
}

interface State {
  itemAddId: string;
}

class SearchFilter extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {itemAddId: '5730db37a90a9a398d00d213'};

    this.handleAddIdChange = this.handleAddIdChange.bind(this);
    this.handleItemAdd = this.handleItemAdd.bind(this);
    this.handleRemoveItem = this.handleRemoveItem.bind(this);
  }

  handleAddIdChange(event: React.FormEvent<HTMLInputElement>) {
    this.setState({itemAddId: event.currentTarget.value});
  }

  handleItemAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    this.queryItemInfo(this.state.itemAddId).
      then(item => item && this.props.onQueryAdd(item));
    this.setState({itemAddId: ''});
  }

  queryItemInfo(id: string) {
    return fetch('/api/object/' + id.trim())
      .then(response => response.json())
      .then(function(result: DataItem[]) {
        if (result.length > 0) {
          return result[0];
        }
        alert('No Item found.');
        return null;
      });
  }

  handleRemoveItem(item: DataItem) {
    this.props.onQueryRemove(item);
  }

  render() {

    const renderQueryItem = (item: DataItem) => {
      return (
        <Item key={item.id} item={item} actionText="remove from query" onActionClick={this.handleRemoveItem} />
      );
    };

    return (
      <div className="SearchFilter App-wrap">
        <h2 className="SearchFilter__hd">Search For:</h2>
        Add Item by Id: 
        <form onSubmit={this.handleItemAdd}> 
          <input type="text" value={this.state.itemAddId} onChange={this.handleAddIdChange} placeholder="Object ID" /> 
        </form>
        <div className="SearchFilter__q-items">
          {this.props.queryItems.map(renderQueryItem)}
        </div>
      </div>
    );
  }
}

export default SearchFilter;
