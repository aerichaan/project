// Supabase Client Configuration
const SUPABASE_URL = 'https://svvyhhqkyfyxyfygfsiw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2dnloaHFreWZ5eHlmeWdmc2l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4NTU3MzAsImV4cCI6MjA2MTQzMTczMH0.QsKyLCSznXGJMjyHNt4zJR22UDSkKQv4o3bb-nnGWxM';

// Initialize the Supabase client
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Check if a user is authenticated
function isAuthenticated() {
    return supabaseClient.auth.getSession()
        .then(({ data }) => {
            return !!data.session;
        })
        .catch(error => {
            console.error('Auth check error:', error);
            return false;
        });
}

// Redirect to login if not authenticated
async function requireAuth() {
    const authenticated = await isAuthenticated();
    
    if (!authenticated) {
        window.location.href = 'admin-login.html';
        return false;
    }
    
    return true;
}

// Format date to a human-readable format
function formatDate(dateString) {
    if (!dateString) return '';
    
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Truncate text with ellipsis if it's too long
function truncateText(text, maxLength = 100) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// Show notification message
function showNotification(element, message, isError = false) {
    if (!element) return;
    
    element.textContent = message;
    element.classList.remove('hidden');
    
    if (isError) {
        element.classList.add('error-message');
        element.classList.remove('notification');
    } else {
        element.classList.add('notification');
        element.classList.remove('error-message');
    }
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        element.classList.add('hidden');
    }, 5000);
}

// Display error message
function showError(element, error) {
    console.error('Error occurred:', error);
    showNotification(element, error.message || 'An unexpected error occurred. Please try again.', true);
}

// Format genres array or string for display
function formatGenres(genres) {
    if (!genres) return [];
    
    // If genres is already an array, return it
    if (Array.isArray(genres)) {
        return genres;
    }
    
    // If genres is a string, split by comma and trim
    if (typeof genres === 'string') {
        return genres.split(',').map(genre => genre.trim()).filter(genre => genre);
    }
    
    return [];
}

// Create star rating HTML
function createStarRating(rating) {
    rating = parseFloat(rating) || 0;
    let stars = '';
    
    // Full stars
    for (let i = 1; i <= Math.floor(rating); i++) {
        stars += '★';
    }
    
    // Half star
    if (rating % 1 >= 0.5) {
        stars += '★';
    }
    
    // Empty stars
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        stars += '☆';
    }
    
    return stars;
}

// Export the Supabase client for use in other files
window.supabase = supabaseClient;