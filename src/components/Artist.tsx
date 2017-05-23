import * as React from 'react';
import './Artist.css';

export interface Props {
  item: object;
}

class Artist extends React.Component<Props, null> {
  render() {
    const item = this.props.item;

    return (
      <div className="Item Song">
        <div className="Item-type">{item['type']}</div>
        <div className="Song-inner">
          <a className="Item-name" href={item['uri']} title="View on Spotify">{item['name']}</a>
        </div>
      </div>
    );
  }
}

export default Artist;
