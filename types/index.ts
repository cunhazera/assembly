export interface Member {
  id: string;
  name: string;
  email: string;
  has_voted: boolean;
}

export interface Election {
  id: string;
  title: string;
  description: string;
  active: boolean;
  created_at: string;
}

export interface Position {
  id: string;
  election_id: string;
  name: string;
  max_votes: number;
}

export interface Candidate {
  id: string;
  position_id: string;
  name: string;
  bio: string | null;
  photo_url: string | null;
}

export interface PositionWithCandidates extends Position {
  candidates: Candidate[];
}
