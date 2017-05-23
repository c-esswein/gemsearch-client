import * as React from 'react';
import './SearchFilter.css';

export interface Props {
  onFilterChange: () => void;
}

class SearchFilter extends React.Component<Props, object> {

  constructor(props: Props) {
      super(props);

      this.handleSelectChange = this.handleSelectChange.bind(this);
  }

  handleSelectChange(e:any) {
      this.props.onFilterChange();
  }

  render() {
    return (
      <div className="SearchFilter">
        SearchFilter:
        <select onChange={this.handleSelectChange}>
            <option value="grapefruit">Grapefruit</option>
            <option value="lime">Lime</option>
            <option value="coconut">Coconut</option>
            <option value="mango">Mango</option>
        </select>
      </div>
    );
  }
}

export default SearchFilter;
