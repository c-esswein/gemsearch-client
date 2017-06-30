import * as React from 'react';
import { DispatchContext } from 'components/dispatchContextProvider';
import { processServerResp } from 'api';
import { DataItem } from 'types';
import * as actions from 'actions';
import * as Autosuggest from 'react-autosuggest';

require('./searchInput.css');

export interface Props {
}

export interface State {
  value: string;
  suggestions: DataItem[];
}

export class SearchInput extends React.Component<Props, State> {
  static contextTypes = {
    dispatch: React.PropTypes.func.isRequired,
  };
  context: DispatchContext;

  constructor() {
    super();

    this.state = {
      value: '',
      suggestions: []
    };

    this.onChange = this.onChange.bind(this);
    this.onSuggestionsFetchRequested = this.onSuggestionsFetchRequested.bind(this);
    this.onSuggestionsClearRequested = this.onSuggestionsClearRequested.bind(this);
    this.onSuggestionSelected = this.onSuggestionSelected.bind(this);
  }

  onChange(e, { newValue }) {
    this.setState({
      value: newValue
    });
  }

  // Autosuggest will call this function every time you need to update suggestions.
  // You already implemented this logic above, so just use it.
  onSuggestionsFetchRequested({ value }) {
    return fetch('/api/suggest/' + value.trim())
      .then(response => response.json())
      .then(processServerResp)
      .then(result => {
        this.setState({
          suggestions: result
        });
      });
  }

  // Autosuggest will call this function every time you need to clear suggestions.
  onSuggestionsClearRequested() {
    this.setState({
      suggestions: []
    });
  }

  onSuggestionSelected(e: React.UIEvent<Element>, { suggestion }) {
    this.context.dispatch(actions.addQueryItem(suggestion));
    
    this.setState({
      value: ''
    });
  }

  render() {
    const { value, suggestions } = this.state;

    // Autosuggest will pass through all these props to the input element.
    const inputProps = {
      placeholder: 'Search...',
      value,
      onChange: this.onChange
    };

    const renderSuggestion = (suggestion) => (
      <div className="searchInput__suggest">
        <span className="searchInput__suggest-type">{suggestion.type}:</span>
        <span className="searchInput__suggest-name">{suggestion.name}</span>
      </div>
    );

    const getSuggestionValue = (suggestion) => suggestion.name;

    return (
      <Autosuggest
        suggestions={suggestions}
        onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
        onSuggestionsClearRequested={this.onSuggestionsClearRequested}
        getSuggestionValue={getSuggestionValue}
        onSuggestionSelected={this.onSuggestionSelected}
        renderSuggestion={renderSuggestion}
        inputProps={inputProps}
      />
    );
  }
}
