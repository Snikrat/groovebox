export interface PersonSummary {
  username: string;
  name: string;
}

export interface SuggestedPerson extends PersonSummary {
  followerCount: number;
}
