import * as React from 'react';
import { ResultItem } from 'components/resultItem';
import { DataItem } from 'types';
import { CSSTransitionGroup } from 'react-transition-group' ;

require('./resultList.scss');

export interface Props {
  items: DataItem[];
}

export class ResultList extends React.Component<Props, null> {

  constructor(props: Props) {
    super(props);

  }

  render() {

    // https://github.com/reactjs/react-transition-group/tree/v1-stable
    return (
      <CSSTransitionGroup component="div" className="resultList"
        transitionName="resultList__anim"
        transitionEnterTimeout={1000}
        transitionLeaveTimeout={500}>
        {this.props.items.map((item) => (
          <ResultItem key={item.id} item={item} />        
        ))}
      </CSSTransitionGroup>
    );
  }
}
