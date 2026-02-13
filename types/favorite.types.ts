export interface FavoriteBook {
   id: number;
   title: string;
   authors: { name: string; birth_year: number | null; death_year: number | null }[];
   languages: string[];
   download_count: number;
   formats: Record<string, string>;
   note?: string; // optional personal note
   addedAt: string;
}