export interface StreamingHistory {
  tracks: Track[];
}
export interface StreamingHistoryWithUID extends StreamingHistory {
  uid: string;
}

export interface Track {
  endTime: string;
  artistName: string;
  trackName: string;
  UID?: string;
  msPlayed: number;
}
