// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const filterResetBtn = document.getElementById('filterReset');
const booksContainer = document.getElementById('booksContainer');
const loadingElement = document.getElementById('loading');
const errorElement = document.getElementById('errorMessage');
const noResultsElement = document.getElementById('noResults');
// Pagination DOM Elements
const paginationControlsElement = document.getElementById('paginationControls');
const pageInfoElement = document.getElementById('pageInfo');
const prevPageBtn = document.getElementById('prevPageBtn');
const nextPageBtn = document.getElementById('nextPageBtn');

// Pagination & Search State
let currentPage = 1;
const pageSize = 100; // Display 100 books per page
let totalBooks = 0;
let currentSearchTerm = '';
let books = []; // Holds only the books for the current page

// Initialize the catalog page
async function initCatalog() {
    console.log("initCatalog: Running...");
    setupEventListeners();
    // Load initial data (page 1, no search)
    await loadBooksCatalog(1, '');
}

// Load a specific page of books from Supabase, applying search filter
async function loadBooksCatalog(page = 1, searchTerm = '') {
    console.log(`loadBooksCatalog: Loading page ${page}, search: '${searchTerm}'`);
    currentPage = page;
    currentSearchTerm = searchTerm.trim();

    try {
        loadingElement.classList.remove('hidden');
        booksContainer.classList.add('hidden'); // Hide container while loading
        noResultsElement.classList.add('hidden');
        if (paginationControlsElement) paginationControlsElement.classList.add('hidden'); // Hide pagination while loading

        // Calculate range
        const offset = (currentPage - 1) * pageSize;
        const limit = pageSize - 1;
        const rangeEnd = offset + limit;
        console.log(`loadBooksCatalog: Requesting range ${offset}-${rangeEnd}`);

        // Build query
        let query = supabase
            .from('Books')
            .select('* ', { count: 'exact' });

        // Apply search filter (case-insensitive)
        if (currentSearchTerm) {
            query = query.or(
                `Book.ilike.%${currentSearchTerm}%,Author.ilike.%${currentSearchTerm}%,Genres.ilike.%${currentSearchTerm}%`
            );
        }

        // Apply ordering and pagination
        query = query
            .order('"Book"', { ascending: true })
            .range(offset, rangeEnd);

        // Execute query
        const { data, error, count } = await query;

        console.log(`loadBooksCatalog: Received ${data ? data.length : 0} books. Total matching: ${count}`);

        if (error) throw error;

        // Update state
        books = data || [];
        totalBooks = count || 0;

        // Display results
        displayBooksCatalog(); // Use the new display function
        renderPaginationControlsCatalog(); // Update pagination UI

    } catch (error) {
        console.error("Error in loadBooksCatalog:", error);
        showError(errorElement, error); // Make sure showError exists and works
        books = []; // Clear books on error
        totalBooks = 0;
        displayBooksCatalog(); // Show no results state
        renderPaginationControlsCatalog(); // Update pagination controls
    } finally {
        loadingElement.classList.add('hidden');
    }
}

// Display books for the current page
function displayBooksCatalog() {
    booksContainer.innerHTML = ''; // Clear previous books

    if (books.length === 0) {
        console.log("displayBooksCatalog: No books to display for current page/filter.");
        booksContainer.classList.add('hidden');
        noResultsElement.classList.remove('hidden');
        return;
    }

    console.log(`displayBooksCatalog: Displaying ${books.length} books.`);
    booksContainer.classList.remove('hidden');
    noResultsElement.classList.add('hidden');

    // Create and append book cards
    books.forEach(book => {
        try {
            const bookCard = createBookCard(book); // Reuse existing card creation logic
            if (bookCard) {
                booksContainer.appendChild(bookCard);
            } else {
                console.error("createBookCard returned null/undefined for:", book);
            }
        } catch(cardError) {
            console.error("Error creating book card for:", book, cardError);
        }
    });
}

// Render pagination buttons and info for Catalog
function renderPaginationControlsCatalog() {
    if (!paginationControlsElement || !pageInfoElement || !prevPageBtn || !nextPageBtn) {
        console.warn("renderPaginationControlsCatalog: Pagination elements not found.");
        return;
    }

    const totalPages = Math.ceil(totalBooks / pageSize);
    console.log(`renderPaginationControlsCatalog: totalBooks=${totalBooks}, pageSize=${pageSize}, totalPages=${totalPages}, currentPage=${currentPage}`);

    if (totalPages <= 0 || totalBooks === 0) {
        paginationControlsElement.classList.add('hidden');
        return;
    }

    paginationControlsElement.classList.remove('hidden');
    pageInfoElement.textContent = `Page ${currentPage} of ${totalPages}`;
    prevPageBtn.disabled = currentPage <= 1;
    nextPageBtn.disabled = currentPage >= totalPages;
}

// Go to the previous page (Catalog)
function goToPreviousPageCatalog() {
    console.log("goToPreviousPageCatalog called.");
    if (currentPage > 1) {
        loadBooksCatalog(currentPage - 1, currentSearchTerm);
    }
}

