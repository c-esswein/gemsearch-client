import * as React from 'react';
import { ResultItem } from 'components/resultItem';
import { CSSTransitionGroup } from 'react-transition-group' ;
import { DataItem } from 'types';
import * as queryActions from 'actions/query';
import { queryForItems } from 'api/query';
import { LoadingIndicator } from 'components/loadingIndicator';

require('./resultList.scss');

const ITEMS_PER_REQUEST = 30;

interface Props {
  queryItems: DataItem[];
  typeFilter: string[];
}

interface State {
  isLoading: boolean,
  resultItems: DataItem[],
}

export class ResultList extends React.Component<Props, State> {

  private page = -1;

  constructor(props: Props) {
    super(props);

    this.state = {
      isLoading: true,
      resultItems: [],
    };

    this.handleLoadMoreClick= this.handleLoadMoreClick.bind(this);
  }
  
  componentWillMount(): void {
    this.queryForItems(this.props.queryItems, this.props.typeFilter);    
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.queryItems !== this.props.queryItems ||
      nextProps.typeFilter !== this.props.typeFilter) {
      
        this.page = -1;
        this.queryForItems(nextProps.queryItems, nextProps.typeFilter);
    }
  }


  /**
   * Query api for items.
   */
  private queryForItems(queryItems: DataItem[], typeFilter: string[]) {
    this.page++;
    const offset = ITEMS_PER_REQUEST * this.page;

    this.setState({
      isLoading: true,
    });

    queryForItems(queryItems, typeFilter, ITEMS_PER_REQUEST, offset)
      .then(data => {
        if (offset > 0) {
          // append items
          this.setState({
            isLoading: false,
            resultItems: [
              ...this.state.resultItems,
              ...data
            ],
          });

        } else {
          this.setState({
            isLoading: false,
            resultItems: data,
          });
        }
      });
  }


  private handleLoadMoreClick() {
    const {queryItems, typeFilter} = this.props;
    this.queryForItems(queryItems, typeFilter);
  }


  render() {
    const {resultItems = [], isLoading} = this.state;

    // https://github.com/reactjs/react-transition-group/tree/v1-stable
    return (
      <div>
        {/* <CSSTransitionGroup component="div" className="resultList"
          transitionName="resultList__anim"
          transitionEnterTimeout={1000}
          transitionLeaveTimeout={500}>
          {resultItems.map(cluster => cluster.map((item) => (
            <ResultItem key={item.id} item={item} />        
          )))}
        </CSSTransitionGroup> */}

        <div className="resultList">
          {resultItems.map(item => (
            <ResultItem key={item.id} item={item} />        
          ))}
        </div>
        <div className="resultList__btn-wrap">
          {isLoading? 
            <LoadingIndicator />
            : <div className="btn-raised resultList__more-btn" onClick={this.handleLoadMoreClick}>Load more results</div>
          }
        </div>
      </div>
    );
  }
}
