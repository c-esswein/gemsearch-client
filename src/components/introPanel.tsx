import * as React from 'react';
import { CSSTransitionGroup } from 'react-transition-group' ;

require('./introPanel.scss');

export interface Props {
  
}

export class IntroPanel extends React.Component<Props, null> {

  render() {

    return (
      <CSSTransitionGroup component="div" className="introPanel"
        transitionName="introPanel__anim"
        transitionAppear={true}
        transitionAppearTimeout={600}
        transitionEnter={false}
        transitionLeave={false}>
          <h1 className="introPanel__hd">Graph Embedding based <br /> music search</h1>

          <div className="introPanel__item">
            <div className="introPanel__item-text">
              <h2 className="introPanel__item-hd">Search</h2>
              <p>Search for similar music based on seeding elements like tracks, artists or #tags. Don't forget to combine them.</p>
            </div>
          </div>

          <div className="introPanel__item">
            <div className="introPanel__item-text right">
              <h2 className="introPanel__item-hd">Explorer</h2>
              <p>Explorer the search results, find new songs and refine your search.</p>
            </div>
          </div>

          <div className="introPanel__item">
            <div className="introPanel__item-text">
              <h2 className="introPanel__item-hd">Personalize</h2>
              <p>Connect your Spotify account to get personalized results based on your music taste.</p>
            </div>
          </div>
      </CSSTransitionGroup>        
    );
  }
  
}
