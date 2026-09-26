export interface RatingCount {
  rating: number;
  count: number;
}

export interface ArtistCount {
  artistName: string;
  count: number;
}

export interface DecadeCount {
  decade: number;
  count: number;
}

export interface Stats {
  totalReviews: number;
  totalListens: number;
  averageRating: number | null;
  ratingDistribution: RatingCount[];
  topArtists: ArtistCount[];
  albumsByDecade: DecadeCount[];
  memberSince: string;
}
