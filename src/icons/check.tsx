import * as React from 'react';

export const CheckIcon: React.StatelessComponent<{className?: string}> = ({className = 'svg-inline svg-button-icon'}) => (
    <svg className={'icon-check ' + className} version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448.8 448.8">
        <g>
            <polygon points="142.8,323.85 35.7,216.75 0,252.45 142.8,395.25 448.8,89.25 413.1,53.55 		"/>
        </g>
    </svg>
);
