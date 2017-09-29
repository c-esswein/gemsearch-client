import * as React from 'react';

export const PlayIcon: React.StatelessComponent<{className?: string, onClick?: () => void}> = ({className = 'svg-inline svg-button-icon svg-fill-current', onClick}) => (
    <svg className={className} version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 357 357" onClick={() => onClick && onClick()}>
        <g>
            <g>
                <polygon points="38.25,0 38.25,357 318.75,178.5"/>
            </g>
        </g>
    </svg>
);
