// DOM Elements
const logoutBtn = document.getElementById('logoutBtn');
const addBookBtn = document.getElementById('addBookBtn');
const cancelFormBtn = document.getElementById('cancelFormBtn');
const bookForm = document.getElementById('bookForm');
const addEditBookForm = document.getElementById('addEditBookForm');
const formTitle = document.getElementById('formTitle');
const booksTableBody = document.getElementById('booksTableBody');
const tableSearch = document.getElementById('tableSearch');
const tableNoResults = document.getElementById('tableNoResults');
const confirmationModal = document.getElementById('confirmationModal');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const loadingElement = document.getElementById('loading');
const notificationElement = document.getElementById('notification');
const prevPageBtn = document.getElementById('prevPageBtn');
const nextPageBtn = document.getElementById('nextPageBtn');

// Form input elements
const bookIdInput = document.getElementById('bookId');
const titleInput = document.getElementById('title');
const authorInput = document.getElementById('author');
const descriptionInput = document.getElementById('description');
const genresInput = document.getElementById('genres');
const urlInput = document.getElementById('url');
const avgRatingInput = document.getElementById('avgRating');
const numRatingInput = document.getElementById('numRating');

// State variables
let books = [];
let filteredBooks = [];
let bookToDelete = null;
let currentPage = 1;
let currentSearchTerm = '';
let totalBooks = 0;
const pageSize = 100; // Display 100 books per page

// Initialize the admin dashboard
async function initAdmin() {
    // *** ADD LOG ***
    console.log("initAdmin: Running...");

    // Require authentication
    const authenticated = await requireAuth();
    if (!authenticated) {
        console.log("initAdmin: Not authenticated, stopping initialization.");
        return;
    }
    
    console.log("initAdmin: Authenticated, proceeding...");
    
    // Set up event listeners
    console.log("initAdmin: Calling setupEventListeners()...");
    setupEventListeners();
    
    // Load initial books data (page 1)
    console.log("initAdmin: Calling loadBooks(1, '')...");
    loadBooks(1, ''); // Load page 1 with no search term initially
}

// Set up event listeners
function setupEventListeners() {
    // *** ADD LOG ***
    console.log("setupEventListeners: Running...");

    // Logout button
    if (logoutBtn) { // Add checks for element existence
        logoutBtn.addEventListener('click', handleLogout);
    } else { console.error("setupEventListeners: logoutBtn not found!"); }
    
    // Add book button
    if (addBookBtn) {
        addBookBtn.addEventListener('click', () => {
            showBookForm();
        });
    } else { console.error("setupEventListeners: addBookBtn not found!"); }
    
    // Cancel form button
    if (cancelFormBtn) {
        cancelFormBtn.addEventListener('click', () => {
            hideBookForm();
        });
    } else { console.error("setupEventListeners: cancelFormBtn not found!"); }
    
    // Book form submission
    if (addEditBookForm) {
        addEditBookForm.addEventListener('submit', handleBookFormSubmit);
    } else { console.error("setupEventListeners: addEditBookForm not found!"); }
    
    // Table search
    if (tableSearch) {
        tableSearch.addEventListener('input', () => {
            filterBooks(tableSearch.value.trim().toLowerCase());
        });
    } else { console.error("setupEventListeners: tableSearch not found!"); }
    
    // Delete confirmation modal
    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener('click', () => {
            hideDeleteModal();
        });
    } else { console.error("setupEventListeners: cancelDeleteBtn not found!"); }
    
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', () => {
            if (bookToDelete) {
                deleteBook(bookToDelete);
            }
        });
    } else { console.error("setupEventListeners: confirmDeleteBtn not found!"); }

    // *** CHECK AND ADD PAGINATION LISTENERS ***
    if (prevPageBtn) {
        console.log("setupEventListeners: Adding listener to prevPageBtn");
        prevPageBtn.addEventListener('click', goToPreviousPage);
    } else {
        console.error("setupEventListeners: prevPageBtn element not found!");
    }

    if (nextPageBtn) {
        console.log("setupEventListeners: Adding listener to nextPageBtn");
        nextPageBtn.addEventListener('click', goToNextPage);
    } else {
        console.error("setupEventListeners: nextPageBtn element not found!");
    }
}

