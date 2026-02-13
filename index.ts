import express from 'express';
import dotenv from 'dotenv';
import session from "express-session";
import cors from "cors";

import booksRoute from "./routes/books.js"
import favoritesRoute from "./routes/favorites.js"

const app = express();

dotenv.config({ path: '.env' });

const allowedOrigins = [
   "http://localhost:5173",
   "https://book-explorer-api-gamma.vercel.app/"
];
 
app.use(cors({
   origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
         callback(null, true);
      } else {
         callback(new Error(`CORS blocked: ${origin}`));
      }
   },
   credentials: true,
}));

app.use(express.json());
app.use(
   session({
      secret: process.env.SESSION_SECRET!,
      resave: false,
      saveUninitialized: true,
      cookie: { maxAge: 24 * 60 * 60 * 1000 },
   })
);

app.use('/api/v1/books', booksRoute);
app.use('/api/v1/favorites', favoritesRoute);

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, "0.0.0.0", () => {
   console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});