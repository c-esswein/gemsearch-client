import * as React from 'react';
import { DataItem } from 'types';
import * as queryActions from 'actions/query';
import { processServerResp } from 'api';
import { QueryItem } from 'components/queryBar/queryItem';
import { SearchInput } from 'components/queryBar/searchInput';
import { DispatchContext } from 'components/dispatchContextProvider';
import { SearchIcon } from 'icons';

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
    this.handleInputRemove = this.handleInputRemove.bind(this);
  }

  private handleAddIdChange(event: React.FormEvent<HTMLInputElement>) {
    this.setState({itemAddId: event.currentTarget.value});
  }

  private handleItemAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    this.queryItemInfo(this.state.itemAddId).
      then(item => item && this.context.dispatch(queryActions.addQueryItem(item)));
    this.setState({itemAddId: ''});
  }

  private queryItemInfo(id: string) {
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

  private handleRemoveItem(item: DataItem) {
    this.context.dispatch(queryActions.removeQueryItem(item));
  }

  private handleInputRemove() {
    if (this.props.queryItems.length > 0) {
      const lastItem = this.props.queryItems[this.props.queryItems.length - 1];
      this.context.dispatch(queryActions.removeQueryItem(lastItem));
    }
  }

  render() {
    const renderQueryItem = (item: DataItem) => {
      return (
        <QueryItem key={item.id} item={item} actionText="remove from query" onActionClick={this.handleRemoveItem} />
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
          <SearchInput onRemoveLatestSelection={this.handleInputRemove} />
          <SearchIcon className="svg-inline svg-fill-current queryBar__icon" />
        </div>
      </div>
    );
  }
}