// Load a specific page of books from Supabase, applying search filter
async function loadBooks(page = 1, searchTerm = '') {
    currentPage = page; // Update current page state
    currentSearchTerm = searchTerm; // Update search term state

    try {
        loadingElement.classList.remove('hidden');
        tableNoResults.classList.add('hidden'); // Hide no results initially
        booksTableBody.innerHTML = ''; // Clear table while loading

        // Calculate the range for the current page
        const offset = (currentPage - 1) * pageSize;
        const limit = pageSize - 1; // Supabase range is inclusive
        const rangeEnd = offset + limit;

        // *** ADD THIS LOG ***
        console.log(`Requesting books - Page: ${currentPage}, Offset: ${offset}, RangeEnd: ${rangeEnd}, PageSize: ${pageSize}`);

        // Build the query
        let query = supabase
            .from('Books')
            .select('* ', { count: 'exact' }); // Fetch data and total count
            // Note: Ensure there's a space after * in select if using count, or just '*' might be fine.

        // Apply search filter if searchTerm is provided
        if (searchTerm) {
            query = query.or(
                `Book.ilike.%${searchTerm}%,Author.ilike.%${searchTerm}%,Genres.ilike.%${searchTerm}%`
            );
        }

        // Apply ordering and pagination range
        query = query
            .order('"Book"', { ascending: true })
            .range(offset, rangeEnd);

        // Execute the query
        const { data, error, count } = await query;

        // *** UPDATED LOG ***
        console.log(`Received ${data ? data.length : 0} books from Supabase. Total matching count: ${count}`);

        if (error) throw error;

        // Update state
        books = data || []; 
        totalBooks = count || 0; 

        // Display the fetched books for the current page
        displayBooksTable(); 
        renderPaginationControls(); 

    } catch (error) {
        showError(notificationElement, error);
        books = []; 
        totalBooks = 0;
        displayBooksTable(); 
        renderPaginationControls(); 
    } finally {
        loadingElement.classList.add('hidden');
    }
}

// Display books in admin table (now displays only the current page's books)
function displayBooksTable() {
    // Clear the table body
    booksTableBody.innerHTML = '';

    // Check if the 'books' array (current page data) is empty
    if (books.length === 0) {
        console.log("displayBooksTable: No books in the current page data array.");
        tableNoResults.classList.remove('hidden');
        return;
    }

    console.log(`displayBooksTable: Processing ${books.length} books for the table.`);
    tableNoResults.classList.add('hidden');

    // Add book rows for the current page
    books.forEach((book, index) => {
        // *** ADD LOGGING INSIDE LOOP ***
        console.log(`   Processing book index ${index}:`, book);
        try {
            const row = createBookTableRow(book);
            // *** ADD LOGGING FOR CREATED ROW ***
            console.log(`   Created row element for index ${index}:`, row);
            if (row) { // Check if the row was actually created
                booksTableBody.appendChild(row);
            } else {
                console.error(`   Failed to create table row for book index ${index}:`, book);
            }
        } catch (error) {
             console.error(`   Error in createBookTableRow for book index ${index}:`, error, book);
        }
    });
}

// Create a table row for a book
function createBookTableRow(book) {
    const row = document.createElement('tr');
    
    // Book title cell
    const titleCell = document.createElement('td');
    titleCell.textContent = book.Book;
    
    // Author cell
    const authorCell = document.createElement('td');
    authorCell.textContent = book.Author;
    
    // Genres cell
    const genresCell = document.createElement('td');
    const genresList = formatGenres(book.Genres);
    genresCell.textContent = genresList.join(', ');
    
    // Rating cell
    const ratingCell = document.createElement('td');
    ratingCell.innerHTML = `${createStarRating(book.Avg_Rating)} (${book.Num_Ratings || 0})`;
    
    // Actions cell
    const actionsCell = document.createElement('td');
    actionsCell.className = 'table-actions';
    
    const editButton = document.createElement('button');
    editButton.className = 'btn secondary-btn';
    editButton.textContent = 'Edit';
    editButton.addEventListener('click', () => {
        showBookForm(book);
    });
    
    const deleteButton = document.createElement('button');
    deleteButton.className = 'btn danger-btn';
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => {
        showDeleteModal(book);
    });
    
    actionsCell.appendChild(editButton);
    actionsCell.appendChild(deleteButton);
    
    // Add cells to row
    row.appendChild(titleCell);
    row.appendChild(authorCell);
    row.appendChild(genresCell);
    row.appendChild(ratingCell);
    row.appendChild(actionsCell);
    
    return row;
}

