import * as React from 'react';
import { ResultItem } from 'components/resultItem';
import { CSSTransitionGroup } from 'react-transition-group' ;
import { DataItem } from 'types';
import * as queryActions from 'actions/query';
import { queryForItems } from 'api/query';
import { LoadingIndicator } from 'components/loadingIndicator';
import { CancelablePromise } from 'utils/cancelablePromise';
import { isUserEmbedded } from 'reducers/user';
import { DbUser } from 'api/user';
import * as deepEqual from 'deep-equal';

require('./resultList.scss');

const ITEMS_PER_REQUEST = 30;

interface Props {
  queryItems: DataItem[];
  typeFilter: string[];
  useUserAsContext: boolean;
  user: DbUser;
}

interface State {
  isLoading: boolean,
  resultItems: DataItem[],
}

/**
 * List view for query result.
 */
export class ResultList extends React.Component<Props, State> {

  private page = -1;
  private loadingPromise: CancelablePromise<DataItem[]> = null;

  constructor(props: Props) {
    super(props);

    this.state = {
      isLoading: true,
      resultItems: [],
    };

    this.handleLoadMoreClick= this.handleLoadMoreClick.bind(this);
  }
  
  componentWillMount(): void {
    const { queryItems, typeFilter, user, useUserAsContext } = this.props;
    this.queryForItems(queryItems, typeFilter, user, useUserAsContext);
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.queryItems !== this.props.queryItems ||
      nextProps.typeFilter !== this.props.typeFilter ||
      !deepEqual(nextProps.user, this.props.user) ||
      nextProps.useUserAsContext !== this.props.useUserAsContext) {
      
        this.page = -1;
        this.queryForItems(nextProps.queryItems, nextProps.typeFilter, nextProps.user, nextProps.useUserAsContext);
    }
  }

  componentWillUnmount(): void {
    if (this.loadingPromise) {
      this.loadingPromise.cancel();
      this.loadingPromise = null;
    }
  }


  /**
   * Query api for items.
   */
  private queryForItems(queryItems: DataItem[], typeFilter: string[], user: DbUser, useUserAsContext: boolean) {
    this.page++;
    const offset = ITEMS_PER_REQUEST * this.page;

    this.setState({
      isLoading: true,
    });

    // cancel previous call
    if (this.loadingPromise) {
      this.loadingPromise.cancel();
    }

    let queryUser: DbUser = null;
    if (useUserAsContext && isUserEmbedded(user)) {
      queryUser = user;
    }

    this.loadingPromise = new CancelablePromise(queryForItems(queryItems, typeFilter, ITEMS_PER_REQUEST, offset, queryUser));
    this.loadingPromise.then(data => {
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
    const {queryItems, typeFilter, user, useUserAsContext} = this.props;
    this.queryForItems(queryItems, typeFilter, user, useUserAsContext);
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
