import * as React from 'react';
import { Item } from 'components/item';
import { DataItem } from 'types';
import * as actions from 'actions';
import { DispatchContext } from 'components/dispatchContextProvider';

require('./resultList.css');

export interface Props {
  items: DataItem[];
}

export class ResultList extends React.Component<Props, null> {

  static contextTypes = {
    dispatch: React.PropTypes.func.isRequired,
  };
  context: DispatchContext;

  constructor(props: Props) {
    super(props);

    this.handleItemActionClick = this.handleItemActionClick.bind(this);
  }

  render() {

    const renderItem = (item: DataItem) => {
      return (
        <Item key={item.id} item={item} actionText="Use for query" onActionClick={this.handleItemActionClick} />
      );
    };

    return (
      <div className="resultList app-wrap">
        {this.props.items.map(renderItem)}
      </div>
    );
  }
  
  private handleItemActionClick(item: DataItem) {
    this.context.dispatch(actions.addQueryItem(item));
  }
}
