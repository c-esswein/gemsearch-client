import * as React from 'react';
import { filterItemTypes } from 'constants/itemTypes';
import { QueryItem } from 'components/queryBar/queryItem';
import { SuggestionItem } from 'api/query';

require('./suggestions.scss');

export interface Props {
  items: SuggestionItem[];
  onSuggestionSelected: (item: SuggestionItem) => void;
  onTypeFilterChange: (filter: string) => void;
  activeTypeFilter: string,
}

/**
 * Box with search suggestions.
 */
export class Suggestions extends React.Component<Props, {}> {


  constructor(props: Props) {
    super(props);

    this.handleFilterClick = this.handleFilterClick.bind(this);
    this.handleItemClick = this.handleItemClick.bind(this);
  }

  private handleFilterClick(filter: string) {
    if (filter === 'all') {
        this.props.onTypeFilterChange(undefined);
    } else {
        this.props.onTypeFilterChange(filter);
    }
  }

  private handleItemClick(item: SuggestionItem) {
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
    const { items, activeTypeFilter} = this.props;

    return (
      <div className="queryBar__suggestions">
        <div className="queryBar__suggestions-filters">
            {this.renderFilter('all', !activeTypeFilter)}
            {filterItemTypes.map(filter => this.renderFilter(filter, filter === activeTypeFilter))}
        </div>
        <div className="queryBar__suggestions-items">
            {items.length === 0 ? 
                <div className="queryBar__suggestions-noitems">
                    no results found
                </div>
            : null}
            {items.map(item => (
                <QueryItem key={item.id} item={item} mode="item_select" onActionClick={this.handleItemClick} />                
            ))}
        </div>
      </div>
    );
  }
}

