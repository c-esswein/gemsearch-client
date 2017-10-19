import * as React from 'react';

require('./loadingIndicator.scss');

interface Props {
    inverted?: boolean,
}

export const LoadingIndicator: React.StatelessComponent<Props> = ({inverted}) => (
    <div className={`loader ${inverted ? 'loader--inverted' : ''}`}>
        <div className="loader__dot"></div>
        <div className="loader__dot"></div>
        <div className="loader__dot"></div>
    </div>
);
