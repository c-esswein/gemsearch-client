import * as React from 'react';
import { ResultItem } from 'components/resultItem';
import { CSSTransitionGroup } from 'react-transition-group';
import { DataItem } from 'types';
import * as queryActions from 'actions/query';
import { queryForRecommendations } from 'api/query';
import { LoadingIndicator } from 'components/loadingIndicator';
import { CancelablePromise } from 'utils/cancelablePromise';
import { isUserEmbedded } from 'reducers/user';
import { DbUser } from 'api/user';
import * as deepEqual from 'deep-equal';

require('./resultList.scss');

const ITEMS_PER_REQUEST = 30;

interface Props {
    user: DbUser;
    typeFilter: string[];
}

interface State {
    isLoading: boolean,
    resultItems: DataItem[],
}

/**
 * List view for query result.
 */
export class RecommendationList extends React.Component<Props, State> {

    private page = -1;
    private loadingPromise: CancelablePromise<DataItem[]> = null;

    constructor(props: Props) {
        super(props);

        this.state = {
            isLoading: true,
            resultItems: [],
        };

        this.handleLoadMoreClick = this.handleLoadMoreClick.bind(this);
    }

    componentWillMount(): void {
        const { user, typeFilter} = this.props;
        this.queryForItems(user, typeFilter);
    }

    componentWillReceiveProps(nextProps: Props) {
        if (!deepEqual(nextProps.user, this.props.user) ||
            nextProps.typeFilter !== this.props.typeFilter) {

            this.page = -1;
            this.queryForItems(nextProps.user, nextProps.typeFilter);
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
    private queryForItems(user: DbUser, typeFilter: string[]) {
        if (!user) {
            alert('No user set!');
            return;
        }
        if (!isUserEmbedded(user)) {
            alert('User is not embedded yet!');
            return;
        }
        
        this.page++;
        const offset = ITEMS_PER_REQUEST * this.page;

        this.setState({
            isLoading: true,
        });

        // cancel previous call
        if (this.loadingPromise) {
            this.loadingPromise.cancel();
        }

        this.loadingPromise = new CancelablePromise(queryForRecommendations(user, typeFilter, ITEMS_PER_REQUEST, offset));
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
        const { user, typeFilter } = this.props;
        this.queryForItems(user, typeFilter);
    }


    render() {
        const { resultItems = [], isLoading } = this.state;

        return (
            <div>

                <div className="resultList">
                    {resultItems.map(item => (
                        <ResultItem key={item.id} item={item} />
                    ))}
                </div>
                <div className="resultList__btn-wrap">
                    {isLoading ?
                        <LoadingIndicator />
                        : <div className="btn-raised resultList__more-btn" onClick={this.handleLoadMoreClick}>Load more results</div>
                    }
                </div>
            </div>
        );
    }
}
