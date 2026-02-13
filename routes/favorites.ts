import { Router } from "express";
import { favoritesStore } from "../store/favorites.store.js";

const router = Router();

// GET /books/favorites — list all favorites
router.get("/", (req, res) => {
   const favorites = favoritesStore.getAll();

   return res.status(200).json({
      count: favorites.length,
      results: favorites,
   });
});

// GET /books/favorites/:id — get a single favorite
router.get("/:id", (req, res) => {
   const id = Number(req.params.id);

   if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID", message: "ID must be a number" });
   }

   const book = favoritesStore.getById(id);

   if (!book) {
      return res.status(404).json({ error: "Not found", message: `Book ${id} is not in favorites` });
   }

   return res.status(200).json(book);
});

// POST /books/favorites — add a book to favorites
router.post("/", async (req, res) => {
   const { id, note } = req.body;

   if (!id || isNaN(Number(id))) {
      return res.status(400).json({ 
         error: "Invalid request", 
         message: "A valid book ID is required" 
      });
   }

   if (favoritesStore.has(Number(id))) {
      return res.status(409).json({ 
         error: "Conflict", 
         message: `Book ${id} is already in favorites` 
      });
   }

   const response = await fetch(`https://gutendex.com/books/${id}`);

   if (response.status === 404) {
      return res.status(404).json({ 
         error: "Not found", 
         message: `No Gutendex book found with ID ${id}` 
      });
   }

   if (!response.ok) {
      return res.status(502).json({ 
         error: "Upstream error", 
         message: "Failed to fetch book from Gutendex" 
      });
   }

   const gutendexBook = await response.json();

   const favorite = favoritesStore.add({
      id: gutendexBook.id,
      title: gutendexBook.title,
      authors: gutendexBook.authors,
      languages: gutendexBook.languages,
      download_count: gutendexBook.download_count,
      formats: gutendexBook.formats,
      note: note ?? null,
      addedAt: new Date().toISOString(),
   });

   return res.status(201).json(favorite);
});

// PATCH /books/favorites/:id — update a favorite (e.g. edit note)
router.patch("/:id", (req, res) => {
   const id = Number(req.params.id);

   if (isNaN(id)) {
      return res.status(400).json({ 
         error: "Invalid ID", 
         message: "ID must be a number" 
      });
   }

   if (!favoritesStore.has(id)) {
      return res.status(404).json({ 
         error: "Not found", 
         message: `Book ${id} is not in favorites` 
      });
   }

   const updated = favoritesStore.update(id, req.body);
   return res.status(200).json(updated);
});

// DELETE /books/favorites/:id — remove from favorites
router.delete("/:id", (req, res) => {
   const id = Number(req.params.id);

   if (isNaN(id)) {
      return res.status(400).json({ 
         error: "Invalid ID", 
         message: "ID must be a number" 
      });
   }

   const deleted = favoritesStore.remove(id);

   if (!deleted) {
      return res.status(404).json({ 
         error: "Not found", 
         message: `Book ${id} is not in favorites` 
      });
   }

   return res.status(200).json({ 
      message: `Book ${id} removed from favorites` 
   });
});

export default router;