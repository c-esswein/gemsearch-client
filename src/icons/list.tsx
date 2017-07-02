import * as React from 'react';

export const ListIcon: React.StatelessComponent<{className?: string}> = ({className = 'svg-inline svg-button-icon svg-fill-current'}) => (
    <svg className={className} version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 459 459">
        <g>
            <g>
                <path d="M0,255h51v-51H0V255z M0,357h51v-51H0V357z M0,153h51v-51H0V153z M102,255h357v-51H102V255z M102,357h357v-51H102V357z M102,102v51h357v-51H102z"/>
            </g>
        </g>
    </svg>
);
