import * as React from 'react';
import { DataItem } from 'types';
import * as queryActions from 'actions/query';
import { processServerResp } from 'api';
import { QueryItem } from 'components/queryBar/queryItem';
import { DispatchContext } from 'components/dispatchContextProvider';
import { SearchIcon } from 'icons';
import { Suggestions } from 'components/queryBar/suggestions';
import { getSuggestForItems, SuggestionItem } from 'api/query';
import { ConnectedAuthControl } from 'components/authControl';
import { SpotifyUser } from 'api/spotify';

require('./queryBar.scss');

export interface Props {
  queryItems: DataItem[];
}

interface State {
  textInput: string,
  suggestItems: SuggestionItem[];
  isFocused: boolean;
  activeTypeFilter?: string,
}

export class QueryBar extends React.Component<Props, State> {
  static contextTypes = {
    dispatch: React.PropTypes.func.isRequired,
  };
  context: DispatchContext;

  private elRef: HTMLDivElement;  

  constructor(props: Props) {
    super(props);
    this.state = {
      suggestItems: [],
      isFocused: false,
      textInput: '',
    };

    this.handleRemoveItem = this.handleRemoveItem.bind(this);
    this.handleTextInputChange = this.handleTextInputChange.bind(this);
    this.handleSuggestSelected = this.handleSuggestSelected.bind(this);
    this.handleDocumentClick = this.handleDocumentClick.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleTypeFilterChange = this.handleTypeFilterChange.bind(this);
  }

  public componentDidMount() {
    document.addEventListener('click', this.handleDocumentClick);
  }

  public componentWillUnmount() {
    document.removeEventListener('click', this.handleDocumentClick);
  }

  componentDidUpdate(prevProps: Props, prevState: State): void {
    if (prevState.textInput !== this.state.textInput ||
      prevState.activeTypeFilter !== this.state.activeTypeFilter) {
        this.loadSuggestions();
      }
  }

  private handleDocumentClick(e: MouseEvent) {
    const target = e.target as HTMLElement;

    if (!this.elRef || !this.state.isFocused) {
      return;
    }

    if(this.elRef === target || this.elRef.contains(target)) {
      return;
    }
    this.setState({
      isFocused: false,
      activeTypeFilter: undefined,
    });
  }


  private handleRemoveItem(item: DataItem) {
    this.context.dispatch(queryActions.removeQueryItem(item));
  }

  private handleSuggestSelected(item: DataItem) {
    this.context.dispatch(queryActions.addQueryItem(item));
    
    this.setState({
      isFocused: false,
      textInput: '',      
    });
  }

  private handleTextInputChange(event: React.FormEvent<HTMLInputElement>) {
    const textInput = event.currentTarget.value;
    this.setState({
      isFocused: true,      
      textInput
    });
  }

  private loadSuggestions() {
    const { textInput, activeTypeFilter} = this.state;

    if (textInput.trim() === '') {
      return;
    }

    getSuggestForItems(textInput, activeTypeFilter).then(response => {
      this.setState({
        suggestItems: response.data
      });
    });
  }

  
  private handleKeyDown(e: KeyboardEvent) {
    if(e.key === 'Backspace' || e.key === 'Delete') {
      if (this.state.textInput === '') {
        // remove last query item on empty input delete
        if (this.props.queryItems.length > 0) {
          const lastItem = this.props.queryItems[this.props.queryItems.length - 1];
          this.context.dispatch(queryActions.removeQueryItem(lastItem));
        }
      }
    }
  }

  private handleTypeFilterChange(typeFilter: string) {
    this.setState({
      activeTypeFilter: typeFilter
    });
  }
  
  render() {
    const { isFocused, suggestItems, textInput, activeTypeFilter} = this.state;

    return (
      <div className="queryBar" ref={ref => this.elRef = ref}>
        <div className="queryBar__control">
          <SearchIcon className="svg-inline svg-fill-current queryBar__icon" />
          <div className="queryBar__q-items">
            {this.props.queryItems.map(item => (
              <QueryItem key={item.id} item={item} actionText="remove from query" mode="remove" onActionClick={this.handleRemoveItem} />        
            ))}
          </div>
          <input type="text" className="queryBar__input" 
            onChange={this.handleTextInputChange} onKeyDown={this.handleKeyDown as any}
            value={textInput} placeholder="Add item to search..." />

          <ConnectedAuthControl />
        </div>
        {isFocused && textInput ? 
          <Suggestions items={suggestItems} onSuggestionSelected={this.handleSuggestSelected} activeTypeFilter={activeTypeFilter} onTypeFilterChange={this.handleTypeFilterChange} />          
          : null
        }
      </div>
    );
  }
}