// Show book form (empty for new book, or populated for edit)
function showBookForm(book = null) {
    // Set form title
    formTitle.textContent = book ? 'Edit Book' : 'Add New Book';
    
    // Reset form
    addEditBookForm.reset();
    
    if (book) {
        // Populate form with book data for editing
        bookIdInput.value = book.ID || '';
        titleInput.value = book.Book || '';
        authorInput.value = book.Author || '';
        descriptionInput.value = book.Description || '';
        genresInput.value = Array.isArray(book.Genres) ? book.Genres.join(', ') : book.Genres || '';
        urlInput.value = book.URL || '';
        avgRatingInput.value = book.Avg_Rating || 0;
        numRatingInput.value = book.Num_Ratings || 0;
    } else {
        // Clear form for new book
        bookIdInput.value = '';
    }
    
    // Show form
    bookForm.classList.remove('hidden');
    
    // Focus on title input
    titleInput.focus();
}

// Hide book form
function hideBookForm() {
    bookForm.classList.add('hidden');
}

// Handle book form submission
async function handleBookFormSubmit(event) {
    event.preventDefault();
    
    try {
        // Get form data
        const bookData = {
            Book: titleInput.value.trim(),
            Author: authorInput.value.trim(),
            Description: descriptionInput.value.trim(),
            Genres: genresInput.value.trim(),
            URL: urlInput.value.trim(),
            Avg_Rating: parseFloat(avgRatingInput.value) || 0,
            Num_Ratings: parseInt(numRatingInput.value) || 0
        };
        
        // Validate form data
        if (!bookData.Book || !bookData.Author) {
            throw new Error('Book title and author are required.');
        }
        
        // Show loading state
        const submitBtn = addEditBookForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';
        
        let result;
        
        // Check if editing or creating
        const bookId = bookIdInput.value;
        
        if (bookId) {
            // Update existing book
            result = await supabase
                .from('Books')
                .update(bookData)
                .eq('ID', bookId);
        } else {
            // --- Create new book --- 
            
            // 1. Find the current maximum ID
            const { data: maxIdData, error: maxIdError } = await supabase
                .from('Books')
                .select('ID')
                .order('ID', { ascending: false })
                .limit(1)
                .maybeSingle(); // Use maybeSingle in case the table is empty

            if (maxIdError) {
                console.error("Error fetching max ID:", maxIdError);
                throw new Error('Could not determine next book ID.');
            }

            // 2. Calculate the next ID
            const maxId = maxIdData ? maxIdData.ID : 0; // Start at 0 if table is empty
            const nextId = maxId + 1;

            // 3. Add the new ID to the book data object
            const bookDataWithId = {
                ...bookData, // Spread the existing data (Title, Author, etc.)
                ID: nextId   // Add the calculated ID
            };

            // 4. Insert the new book with the calculated ID
            result = await supabase
                .from('Books')
                .insert([bookDataWithId]) // Use the object containing the new ID
                .select();
        }
        
        // Check for errors (applies to both update and insert)
        if (result.error) throw result.error;
        
        // Success
        const action = bookId ? 'updated' : 'added';
        showNotification(notificationElement, `Book successfully ${action}!`);
        
        // Hide form and reload books
        hideBookForm();
        loadBooks();
        
    } catch (error) {
        showError(notificationElement, error);
    } finally {
        // Reset button state
        const submitBtn = addEditBookForm.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Save Book';
    }
}

