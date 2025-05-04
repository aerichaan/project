// DOM Elements
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const errorElement = document.getElementById('errorMessage');

// Initialize the auth page
function initAuth() {
    // Check if already authenticated
    isAuthenticated().then(authenticated => {
        if (authenticated) {
            // Redirect to admin dashboard if already logged in
            window.location.href = 'admin-dashboard.html';
        }
    });
    
    // Set up login form submission
    loginForm.addEventListener('submit', handleLogin);
}

// Handle login form submission
async function handleLogin(event) {
    event.preventDefault();
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    
    // Clear previous errors
    if (errorElement) errorElement.textContent = ''; 
    if (errorElement) errorElement.style.display = 'none';

    // Basic validation
    if (!email || !password) {
        showError(errorElement, { message: 'Please enter both email and password.' });
        return;
    }
    
    try {
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.textContent = 'Logging in...';
        
        // Attempt to sign in
        const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (signInError) {
            // Use the specific error from Supabase if available
            throw new Error(signInError.message || 'Invalid login credentials.');
        }

        // If sign-in is successful, check the role
        if (authData && authData.user) {
            const userId = authData.user.id;

            // Fetch the user's profile from the public.users table
            const { data: profileData, error: profileError } = await supabase
                .from('users') // Ensure this matches your table name
                .select('role')
                .eq('id', userId)
                .single();

            if (profileError) {
                console.error('Error fetching user profile:', profileError.message);
                // Sign the user out because we can't verify their role
                await supabase.auth.signOut();
                throw new Error('Login failed: Could not verify user role.');
            }

            // Check the role
            if (profileData && profileData.role === 'admin') {
                // SUCCESS: User is an admin!
                console.log('Admin login successful!');
                // Redirect to admin dashboard
                window.location.href = 'admin-dashboard.html';
                // No need to reset button here as page redirects
                return; // Exit function on success
            } else {
                // FAILURE: User is not an admin (or profile/role missing)
                console.warn('Login attempt by non-admin user:', email);
                // Sign the user out immediately
                await supabase.auth.signOut();
                throw new Error('Login failed: Administrator privileges required.');
            }
        } else {
            // Handle unexpected case where authData or user is missing after success
             console.error('Login anomaly: No user data after successful sign in.');
             throw new Error('Login failed: An unexpected error occurred.');
        }
        
    } catch (error) {
        // Handle all errors (sign-in, profile fetch, role check)
        console.error('Login process error:', error.message);

        // Use alert() instead of showError
        let alertMessage = error.message || 'An unexpected error occurred.';
        if (alertMessage === 'Login failed: Administrator privileges required.') {
            alertMessage = "You don't have permission to access this page";
        }
        alert(alertMessage);

        // Hide the dedicated error element if it exists, as we are using alert now
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
        
        // Reset password field
        passwordInput.value = '';
        
    } finally {
        // Reset button state ONLY if not redirected
        // The check for redirection happens implicitly because if successful, the function returns early.
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText; // Use the stored original text
    }
}

// Initialize the auth page on DOM content load
document.addEventListener('DOMContentLoaded', initAuth);

// Helper function to display errors (ensure this exists)
function showError(element, error) {
    if (element) {
        element.textContent = error.message;
        element.style.display = 'block';
    }
}

// Helper function to check authentication status (ensure this exists)
async function isAuthenticated() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
        console.error("Error getting session:", error);
        return false;
    }
    // We might want to also check the role here if redirecting
    // For now, just checks if a session exists
    return !!session;
}