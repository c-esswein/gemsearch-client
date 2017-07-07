import * as views from 'actions/views';
import * as query from 'actions/query';
import * as player from 'actions/player';

export type Actions = views.Actions | query.Actions | player.Actions;
