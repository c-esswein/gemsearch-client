import * as React from 'react';
import { DataItem } from 'types';
import * as actions from 'actions';
import { processServerResp } from 'api';
import { Item } from 'components/item';
import { SearchInput } from 'components/queryBar/searchInput';
import { DispatchContext } from 'components/dispatchContextProvider';

require('./queryBar.scss');

export interface Props {
  queryItems: DataItem[];
}

interface State {
  itemAddId: string;
}

export class QueryBar extends React.Component<Props, State> {
  static contextTypes = {
    dispatch: React.PropTypes.func.isRequired,
  };
  context: DispatchContext;

  constructor(props: Props) {
    super(props);
    this.state = {itemAddId: ''};

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
      then(item => item && this.context.dispatch(actions.addQueryItem(item)));
    this.setState({itemAddId: ''});
  }

  queryItemInfo(id: string) {
    return fetch('/api/object/' + id.trim())
      .then(response => response.json())
      .then(processServerResp)
      .then(function(result: DataItem[]) {
        if (result.length > 0) {
          return result[0];
        }
        alert('No Item found.');
        return null;
      });
  }

  handleRemoveItem(item: DataItem) {
    this.context.dispatch(actions.removeQueryItem(item));
  }

  render() {
    const renderQueryItem = (item: DataItem) => {
      return (
        <Item key={item.id} item={item} actionText="remove from query" onActionClick={this.handleRemoveItem} />
      );
    };

    return (
      <div className="queryBar app-wrap">
        {/*<form onSubmit={this.handleItemAdd}> 
          <input type="text" value={this.state.itemAddId} onChange={this.handleAddIdChange} placeholder="Object ID" /> 
        </form>
        */}
        <div className="queryBar__control">
          <div className="queryBar__q-items">
            {this.props.queryItems.map(renderQueryItem)}
          </div>
          <SearchInput />
        </div>
      </div>
    );
  }
}