// Go to the next page (Catalog)
function goToNextPageCatalog() {
    console.log("goToNextPageCatalog called.");
    const totalPages = Math.ceil(totalBooks / pageSize);
    if (currentPage < totalPages) {
        loadBooksCatalog(currentPage + 1, currentSearchTerm);
    }
}

// Set up event listeners for Catalog
function setupEventListeners() {
    console.log("setupEventListeners: Setting up catalog listeners...");

    // Search button click
    if (searchButton) {
        searchButton.addEventListener('click', () => {
            // Call loadBooks with page 1 and the search term
            loadBooksCatalog(1, searchInput.value);
        });
    } else { console.error("setupEventListeners: searchButton not found!"); }
    
    // Search input enter key
    if (searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                loadBooksCatalog(1, searchInput.value);
            }
        });
    } else { console.error("setupEventListeners: searchInput not found!"); }
    
    // Reset filters
    if (filterResetBtn) {
        filterResetBtn.addEventListener('click', () => {
            searchInput.value = '';
            // Load page 1 with no search term
            loadBooksCatalog(1, '');
        });
    } else { console.error("setupEventListeners: filterResetBtn not found!"); }

    // Pagination listeners
    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', goToPreviousPageCatalog);
    } else { console.error("setupEventListeners: prevPageBtn not found!"); }

    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', goToNextPageCatalog);
    } else { console.error("setupEventListeners: nextPageBtn not found!"); }
}

// *** RESTORE ORIGINAL createBookCard FUNCTION ***
function createBookCard(book) {
    const genresList = formatGenres(book.Genres); // Depends on formatGenres
    const starRating = createStarRating(book.Avg_Rating); // Depends on createStarRating

    // Create the main book card element
    const card = document.createElement('div');
    card.className = 'book-card';

    // Create card header
    const cardHeader = document.createElement('div');
    cardHeader.className = 'book-card-header';

    const title = document.createElement('h3');
    title.textContent = book.Book || 'Untitled';
    title.title = book.Book || 'Untitled'; // For tooltip on hover

    const author = document.createElement('div');
    author.className = 'book-author';
    author.textContent = book.Author ? `by ${book.Author}` : 'by Unknown Author';

    cardHeader.appendChild(title);
    cardHeader.appendChild(author);

    // Create card body
    const cardBody = document.createElement('div');
    cardBody.className = 'book-card-body';

    const description = document.createElement('p');
    description.className = 'book-description';
    description.textContent = book.Description || 'No description available.';

    // Genres tags
    const genres = document.createElement('div');
    genres.className = 'book-genres';

    genresList.forEach(genre => {
        const genreTag = document.createElement('span');
        genreTag.className = 'book-genre';
        genreTag.textContent = genre;
        genres.appendChild(genreTag);
    });

    // Ratings
    const ratings = document.createElement('div');
    ratings.className = 'book-ratings';

    const avgRating = document.createElement('span');
    avgRating.className = 'book-avg-rating';
    // Use innerHTML if createStarRating returns HTML string
    avgRating.innerHTML = `${starRating} ${book.Avg_Rating !== null ? book.Avg_Rating.toFixed(1) : 'N/A'}`;

    const numRatings = document.createElement('span');
    numRatings.className = 'book-num-ratings';
    numRatings.textContent = `(${book.Num_Ratings || 0} ratings)`;

    ratings.appendChild(avgRating);
    ratings.appendChild(numRatings);

    // URL link
    const url = document.createElement('a');
    url.className = 'book-url btn tertiary-btn'; // Added button classes for consistency
    url.href = book.URL || '#';
    // Only open in new tab if URL is valid
    if (book.URL) {
        url.target = '_blank';
        url.rel = 'noopener noreferrer';
    }
    url.textContent = 'View Details'; // Changed text slightly

    // Append all elements to the card body
    cardBody.appendChild(description);
    if (genresList.length > 0) { // Only add genres div if there are genres
        cardBody.appendChild(genres);
    }
    cardBody.appendChild(ratings);
    cardBody.appendChild(url);

    // Build the complete card
    card.appendChild(cardHeader);
    card.appendChild(cardBody);

    return card;
}

// Helper function placeholders (ensure these exist and work)
function formatGenres(genresData) {
    if (!genresData) return [];
    if (Array.isArray(genresData)) return genresData;
    // Handle potential trailing/leading commas or multiple commas
    return genresData.split(',').map(g => g.trim()).filter(g => g !== '');
}

function createStarRating(rating) {
    const numStars = Math.round(rating || 0);
    return '⭐'.repeat(numStars) + '☆'.repeat(5 - numStars);
}

function showError(element, error) {
    console.error("Displaying Error:", error);
    if (element) {
        element.textContent = `Error: ${error.message || 'Unknown error'}`;
        element.classList.remove('hidden');
    }
}

// Initialize the catalog on page load
document.addEventListener('DOMContentLoaded', initCatalog);