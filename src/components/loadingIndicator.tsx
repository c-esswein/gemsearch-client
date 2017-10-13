import * as React from 'react';

require('./loadingIndicator.scss');

export const LoadingIndicator: React.StatelessComponent<{}> = ({}) => (
    <div className="loader">
        <div className="loader__dot"></div>
        <div className="loader__dot"></div>
        <div className="loader__dot"></div>
    </div>
);
