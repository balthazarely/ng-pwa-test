export interface TrailDto {
  data: Trail[];
  results: number;
}

export interface Trail {
  city: string;
  country: string;
  description: string;
  difficulty: string;
  directions: string;
  features: string;
  id: number;
  lat: string | number;
  length: string;
  lon: string | number;
  name: string;
  rating: number;
  region: string;
  thumbnail: string;
  url: string;
}
