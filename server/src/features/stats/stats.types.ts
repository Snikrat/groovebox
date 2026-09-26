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
  /** Sempre os 10 valores possíveis (0.5 a 5), mesmo com contagem 0 — pronto para um gráfico de barras. */
  ratingDistribution: RatingCount[];
  topArtists: ArtistCount[];
  albumsByDecade: DecadeCount[];
  /** Data de criação da conta. */
  memberSince: string;
}
