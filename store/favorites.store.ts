import { type FavoriteBook } from "../types/favorite.types.js";

class FavoritesStore {
   private favorites: Map<number, FavoriteBook> = new Map();

   getAll(): FavoriteBook[] {
      return Array.from(this.favorites.values());
   }

   getById(id: number): FavoriteBook | undefined {
      return this.favorites.get(id);
   }

   add(book: FavoriteBook): FavoriteBook {
      this.favorites.set(book.id, book);
      return book;
   }

   update(id: number, updates: Partial<FavoriteBook>): FavoriteBook | null {
      const existing = this.favorites.get(id);
      if (!existing) return null;
      const updated = { ...existing, ...updates, id };
      this.favorites.set(id, updated);
      return updated;
   }

   remove(id: number): boolean {
      return this.favorites.delete(id);
   }

   has(id: number): boolean {
      return this.favorites.has(id);
   }

   getTopByDownloads(limit = 10): FavoriteBook[] {
      return this.getAll()
         .sort((a, b) => b.download_count - a.download_count)
         .slice(0, limit);
   }
}

export const favoritesStore = new FavoritesStore();