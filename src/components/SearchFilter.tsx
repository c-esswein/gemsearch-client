import * as React from 'react';
import {DataItem} from '../types';
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
    this.state = {itemAddId: ''};

    this.handleAddIdChange = this.handleAddIdChange.bind(this);
    this.handleItemAdd = this.handleItemAdd.bind(this);
  }

  handleAddIdChange(event: any) {
    this.setState({itemAddId: event.target.value});
  }

  handleItemAdd(e: any) {
    e.preventDefault();

    this.queryItemInfo(this.state.itemAddId).
      then(item => item && this.props.onQueryAdd(item));
    this.setState({itemAddId: ''});
  }

  queryItemInfo(id: string) {
    return fetch('/api/object/' + id)
      .then(response => response.json())
      .then(function(result) {
        if (result.length > 0) {
          return result[0];
        }
        alert('No Item found.');
        return null;
      });
  }

  render() {

    const renderQueryItem = (item: DataItem) => {
      return (
        <div className="SearchFilter__q-item" key={item.id}>
          {item.id} |
          {item.name} |
          {item.type}
        </div>
      );
    };

    return (
      <div className="SearchFilter">
        <h2 className="SearchFilter__hd">Search For:</h2>
        Add Item by Id: 
        <form onSubmit={this.handleItemAdd}> 
          <input type="text" value={this.state.itemAddId} onChange={this.handleAddIdChange} placeholder="Object ID" /> 
        </form>
        Current Filter:
        <div className="SearchFilter__q-items">
          {this.props.queryItems.map(renderQueryItem)}
        </div>
      </div>
    );
  }
}

export default SearchFilter;
