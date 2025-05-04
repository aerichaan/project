/*
  # Book Management System Schema

  1. Tables
    - `books` - Main table to store book information
      - `id` (uuid, primary key) - Unique identifier for each book
      - `book` (text) - Title of the book
      - `author` (text) - Author of the book
      - `description` (text) - Book description
      - `genres` (text) - Comma-separated list of genres
      - `avg_rating` (float) - Average rating (0-5 scale)
      - `num_rating` (integer) - Number of ratings
      - `url` (text) - URL to the book's external page
      - `created_at` (timestamp) - When the record was created
  
  2. Security
    - Enable RLS on `books` table
    - Allow anyone to read books data
    - Only allow authenticated users (admins) to insert, update, or delete records
*/

-- WARNING: This schema is based on your image and is MISSING the crucial 'id' primary key.
-- It also uses unconventional naming (capitalized, truncated).
-- This is NOT recommended and will likely break application functionality.
CREATE TABLE public."Books" ( -- Using quoted identifier for capitalized table name
    "Book"        text NOT NULL,         -- Was 'book' (text, not null)
    "Author"      text NOT NULL,         -- Was 'author' (text, not null)
    "Descriptio"  text,                  -- Was 'description' (text), truncated name
    "Genres"      text,                  -- Was 'genres' (text)
    "Avg_Rating"  double precision,      -- Was 'avg_rating' (float), using standard SQL type
    "Num_Rati"    integer,               -- Was 'num_rating' (integer), truncated name
    "URL"         text                   -- Was 'url' (text)
    -- The essential 'id uuid PRIMARY KEY DEFAULT gen_random_uuid()' is MISSING!
);

-- Commenting out RLS and policies as they might not apply correctly without 'id'
-- or with the different table name/structure. You would need to adapt these carefully.

-- ALTER TABLE public."Books" ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Allow public read access" ON public."Books"
-- FOR SELECT USING (true);

-- CREATE POLICY "Allow admin full access" ON public."Books"
-- FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');


-- You would also need to adapt any INSERT statements to match these column names:
-- Example (Original vs Adapted):
-- Original: INSERT INTO public.books (book, author, description, genres, avg_rating, num_rating, url) VALUES (...);
-- Adapted:  INSERT INTO public."Books" ("Book", "Author", "Descriptio", "Genres", "Avg_Rating", "Num_Rati", "URL") VALUES (...);

-- Insert sample data
INSERT INTO public."Books" ("Book", "Author", "Descriptio", "Genres", "Avg_Rating", "Num_Rati", "URL")
VALUES 
  ('The Great Gatsby', 'F. Scott Fitzgerald', 'A story of wealth, love, and tragedy set in the Roaring Twenties.', 'Fiction, Classic, Literary Fiction', 4.3, 1289, 'https://www.goodreads.com/book/show/4671.The_Great_Gatsby'),
  
  ('To Kill a Mockingbird', 'Harper Lee', 'A powerful story of racial injustice and loss of innocence in the American South.', 'Fiction, Classic, Historical', 4.6, 1853, 'https://www.goodreads.com/book/show/2657.To_Kill_a_Mockingbird'),
  
  ('The Hobbit', 'J.R.R. Tolkien', 'The adventure of Bilbo Baggins, a hobbit who enjoys a peaceful life until a wizard and dwarves arrive on his doorstep.', 'Fantasy, Adventure, Fiction', 4.5, 2145, 'https://www.goodreads.com/book/show/5907.The_Hobbit'),
  
  ('Pride and Prejudice', 'Jane Austen', 'The story follows Elizabeth Bennet as she deals with issues of manners, upbringing, morality, education, and marriage.', 'Classic, Romance, Fiction', 4.4, 1973, 'https://www.goodreads.com/book/show/1885.Pride_and_Prejudice'),
  
  ('The Alchemist', 'Paulo Coelho', 'A mystical story about following one''s dreams and listening to one''s heart.', 'Fiction, Fantasy, Philosophy', 4.2, 1562, 'https://www.goodreads.com/book/show/865.The_Alchemist');