import * as React from 'react';

require('./introPanel.scss');

export interface Props {
  
}

export class IntroPanel extends React.Component<Props, null> {


  render() {

    return (
      <div className="introPanel app-wrap">
          Graph Embedding based music search

          <br /> 
          <br />
          Use Query Bar to search for music. 
      </div>
    );
  }
  
}
