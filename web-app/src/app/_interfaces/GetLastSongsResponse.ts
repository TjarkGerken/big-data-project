export interface GetLastSongsResponse {
  items: Item[];
  next: string;
  cursors: Cursors;
  limit: number;
  href: string;
}

export interface Cursors {
  after: string;
  before: string;
}

export interface Item {
  track: Track;
  playedAt: Date;
  context: Context;
}

export interface Context {
  type: string;
  href: string;
  externalUrls: ExternalUrls;
  uri: string;
}

export interface ExternalUrls {
  spotify: string;
}

export interface Track {
  album: Album;
  artists: Artist[];
  availableMarkets: string[];
  discNumber: number;
  durationMS: number;
  explicit: boolean;
  externalIDS: ExternalIDS;
  externalUrls: ExternalUrls;
  href: string;
  id: string;
  isLocal: boolean;
  name: string;
  popularity: number;
  previewURL: string;
  trackNumber: number;
  type: string;
  uri: string;
}

export interface Album {
  albumType: string;
  artists: Artist[];
  availableMarkets: string[];
  externalUrls: ExternalUrls;
  href: string;
  id: string;
  images: Image[];
  name: string;
  releaseDate: Date;
  releaseDatePrecision: string;
  totalTracks: number;
  type: string;
  uri: string;
}

export interface Artist {
  externalUrls: ExternalUrls;
  href: string;
  id: string;
  name: string;
  type: string;
  uri: string;
}

export interface Image {
  height: number;
  url: string;
  width: number;
}

export interface ExternalIDS {
  isrc: string;
}
