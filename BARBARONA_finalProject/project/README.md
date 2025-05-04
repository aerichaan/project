# Book Management System

A complete, modern book management system built with vanilla HTML, CSS, and JavaScript. This application connects to a Supabase database and provides both a public catalog interface and a secure admin dashboard.

## Features

### Public Side
- View all books in the catalog
- Search books by title, author, or genre
- View complete book details including external links

### Admin Side
- Secure login for administrators
- Full CRUD operations on book records
- Real-time data management

## Setup Instructions

### 1. Set Up Supabase

The application requires a Supabase project with the following configuration:

1. Create a table named `books` with the following fields:
   - `id` (uuid, primary key)
   - `book` (text, not null) - The book title
   - `author` (text, not null)
   - `description` (text)
   - `genres` (text) - Comma-separated list of genres
   - `avg_rating` (float)
   - `num_rating` (integer)
   - `url` (text) - External URL to the book

2. Run the SQL migration found in `supabase_migration.sql` to:
   - Create the books table
   - Set up Row Level Security (RLS)
   - Add policies for public and authenticated access
   - Insert sample data

### 2. Create Admin User

To access the admin dashboard, you need to create a user in Supabase:

1. In your Supabase dashboard, go to Authentication > Users
2. Click "Add User" and create an admin user with email and password

### 3. Running the Application

Simply serve the files using any HTTP server. You can use:

- VS Code Live Server extension
- Python simple HTTP server: `python -m http.server`
- Node.js http-server: `npx http-server`

## Project Structure

- `index.html` - Landing page
- `catalog.html` - Public book catalog
- `admin-login.html` - Admin login page
- `admin-dashboard.html` - Admin dashboard

### CSS Files
- `css/main.css` - Core styles for entire site
- `css/home.css` - Homepage specific styles
- `css/catalog.css` - Catalog specific styles
- `css/admin.css` - Admin specific styles

### JavaScript Files
- `js/supabase.js` - Supabase connection and utility functions
- `js/main.js` - Common JavaScript functionality
- `js/catalog.js` - Public catalog page functionality
- `js/auth.js` - Authentication functionality
- `js/admin.js` - Admin dashboard functionality

## Security Features

- Row Level Security (RLS) to protect data
- Public users can only read data
- Only authenticated admins can modify data
- Secure authentication with Supabase Auth