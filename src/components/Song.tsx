import * as React from 'react';
import './Song.css';

export interface Props {
  item: object;
}

class Song extends React.Component<Props, null> {
  render() {
    const item = this.props.item;

    return (
      <div className="Item Song">
        <div className="Item-type">{item['type']}</div>
        <div className="Song-inner">
          <a className="Item-name" href={item['uri']}>{item['name']}</a>
        </div>
      </div>
    );
  }
}

export default Song;
