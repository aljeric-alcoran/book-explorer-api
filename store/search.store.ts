const MAX_SEARCHES = 5;

class SearchStore {
   // sessionId → last 5 queries
   private searches: Map<string, string[]> = new Map();

   add(sessionId: string, query: string): void {
      const current = this.searches.get(sessionId) ?? [];

      // Remove duplicate if exists, then prepend
      const deduped = current.filter((q) => q.toLowerCase() !== query.toLowerCase());
      const updated = [query, ...deduped].slice(0, MAX_SEARCHES);

      this.searches.set(sessionId, updated);
   }

   get(sessionId: string): string[] {
      return this.searches.get(sessionId) ?? [];
   }

   clear(sessionId: string): void {
      this.searches.delete(sessionId);
   }
}

export const searchStore = new SearchStore();