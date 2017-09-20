import * as React from 'react';
import { DispatchContext } from 'components/dispatchContextProvider';

require('./connectDialog.scss');

export interface Props {
  isOpen: boolean;
}

interface State {
    isVisible: boolean;
}

export class ConnectDialog extends React.Component<Props, State> {

  static contextTypes = {
    dispatch: React.PropTypes.func.isRequired,
  };
  context: DispatchContext;


  constructor(props: Props) {
      super(props);

  }

  private handleRequestClose() {
      /* this.context.dispatch(
          viewActions.closeItemDetail()
      ); */
      alert('not implemented');
  }

  render() {
    const { isOpen } = this.props;

    if (!isOpen) {
        return null;
    }

    return (
        <div className="connectDialog__container">
            <div className="connectDialog__overlay" onClick={this.handleRequestClose}></div>
            
            <div className="connectDialog">
                <h2>Connect Spotify</h2>
                Authenticate your spotify account with selective permissions:

                <ul>
                    <li>
                        <h3>Music library</h3>
                        <p></p>
                    </li>
                    <li>
                        <h3>Player control</h3>
                        <p></p>
                    </li>
                </ul>
            </div>
        </div>
    );
  }
}
