/**
 * Inbox UI Integration Script
 * Handles communication between the main site and the inbox iframe
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get the iframe element
    const inboxFrame = document.getElementById('inbox-frame');
    
    if (!inboxFrame) return;
    
    // Get current user email from local storage (or JWT token)
    const userEmail = getUserEmail();
    
    // Handle messages from the iframe
    window.addEventListener('message', function(event) {
        // Verify origin (in production, restrict to your domain)
        // if (event.origin !== 'https://your-domain.com') return;
        
        // Handle different message types
        if (event.data && event.data.type) {
            switch(event.data.type) {
                case 'INBOX_READY':
                    // Inbox UI is ready, send the user email
                    sendUserEmailToInbox(inboxFrame, userEmail);
                    break;
                    
                case 'AUTH_REQUIRED':
                    // Inbox needs authentication, handle accordingly
                    handleAuthRequired();
                    break;
                    
                case 'NOTIFICATION':
                    // Show notification from inbox (new email, etc)
                    showNotification(event.data.message);
                    break;
            }
        }
    });
    
    // Send email to inbox once it's loaded
    inboxFrame.onload = function() {
        // Give the frame a moment to initialize its JS
        setTimeout(() => {
            sendUserEmailToInbox(inboxFrame, userEmail);
        }, 500);
    };
    
    /**
     * Get the user email from storage
     */
    function getUserEmail() {
        // Try to get email from localStorage
        const email = localStorage.getItem('user_email');
        
        if (email) return email;
        
        // If no email in localStorage, try to get from JWT token
        try {
            const token = localStorage.getItem('auth_token');
            if (token) {
                const payload = JSON.parse(atob(token.split('.')[1]));
                return payload.email;
            }
        } catch (e) {
            console.error('Error getting email from token:', e);
        }
        
        // Fallback to a default or redirect to login
        return null;
    }
    
    /**
     * Send user email to the inbox iframe
     */
    function sendUserEmailToInbox(frame, email) {
        if (!email) {
            console.error('No user email available');
            return;
        }
        
        try {
            // PostMessage to the iframe with the email
            frame.contentWindow.postMessage({
                type: 'SET_USER_EMAIL',
                email: email
            }, '*'); // In production, specify the target origin for security
            
            console.log('Sent email to inbox UI:', email);
        } catch (error) {
            console.error('Error sending email to inbox:', error);
        }
    }
    
    /**
     * Handle authentication required response
     */
    function handleAuthRequired() {
        console.log('Inbox requires authentication');
        
        // Redirect to login or show login modal
        if (confirm('You need to login to access your inbox. Would you like to login now?')) {
            // Redirect to home page to login
            window.location.href = '/';
        }
    }
    
    /**
     * Show a notification from the inbox
     */
    function showNotification(message) {
        // Simple notification - in production use a proper notification system
        const notification = document.createElement('div');
        notification.className = 'inbox-notification';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Remove after 5 seconds
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, 5000);
    }
});
