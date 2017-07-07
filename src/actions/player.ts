

import { ViewModus, Track } from '../types';

export type Actions = PlayTrackAction | SetPlayingAction;

export interface PlayTrackAction {
    type: 'PLAY_TRACK';
    track: Track;
}
export function playTrack(track: Track): PlayTrackAction {
    return {
        type: 'PLAY_TRACK',
        track
    };
}

export interface SetPlayingAction {
    type: 'SET_PLAYING';
    isPlaying: boolean;
}
export function setPlaying(isPlaying: boolean): SetPlayingAction {
    return {
        type: 'SET_PLAYING',
        isPlaying
    };
}