// Render pagination buttons and info
function renderPaginationControls() {
    // *** ADD LOG: Function called ***
    console.log("renderPaginationControls: Running...");

    // Add guards for missing elements just in case
    const paginationControlsElement = document.getElementById('paginationControls');
    const pageInfoElement = document.getElementById('pageInfo');
    const prevPageBtn = document.getElementById('prevPageBtn');
    const nextPageBtn = document.getElementById('nextPageBtn');

    if (!paginationControlsElement || !pageInfoElement || !prevPageBtn || !nextPageBtn) {
        console.error("Pagination control elements not found in the DOM!");
        return; 
    }

    const totalPages = Math.ceil(totalBooks / pageSize);

    // *** ADD LOG: Values used ***
    console.log(`renderPaginationControls: totalBooks=${totalBooks}, pageSize=${pageSize}, totalPages=${totalPages}, currentPage=${currentPage}`);

    if (totalPages <= 0 || totalBooks === 0) { // Also check totalBooks directly
        console.log("renderPaginationControls: Hiding controls (no pages or totalBooks is 0).");
        paginationControlsElement.classList.add('hidden'); // Hide if no books/pages
        return;
    }

    paginationControlsElement.classList.remove('hidden'); // Show if pages exist

    pageInfoElement.textContent = `Page ${currentPage} of ${totalPages}`;

    // Calculate disabled states
    const isPrevDisabled = currentPage <= 1;
    const isNextDisabled = currentPage >= totalPages;

    // *** ADD LOG: Button states ***
    console.log(`renderPaginationControls: Setting prevPageBtn.disabled = ${isPrevDisabled}`);
    console.log(`renderPaginationControls: Setting nextPageBtn.disabled = ${isNextDisabled}`);

    // Apply disabled states
    prevPageBtn.disabled = isPrevDisabled;
    nextPageBtn.disabled = isNextDisabled;
}

// Go to the previous page
function goToPreviousPage() {
    // *** ADD LOG ***
    console.log("goToPreviousPage called.");
    if (currentPage > 1) {
        loadBooks(currentPage - 1, currentSearchTerm);
    }
}

// Go to the next page
function goToNextPage() {
    // *** ADD LOG ***
    console.log("goToNextPage called.");
    const totalPages = Math.ceil(totalBooks / pageSize);
    if (currentPage < totalPages) {
        loadBooks(currentPage + 1, currentSearchTerm);
    }
}

// Filter books in admin table
function filterBooks(searchTerm) {
    // *** ADD LOG ***
    console.log(`filterBooks called with searchTerm: '${searchTerm}'`);
    // Don't modify filteredBooks directly anymore
    loadBooks(1, searchTerm); // Load first page of filtered results
}

// Show delete confirmation modal
function showDeleteModal(book) {
    bookToDelete = book;
    confirmationModal.classList.add('active');
}

// Hide delete confirmation modal
function hideDeleteModal() {
    bookToDelete = null;
    confirmationModal.classList.remove('active');
}

// Delete a book
async function deleteBook(book) {
    try {
        // Show loading/notification
        showNotification(notificationElement, 'Deleting book...');
        hideDeleteModal();

        // Delete book from Supabase
        const { error } = await supabase
            .from('Books')
            .delete()
            .eq('ID', book.ID);

        if (error) throw error;
        
        // Success
        showNotification(notificationElement, 'Book successfully deleted!');
        
        // Hide modal and reload books
        hideDeleteModal();
        loadBooks();
        
    } catch (error) {
        showError(notificationElement, error);
        hideDeleteModal();
    }
}

// Handle logout
async function handleLogout() {
    try {
        // Show loading state
        logoutBtn.disabled = true;
        
        // Sign out
        const { error } = await supabase.auth.signOut();
        
        if (error) throw error;
        
        // Redirect to login page
        window.location.href = 'admin-login.html';
        
    } catch (error) {
        showError(notificationElement, error);
        logoutBtn.disabled = false;
    }
}

// Initialize the admin dashboard on DOM content load
document.addEventListener('DOMContentLoaded', initAdmin);