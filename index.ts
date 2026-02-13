import express from 'express';
import dotenv from 'dotenv';
import session from "express-session";

const app = express();

dotenv.config({ path: '.env' });

app.use(express.json());
app.use(
   session({
      secret: process.env.SESSION_SECRET!,
      resave: false,
      saveUninitialized: true,
      cookie: { maxAge: 24 * 60 * 60 * 1000 },
   })
);

import booksRoute from "./routes/books.js"

app.use('/api/v1/books', booksRoute);

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, "0.0.0.0", () => {
   console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});