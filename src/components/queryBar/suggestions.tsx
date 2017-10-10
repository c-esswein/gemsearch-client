import * as React from 'react';
import { DataItem } from 'types';
import { filterItemTypes } from 'constants/itemTypes';
import { QueryItem } from 'components/queryBar/queryItem';

require('./suggestions.scss');

export interface Props {
  items: DataItem[];
  onSuggestionSelected: (item: DataItem) => void;
}

interface State {
    activeTypeFilter?: string,
}

/**
 * Box with search suggestions.
 */
export class Suggestions extends React.Component<Props, State> {


  constructor(props: Props) {
    super(props);

    this.state = {};

    this.handleFilterClick = this.handleFilterClick.bind(this);
    this.handleItemClick = this.handleItemClick.bind(this);
  }

  private handleFilterClick(filter: string) {
      if (filter === 'all') {
          this.setState({
            activeTypeFilter: undefined
          });
      } else {
        this.setState({
            activeTypeFilter: filter
        });
      }
  }

  private handleItemClick(item: DataItem) {
      this.props.onSuggestionSelected(item);
  }

  private renderFilter(filter: string, isActive: boolean) {
    const activeClass = isActive ? ' queryBar__suggestions-filter--active' : '';
    
    return (
        <div key={filter} className={'queryBar__suggestions-filter' + activeClass} onClick={() => this.handleFilterClick(filter)}>
            {filter}
        </div>
    );
  }

  render() {
    const {items} = this.props;
    const {activeTypeFilter} = this.state;    

    let filteredItems = items;
    if (activeTypeFilter) {
        filteredItems = items.filter(item => (item.type === activeTypeFilter));
    }

    return (
      <div className="queryBar__suggestions">
        <div className="queryBar__suggestions-filters">
            {this.renderFilter('all', !activeTypeFilter)}
            {filterItemTypes.map(filter => this.renderFilter(filter, filter === activeTypeFilter))}
        </div>
        <div className="queryBar__suggestions-items">
            {filteredItems.length === 0 ? 
                <div className="queryBar__suggestions-noitems">
                    no results found
                </div>
            : null}
            {filteredItems.map(item => (
                <QueryItem key={item.id} item={item} mode="item_select" onActionClick={this.handleItemClick} />                
            ))}
        </div>
      </div>
    );
  }
}

