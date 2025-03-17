// Toggle burger menu
const burgerBtn = document.getElementById('burger-btn');
const dropdownMenu = document.getElementById('dropdown-menu');

burgerBtn.addEventListener('click', function() {
    this.classList.toggle('active');
    dropdownMenu.classList.toggle('active');
});

// Toggle submenu
document.querySelectorAll('.has-submenu').forEach(item => {
    item.addEventListener('click', function(e) {
        if (e.target === this) {
            e.stopPropagation();
            this.classList.toggle('active');
        }
    });
});

// Authentication System
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const loginBtn = document.getElementById('login-btn');
    const loginModal = document.getElementById('login-modal');
    const closeModal = document.querySelector('.close-modal');
    const emailStep = document.getElementById('email-step');
    const codeStep = document.getElementById('code-step');
    const profileStep = document.getElementById('profile-step');
    const emailForm = document.getElementById('email-form');
    const codeForm = document.getElementById('code-form');
    const profileForm = document.getElementById('profile-form');
    const emailMessage = document.getElementById('email-message');
    const codeMessage = document.getElementById('code-message');
    const profileMessage = document.getElementById('profile-message');
    const loginEmail = document.getElementById('login-email');
    const codeInputs = document.querySelectorAll('.code-input');
    const usernameInput = document.getElementById('username');
    const resendCodeBtn = document.getElementById('resend-code');
    
    // Check if user is already logged in
    function checkAuth() {
        const token = localStorage.getItem('auth_token');
        if (token) {
            try {
                // Simple JWT validation (in a real app, you'd verify the token with the server)
                const payload = JSON.parse(atob(token.split('.')[1]));
                const expiry = payload.exp * 1000; // Convert to ms
                
                if (Date.now() < expiry) {
                    updateUIforLoggedInUser(payload.email, payload.username);
                    return true;
                } else {
                    // Token expired
                    localStorage.removeItem('auth_token');
                }
            } catch (e) {
                console.error('Error parsing auth token', e);
                localStorage.removeItem('auth_token');
            }
        }
        return false;
    }
    
    // Update UI for logged in user
    function updateUIforLoggedInUser(email, username) {
        const navRight = document.querySelector('.nav-right');
        
        // Remove login button
        if (loginBtn) {
            loginBtn.remove();
        }
        
        // Check if profile already exists
        if (!document.querySelector('.user-profile')) {
            // Create user profile element
            const userProfile = document.createElement('div');
            userProfile.className = 'user-profile';
            
            // Create avatar (first letter of username or email)
            const userAvatar = document.createElement('div');
            userAvatar.className = 'user-avatar';
            userAvatar.textContent = (username || email).charAt(0).toUpperCase();
            
            // Create username display
            const usernameDisplay = document.createElement('span');
            usernameDisplay.textContent = username || email.split('@')[0];
            
            // Create dropdown
            const profileDropdown = document.createElement('div');
            profileDropdown.className = 'profile-dropdown';
            profileDropdown.innerHTML = `
                <ul>
                    <li><a href="/profile">My Profile</a></li>
                    <li><a href="/settings">Settings</a></li>
                    <li><a href="#" id="logout-btn">Logout</a></li>
                </ul>
            `;
            
            // Append elements
            userProfile.appendChild(userAvatar);
            userProfile.appendChild(usernameDisplay);
            userProfile.appendChild(profileDropdown);
            navRight.insertBefore(userProfile, burgerBtn);
            
            // Add event listener for profile click
            userProfile.addEventListener('click', function(e) {
                if (!e.target.closest('#logout-btn')) {
                    e.stopPropagation();
                    profileDropdown.classList.toggle('active');
                }
            });
            
            // Add event listener for logout
            document.getElementById('logout-btn').addEventListener('click', function(e) {
                e.preventDefault();
                logout();
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', function(e) {
                if (!e.target.closest('.user-profile')) {
                    profileDropdown.classList.remove('active');
                }
            });
        }
    }
    
    // Logout function
    function logout() {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_email');
        
        // Remove user profile from navbar
        const userProfile = document.querySelector('.user-profile');
        if (userProfile) {
            userProfile.remove();
        }
        
        // Add login button back
        const navRight = document.querySelector('.nav-right');
        const loginButton = document.createElement('button');
        loginButton.className = 'login-btn';
        loginButton.id = 'login-btn';
        loginButton.textContent = 'LOGIN';
        navRight.insertBefore(loginButton, burgerBtn);
        
        // Re-attach event listener to new login button
        document.getElementById('login-btn').addEventListener('click', openModal);
        
        // Reload page to ensure clean state
        window.location.reload();
    }
    
    // Generate a random 6-digit code
    function generateVerificationCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    
    // Send verification email
    async function sendVerificationEmail(email) {
        try {
            emailMessage.textContent = 'Sending verification code...';
            emailMessage.className = 'auth-message';
            
            // Generate a verification code
            const verificationCode = generateVerificationCode();
            
            // Save the code and email to localStorage (in a real app, this would be server-side)
            localStorage.setItem('verification_code', verificationCode);
            localStorage.setItem('user_email', email);
            
            // Set expiry time (5 minutes from now)
            const expiryTime = Date.now() + (5 * 60 * 1000);
            localStorage.setItem('code_expiry', expiryTime.toString());
            
            // Send email using the outbound email service
            const emailBody = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <span style="color: #000; font-weight: bold; font-size: 24px;">ENOUGH</span><span style="color: #FF0000; font-weight: bold; font-size: 24px;">GAMBLING</span>
                    </div>
                    <h2 style="color: #333;">Your Verification Code</h2>
                    <p style="color: #666; margin-bottom: 30px;">Please use the following code to verify your email address:</p>
                    <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin-bottom: 30px; border-radius: 4px;">
                        ${verificationCode}
                    </div>
                    <p style="color: #666; margin-bottom: 10px;">This code will expire in 5 minutes.</p>
                    <p style="color: #666; font-size: 12px; margin-top: 50px; text-align: center;">
                        If you didn't request this code, you can safely ignore this email.
                    </p>
                </div>
            `;
            
            const response = await fetch('/outbound-emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    to: email,
                    subject: 'Your Login Verification Code - ENOUGHGAMBLING',
                    body: emailBody
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to send verification email');
            }
            
            emailMessage.textContent = 'Verification code sent! Check your email.';
            emailMessage.className = 'auth-message success';
            
            // Show code verification step
            emailStep.classList.add('hidden');
            codeStep.classList.remove('hidden');
            
            // Focus on first code input
            codeInputs[0].focus();
            
        } catch (error) {
            console.error('Error sending verification email:', error);
            emailMessage.textContent = 'Failed to send verification code. Please try again.';
            emailMessage.className = 'auth-message error';
        }
    }
    
    // Verify the entered code
    function verifyCode(enteredCode) {
        const storedCode = localStorage.getItem('verification_code');
        const expiryTime = parseInt(localStorage.getItem('code_expiry') || '0');
        
        // Check if code has expired
        if (Date.now() > expiryTime) {
            codeMessage.textContent = 'Verification code has expired. Please request a new one.';
            codeMessage.className = 'auth-message error';
            return false;
        }
        
        // Check if code matches
        if (enteredCode === storedCode) {
            codeMessage.textContent = 'Code verified successfully!';
            codeMessage.className = 'auth-message success';
            return true;
        } else {
            codeMessage.textContent = 'Invalid code. Please try again.';
            codeMessage.className = 'auth-message error';
            return false;
        }
    }
    
    // Create JWT token
    function createAuthToken(email, username) {
        // In a real app, this would be done server-side
        const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
        const payload = btoa(JSON.stringify({
            email: email,
            username: username,
            exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days expiry
            iat: Math.floor(Date.now() / 1000)
        }));
        
        // In a real app, the signature would be cryptographically generated
        const signature = btoa('signature');
        
        return `${header}.${payload}.${signature}`;
    }
    
    // Check if user profile exists
    function checkUserProfile(email) {
        // In a real app, this would fetch user data from a server/database
        // For demo purposes, we'll just check localStorage
        const token = localStorage.getItem('auth_token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                return !!payload.username;
            } catch (e) {
                return false;
            }
        }
        return false;
    }
    
    // Complete user authentication
    function completeAuthentication(email, username) {
        // Create and store auth token
        const token = createAuthToken(email, username);
        localStorage.setItem('auth_token', token);
        
        // Clear verification data
        localStorage.removeItem('verification_code');
        localStorage.removeItem('code_expiry');
        
        // Update UI
        updateUIforLoggedInUser(email, username);
        
        // Close modal
        loginModal.classList.remove('active');
        
        // Reset forms
        emailForm.reset();
        codeForm.reset();
        profileForm.reset();
        
        // Reset steps
        setTimeout(() => {
            profileStep.classList.add('hidden');
            codeStep.classList.add('hidden');
            emailStep.classList.remove('hidden');
            emailMessage.textContent = '';
            codeMessage.textContent = '';
            profileMessage.textContent = '';
        }, 500);
    }
    
    // Open login modal
    function openModal() {
        loginModal.classList.add('active');
        loginEmail.focus();
    }
    
    // Close login modal
    function closeModal() {
        loginModal.classList.remove('active');
        setTimeout(() => {
            // Reset to email step
            profileStep.classList.add('hidden');
            codeStep.classList.add('hidden');
            emailStep.classList.remove('hidden');
            
            // Clear messages
            emailMessage.textContent = '';
            codeMessage.textContent = '';
            profileMessage.textContent = '';
            
            // Reset forms
            emailForm.reset();
            codeForm.reset();
            profileForm.reset();
        }, 300);
    }
    
    // Setup code input field automatic focus
    function setupCodeInputs() {
        codeInputs.forEach((input, index) => {
            input.addEventListener('keyup', function(e) {
                // Move to next input on keypress (except last input)
                if (this.value.length === 1 && index < codeInputs.length - 1) {
                    codeInputs[index + 1].focus();
                }
                
                // Allow backspace to go to previous input
                if (e.key === 'Backspace' && index > 0 && this.value.length === 0) {
                    codeInputs[index - 1].focus();
                }
            });
        });
    }
    
    // Event Listeners
    
    // Login button click
    if (loginBtn) {
        loginBtn.addEventListener('click', openModal);
    }
    
    // Close modal
    closeModal.addEventListener('click', closeModal);
    window.addEventListener('click', function(e) {
        if (e.target === loginModal) {
            closeModal();
        }
    });
    
    // Email submission
    emailForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = loginEmail.value.trim();
        if (email) {
            sendVerificationEmail(email);
        }
    });
    
    // Code verification
    codeForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Collect code from all inputs
        let enteredCode = '';
        codeInputs.forEach(input => {
            enteredCode += input.value;
        });
        
        if (enteredCode.length === 6) {
            const isValid = verifyCode(enteredCode);
            if (isValid) {
                const userEmail = localStorage.getItem('user_email');
                
                // Check if user profile exists
                if (checkUserProfile(userEmail)) {
                    // User already has a profile, complete authentication
                    const payload = JSON.parse(atob(localStorage.getItem('auth_token').split('.')[1]));
                    completeAuthentication(userEmail, payload.username);
                } else {
                    // User needs to complete profile
                    codeStep.classList.add('hidden');
                    profileStep.classList.remove('hidden');
                    usernameInput.focus();
                }
            }
        } else {
            codeMessage.textContent = 'Please enter all 6 digits of the code.';
            codeMessage.className = 'auth-message error';
        }
    });
    
    // Profile completion
    profileForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = usernameInput.value.trim();
        if (username) {
            const userEmail = localStorage.getItem('user_email');
            completeAuthentication(userEmail, username);
        } else {
            profileMessage.textContent = 'Please enter a username.';
            profileMessage.className = 'auth-message error';
        }
    });
    
    // Resend code
    resendCodeBtn.addEventListener('click', function(e) {
        e.preventDefault();
        const userEmail = localStorage.getItem('user_email');
        if (userEmail) {
            // Go back to email step but with email pre-filled
            codeStep.classList.add('hidden');
            emailStep.classList.remove('hidden');
            loginEmail.value = userEmail;
            
            // Clear code inputs
            codeInputs.forEach(input => {
                input.value = '';
            });
            
            codeMessage.textContent = '';
        } else {
            // Go back to email step
            codeStep.classList.add('hidden');
            emailStep.classList.remove('hidden');
        }
    });
    
    // Setup code inputs
    setupCodeInputs();
    
    // Check if user is already logged in
    checkAuth();
});
