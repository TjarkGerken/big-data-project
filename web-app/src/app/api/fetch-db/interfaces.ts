export interface TrackData {
    UID: string;
    trackName: string;
    artistName: string;
    total_msPlayed: bigint;
}

export interface ArtistData {
    UID: string;
    artistName: string;
    total_msPlayed: bigint;
}

export interface TotalPlayTime {
    UID: string;
    total_msPlayed: bigint;
}

export interface ResponseData {
    spotify_uid: string;
    top_songs: TrackData[];
    top_artist: ArtistData[];
    total_ms_played?: TotalPlayTime[];
}