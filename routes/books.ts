import { Router } from "express";
import { favoritesStore } from "../store/favorites.store.js";
import { searchStore } from "../store/search.store.js";

const router = Router();

// GET /books — paginated list + track recent searches
router.get("/", async (req, res) => {
   try {
      const { page = 1, search = "", languages = "" } = req.query;
   
      const sessionId = req.sessionID;
      if (search && typeof search === "string" && search.trim()) {
         searchStore.add(sessionId, search.trim());
      }
 
      const url = new URL("https://gutendex.com/books");
      url.searchParams.set("page", String(page));
      if (search) url.searchParams.set("search", String(search));
   
      // ✅ forward languages to Gutendex
      if (languages) url.searchParams.set("languages", String(languages));
   
      const response = await fetch(url.toString());
   
      if (!response.ok) {
         return res.status(response.status).json({
            error: "Failed to fetch books",
            status: response.status,
            statusText: response.statusText,
         });
      }
 
      const data = await response.json();
   
      return res.status(200).json({
         page: Number(page),
         count: data.count,
         totalPages: Math.ceil(data.count / 32),
         next: data.next,
         previous: data.previous,
         results: data.results,
      });
   } catch (error) {
      return res.status(500).json({
         error: "Internal server error",
         message: error instanceof Error ? error.message : "Unknown error",
      });
   }
 });

// GET /books/popular — top 10 from favorites by download_count
router.get("/popular", async (req, res) => {
   try {
      const cached = favoritesStore.getTopByDownloads(10);

      // If we have enough favorites, return from memory
      if (cached.length >= 10) {
         return res.status(200).json({
            source: "memory",
            count: cached.length,
            results: cached,
         });
      }

      // Otherwise fetch from Gutendex directly (sorted by popular)
      const response = await fetch("https://gutendex.com/books?sort=popular");

      if (!response.ok) {
         return res.status(response.status).json({ error: "Failed to fetch popular books" });
      }

      const data = await response.json();
      const top10 = data.results
         .sort((a: any, b: any) => b.download_count - a.download_count)
         .slice(0, 10);

      return res.status(200).json({
         source: "gutendex",
         count: top10.length,
         results: top10,
      });
   } catch (error) {
      return res.status(500).json({
         error: "Internal server error",
         message: error instanceof Error ? error.message : "Unknown error",
      });
   }
});

// GET /books/searches/recent — get last 5 searches for current session
router.get("/searches/recent", (req, res) => {
   const sessionId = req.sessionID;
   const recent = searchStore.get(sessionId);

   return res.status(200).json({
      sessionId,
      count: recent.length,
      queries: recent,
   });
});

// DELETE /books/searches/recent — clear recent searches for current session
router.delete("/searches/recent", (req, res) => {
   const sessionId = req.sessionID;
   searchStore.clear(sessionId);

   return res.status(200).json({ message: "Recent searches cleared" });
});

// GET /books/:id — single book details
router.get("/:bookId", async (req, res) => {
   try {
      const { bookId } = req.params;

      if (!bookId || isNaN(Number(bookId))) {
         return res.status(400).json({ error: "Invalid book ID" });
      }

      const response = await fetch(`https://gutendex.com/books/${bookId}`);

      if (response.status === 404) {
         return res.status(404).json({ 
            error: "Book not found", 
            message: `No book found with ID ${bookId}` 
         });
      }

      if (!response.ok) {
         return res.status(response.status).json({ error: "Failed to fetch book details" });
      }

      const data = await response.json();
      return res.status(200).json(data);
   } catch (error) {
      return res.status(500).json({
         error: "Internal server error",
         message: error instanceof Error ? error.message : "Unknown error",
      });
   }
});

export default router;