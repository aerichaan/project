// This file contains common functionality used across the site

// Check if user is on the admin dashboard and redirect to login if not authenticated
document.addEventListener('DOMContentLoaded', () => {
    // Get the current page
    const currentPage = window.location.pathname.split('/').pop();
    
    // Only check authentication on admin dashboard
    if (currentPage === 'admin-dashboard.html') {
        // The auth check is handled in the admin.js file
        return;
    }
});