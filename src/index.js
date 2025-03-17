/**
 * Cloudflare Worker for ENOUGHGAMBLING website
 * - Serves content from Worker assets
 * - Assembles pages from components (header, content, footer)
 * - Handles dynamic routing for different content types
 * - Implements "coming soon" mode with override functionality
 */

// Define content types for different file extensions
const contentTypes = {
  'html': 'text/html',
  'css': 'text/css',
  'js': 'text/javascript',
  'json': 'application/json',
  'png': 'image/png',
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'svg': 'image/svg+xml',
  'ico': 'image/x-icon',
  'webp': 'image/webp',
  'woff': 'font/woff',
  'woff2': 'font/woff2',
  'ttf': 'font/ttf',
  'otf': 'font/otf',
  'eot': 'application/vnd.ms-fontobject'
};

/**
 * Generate a 404 page
 */
function generate404Page() {
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Page Not Found - ENOUGHGAMBLING</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        text-align: center;
        background-color: #f5f5f5;
      }
      .logo {
        margin-bottom: 2rem;
      }
      .logo span.black {
        color: #000;
        font-weight: bold;
        font-size: 2rem;
      }
      .logo span.red {
        color: #FF0000;
        font-weight: bold;
        font-size: 2rem;
      }
      .message {
        font-size: 1.2rem;
        margin-bottom: 2rem;
        max-width: 600px;
        padding: 0 20px;
      }
      .back-link {
        color: #FF0000;
        text-decoration: none;
        font-weight: bold;
      }
      .back-link:hover {
        text-decoration: underline;
      }
    </style>
  </head>
  <body>
    <div class="logo">
      <span class="black">ENOUGH</span><span class="red">GAMBLING</span>
    </div>
    <div class="message">
      <h1>Page Not Found</h1>
      <p>We're sorry, but the page you are looking for doesn't exist or has been moved.</p>
    </div>
    <a href="/" class="back-link">Return to Homepage</a>
  </body>
  </html>`;
}

/**
 * Generate a coming soon page
 */
function generateComingSoonPage() {
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Coming Soon - ENOUGHGAMBLING</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap');
      
      body {
        font-family: 'Montserrat', Arial, sans-serif;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        min-height: 100vh;
        text-align: center;
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        padding: 2rem 1rem;
        color: #333;
        overflow-x: hidden;
      }
      
      .logo {
        margin-bottom: 3rem;
        animation: fadeIn 1.2s ease-in-out;
      }
      
      .logo span.black {
        color: #000;
        font-weight: 700;
        font-size: 3rem;
        letter-spacing: 1px;
      }
      
      .logo span.red {
        color: #FF0000;
        font-weight: 700;
        font-size: 3rem;
        letter-spacing: 1px;
      }
      
      .message {
        font-size: 1.2rem;
        margin-bottom: 3rem;
        max-width: 700px;
        padding: 0 20px;
        animation: slideUp 0.8s ease-out;
        line-height: 1.6;
      }
      
      .message h1 {
        font-size: 2.8rem;
        margin-bottom: 1.5rem;
        color: #222;
        position: relative;
        display: inline-block;
      }
      
      .message h1:after {
        content: "";
        position: absolute;
        width: 60%;
        height: 4px;
        background-color: #FF0000;
        bottom: -10px;
        left: 20%;
        border-radius: 2px;
      }
      
      .countdown {
        display: flex;
        justify-content: center;
        gap: 2rem;
        margin: 2rem 0 3rem;
        animation: fadeIn 1.5s ease;
      }
      
      .countdown-item {
        text-align: center;
      }
      
      .countdown-number {
        font-size: 2.5rem;
        font-weight: 700;
        background: #FF0000;
        color: white;
        width: 80px;
        height: 80px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(255, 0, 0, 0.2);
      }
      
      .countdown-label {
        font-size: 0.8rem;
        margin-top: 0.5rem;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: #555;
      }
      
      .notify-container {
        width: 100%;
        max-width: 500px;
        margin-bottom: 4rem;
        animation: slideUp 1s ease-out;
      }
      
      .notify-form {
        display: flex;
        gap: 0.5rem;
        margin-top: 1rem;
      }
      
      .notify-input {
        flex: 1;
        padding: 0.8rem 1rem;
        border: 2px solid #ddd;
        border-radius: 4px;
        font-size: 1rem;
        transition: all 0.3s ease;
      }
      
      .notify-input:focus {
        border-color: #FF0000;
        outline: none;
        box-shadow: 0 0 0 3px rgba(255, 0, 0, 0.1);
      }
      
      .notify-btn {
        background-color: #FF0000;
        color: white;
        border: none;
        padding: 0.8rem 1.5rem;
        border-radius: 4px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        letter-spacing: 0.5px;
      }
      
      .notify-btn:hover {
        background-color: #cc0000;
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }
      
      .support-resources {
        margin-top: 3rem;
        width: 100%;
        max-width: 1100px;
        animation: fadeIn 1.5s ease-out;
      }
      
      .support-resources h2 {
        margin-bottom: 2.5rem;
        color: #222;
        font-size: 2rem;
        position: relative;
        display: inline-block;
      }
      
      .support-resources h2:after {
        content: "";
        position: absolute;
        width: 40%;
        height: 3px;
        background-color: #FF0000;
        bottom: -10px;
        left: 30%;
        border-radius: 2px;
      }
      
      .resources-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 2rem;
        width: 100%;
      }
      
      .resource-card {
        background-color: white;
        border-radius: 12px;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
        padding: 1.8rem;
        text-align: left;
        transition: all 0.4s ease;
        position: relative;
        overflow: hidden;
        border-top: 4px solid #FF0000;
      }
      
      .resource-card:before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, rgba(255, 0, 0, 0.05) 0%, rgba(255, 255, 255, 0) 50%);
        z-index: 0;
      }
      
      .resource-card:hover {
        transform: translateY(-10px);
        box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
      }
      
      .resource-logo {
        height: 80px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 1.5rem;
        position: relative;
        z-index: 1;
      }
      
      .resource-logo img {
        max-height: 80px;
        max-width: 100%;
        object-fit: contain;
        transition: transform 0.3s ease;
      }
      
      .resource-card:hover .resource-logo img {
        transform: scale(1.05);
      }
      
      .resource-card h3 {
        color: #222;
        margin-bottom: 0.8rem;
        font-weight: 600;
        position: relative;
        z-index: 1;
      }
      
      .resource-card p {
        color: #555;
        font-size: 0.95rem;
        line-height: 1.6;
        margin-bottom: 1.5rem;
        position: relative;
        z-index: 1;
      }
      
      .visit-site-btn {
        display: inline-block;
        padding: 0.6rem 1.2rem;
        background-color: #f8f9fa;
        color: #FF0000;
        text-decoration: none;
        border-radius: 4px;
        font-weight: 600;
        font-size: 0.9rem;
        transition: all 0.3s ease;
        border: 1px solid #eee;
        position: relative;
        z-index: 1;
      }
      
      .visit-site-btn:hover {
        background-color: #FF0000;
        color: white;
        border-color: #FF0000;
      }
      
      .social-links {
        margin-top: 3rem;
        display: flex;
        justify-content: center;
        gap: 1.5rem;
      }
      
      .social-icon {
        width: 40px;
        height: 40px;
        background-color: #333;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        color: white;
        text-decoration: none;
        font-size: 1.2rem;
      }
      
      .social-icon:hover {
        transform: translateY(-3px);
        background-color: #FF0000;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes slideUp {
        from { 
          opacity: 0; 
          transform: translateY(20px);
        }
        to { 
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @media (max-width: 768px) {
        .logo span.black, .logo span.red {
          font-size: 2.5rem;
        }
        
        .message h1 {
          font-size: 2.2rem;
        }
        
        .countdown {
          gap: 1rem;
        }
        
        .countdown-number {
          width: 60px;
          height: 60px;
          font-size: 2rem;
        }
      }
    </style>
  </head>
  <body>
    <div class="logo">
      <span class="black">ENOUGH</span><span class="red">GAMBLING</span>
    </div>
    
    <div class="message">
      <h1>Coming Soon</h1>
      <p>We're working hard to bring you resources and support for those affected by problem gambling.</p>
      <p>Our site is under construction but will be launching soon to provide comprehensive support and tools.</p>
    </div>
    
    <div class="countdown">
      <div class="countdown-item">
        <div class="countdown-number" id="countdown-days">00</div>
        <div class="countdown-label">Days</div>
      </div>
      <div class="countdown-item">
        <div class="countdown-number" id="countdown-hours">00</div>
        <div class="countdown-label">Hours</div>
      </div>
      <div class="countdown-item">
        <div class="countdown-number" id="countdown-minutes">00</div>
        <div class="countdown-label">Minutes</div>
      </div>
      <div class="countdown-item">
        <div class="countdown-number" id="countdown-seconds">00</div>
        <div class="countdown-label">Seconds</div>
      </div>
    </div>
    
    <div class="notify-container">
      <h3>Get notified when we launch</h3>
      <div class="notify-form">
        <input type="email" class="notify-input" placeholder="Enter your email">
        <button class="notify-btn">Notify Me</button>
      </div>
    </div>
    
    <div class="support-resources">
      <h2>Gambling Support Resources</h2>
      <div class="resources-grid">
        <div class="resource-card">
          <div class="resource-logo">
            <img src="/assets/images/chapter-one.svg" alt="Chapter One - Gambling Support">
          </div>
          <h3>Chapter One - Gambling Support</h3>
          <p>Provides specialized counseling and therapy services for individuals affected by problem gambling with a personalized recovery approach.</p>
          <a href="https://chapterone.org.uk/" class="visit-site-btn" target="_blank">Visit Website</a>
        </div>
        
        <div class="resource-card">
          <div class="resource-logo">
            <img src="/assets/images/gamlearn.png" alt="GamLearn">
          </div>
          <h3>GamLearn</h3>
          <p>An educational platform offering free resources to understand gambling addiction through interactive courses and informational materials.</p>
          <a href="https://www.gamlearn.org.uk/" class="visit-site-btn" target="_blank">Visit Website</a>
        </div>
        
        <div class="resource-card">
          <div class="resource-logo">
            <img src="/assets/images/gamfam.png" alt="GamFam">
          </div>
          <h3>GamFam</h3>
          <p>Specializes in supporting families and loved ones of problem gamblers, providing guidance on effective communication and establishing healthy boundaries.</p>
          <a href="https://gamfam.org.uk/" class="visit-site-btn" target="_blank">Visit Website</a>
        </div>
        
        <div class="resource-card">
          <div class="resource-logo">
            <img src="/assets/images/gamban.jpg" alt="Gamban">
          </div>
          <h3>Gamban</h3>
          <p>Offers powerful software that blocks access to gambling websites and applications across all devices, providing an essential tool for recovery.</p>
          <a href="https://gamban.com/" class="visit-site-btn" target="_blank">Visit Website</a>
        </div>
        
        <div class="resource-card">
          <div class="resource-logo">
            <img src="/assets/images/talkbanstop.png" alt="TalkBanStop">
          </div>
          <h3>TalkBanStop</h3>
          <p>A partnership initiative combining free gambling blocking software, expert counseling services, and practical self-exclusion for comprehensive support.</p>
          <a href="https://www.talkbanstop.org.uk/" class="visit-site-btn" target="_blank">Visit Website</a>
        </div>
      </div>
    </div>
    
    <div class="social-links">
      <a href="#" class="social-icon">f</a>
      <a href="#" class="social-icon">t</a>
      <a href="#" class="social-icon">in</a>
      <a href="#" class="social-icon">i</a>
    </div>
    
    <script>
      // Countdown timer
      const countdownDate = new Date();
      countdownDate.setDate(countdownDate.getDate() + 30); // Set launch date to 30 days from now
      
      function updateCountdown() {
        const now = new Date().getTime();
        const distance = countdownDate - now;
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        document.getElementById("countdown-days").textContent = days.toString().padStart(2, '0');
        document.getElementById("countdown-hours").textContent = hours.toString().padStart(2, '0');
        document.getElementById("countdown-minutes").textContent = minutes.toString().padStart(2, '0');
        document.getElementById("countdown-seconds").textContent = seconds.toString().padStart(2, '0');
      }
      
      // Update the countdown every second
      updateCountdown();
      setInterval(updateCountdown, 1000);
      
      // Form submission handling
      document.querySelector('.notify-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.querySelector('.notify-input').value;
        if(email) {
          alert('Thank you! We will notify you when we launch.');
          document.querySelector('.notify-input').value = '';
        }
      });
      
      // Handle button click separately
      document.querySelector('.notify-btn').addEventListener('click', function() {
        const email = document.querySelector('.notify-input').value;
        if(email) {
          alert('Thank you! We will notify you when we launch.');
          document.querySelector('.notify-input').value = '';
        }
      });
    </script>
  </body>
  </html>`;
}

/**
 * Assemble a complete HTML page from components
 * @param {string} navbar - HTML content for the navigation bar
 * @param {string} content - HTML content for the main body 
 * @param {string} footer - HTML content for the footer
 * @param {string} title - Page title
 * @returns {string} - Fully assembled HTML page
 */
function assemblePage(navbar, content, footer, title = 'ENOUGHGAMBLING - Support For Problem Gambling') {
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link rel="stylesheet" href="/style/styles.css">
    <meta name="description" content="Support, resources, and community for those affected by problem gambling.">
  </head>
  <body>
    ${navbar}
    <div class="content-container">
      ${content}
    </div>
    ${footer}
    <script src="/scripts/script.js"></script>
  </body>
  </html>`;
}

/**
 * Parse the path to determine the content type and specific content to serve
 * @param {string} pathname - URL path
 * @returns {object} - Content type and specific content identifier
 */
function parseContentPath(pathname) {
  // Default to home page
  if (pathname === '/' || pathname === '') {
    return { type: 'page', id: 'home' };
  }
  
  // Static assets (CSS, JS, images, etc.)
  if (pathname.includes('.')) {
    // This is a static file request
    return { type: 'static', path: pathname };
  }

  // Check for specific routes
  const pathParts = pathname.split('/').filter(part => part !== '');
  
  if (pathParts[0] === 'location' && pathParts.length > 1) {
    // Location route with postcode
    return { type: 'location', id: pathParts[1] };
  }
  
  if (pathParts[0] === 'resources') {
    // Resources page
    return { type: 'page', id: 'resources' };
  }
  
  if (pathParts[0] === 'support-groups') {
    // Support groups page
    return { type: 'page', id: 'support-groups' };
  }
  
  // For any other paths, treat as a page request
  return { type: 'page', id: pathParts.join('/') };
}

/**
 * Fetch component from assets
 * @param {string} path - Path to the component
 * @returns {Promise<string>} - Component content
 */
async function fetchComponent(path) {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      console.error(`Failed to fetch component from ${path}: ${response.status} ${response.statusText}`);
      return null;
    }
    return await response.text();
  } catch (error) {
    console.error(`Error fetching component from ${path}:`, error);
    return null;
  }
}

/**
 * Check if the request is authenticated
 * @param {Request} request - The incoming request
 * @returns {Promise<boolean>} - True if authenticated, false otherwise
 */
async function checkAuthentication(request) {
  // In a real application, this would validate JWT tokens from cookies/headers
  // or check with an auth service
  
  // For our client-side authentication system, check for auth header
  const authHeader = request.headers.get('Authorization');
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      // Simple validation of the token structure (not cryptographically secure)
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        // Check if token is expired
        if (payload.exp && Date.now() < payload.exp * 1000) {
          return true;
        }
      }
    } catch (error) {
      console.error('Error validating token:', error);
    }
  }
  
  // If we reach here, either there was no token or it was invalid
  // In real implementation, we'd check for session cookies as well
  // For now, allow authentication based on localStorage in the browser
  // by checking the url for specific testing params
  
  // For testing: check for a test parameter that allows access without real auth
  const url = new URL(request.url);
  const testAuth = url.searchParams.get('test_auth');
  if (testAuth === 'true') {
    return true;
  }
  
  return false;
}

// Export the Worker in the Modules format
export default {
  /**
   * Main fetch handler for the worker
   * @param {Request} request - The incoming request
   * @param {Object} env - Environment variables
   * @param {Object} ctx - Context
   * @returns {Response} - The response
   */
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    let pathname = url.pathname;
    
    // Handle outbound-emails route for authentication system
    if (pathname.startsWith('/outbound-emails')) {
      // Pass the request to the outbound-emails service if available
      if (env.OUTBOUND_EMAILS) {
        try {
          return await env.OUTBOUND_EMAILS.fetch(request);
        } catch (error) {
          console.error('Error forwarding to outbound-emails service:', error);
          return new Response(JSON.stringify({ error: 'Failed to send email' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      } else {
        console.error('OUTBOUND_EMAILS service binding not available');
        // For testing purposes, log the request body
        if (request.method === 'POST') {
          try {
            const body = await request.clone().json();
            console.log('Email request body:', body);
          } catch (e) {
            console.error('Failed to parse email request:', e);
          }
        }
        
        // Return mock success response for testing
        return new Response(JSON.stringify({ 
          success: true, 
          mock: true,
          message: 'OUTBOUND_EMAILS binding not available - this is a mock response' 
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // Handle inbox UI proxy
    if (pathname.startsWith('/inbox-ui/')) {
      // Pass the request to the inbox UI service if available
      if (env.INBOX_UI) {
        try {
          // Create a new request with the same method, headers, and body
          const inboxRequest = new Request(
            new URL(pathname.replace('/inbox-ui', ''), env.INBOX_UI_URL || 'https://enough-inbox-ui.workers.dev'),
            {
              method: request.method,
              headers: request.headers,
              body: request.body,
              redirect: 'follow'
            }
          );
          
          return await env.INBOX_UI.fetch(inboxRequest);
        } catch (error) {
          console.error('Error forwarding to inbox UI service:', error);
          return new Response(JSON.stringify({ error: 'Failed to access inbox UI' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      } else {
        console.error('INBOX_UI service binding not available');
        return new Response(JSON.stringify({ 
          error: 'INBOX_UI service binding not available', 
        }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // Handle inbox page - require authentication
    if (pathname === '/inbox') {
      // Check if user is logged in by checking cookies or auth headers
      const isAuthenticated = await checkAuthentication(request);
      
      if (!isAuthenticated) {
        // Redirect to home page if not authenticated
        return new Response(null, {
          status: 302,
          headers: {
            'Location': '/',
          }
        });
      }
      
      // User is authenticated, continue to render the inbox page
    }
    
    // Check if the path uses the override mechanism
    const isOverride = pathname.startsWith('/override/');
    if (isOverride) {
      // Remove the /override part from the pathname
      pathname = pathname.replace('/override', '');
    }
    
    // Check if we're in coming soon mode and not using override
    const comingSoon = env.COMING_SOON === 'TRUE';
    if (comingSoon && !isOverride) {
      return new Response(generateComingSoonPage(), {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
          'Cache-Control': 'public, max-age=3600'
        }
      });
    }
    
    try {
      const contentPath = parseContentPath(pathname);
      
      // Handle static file requests
      if (contentPath.type === 'static') {
        // Use the built-in asset handling
        const assetUrl = new URL(contentPath.path, url.origin);
        const response = await fetch(assetUrl.toString());
        
        if (response.status === 404) {
          // File not found, return 404
          return new Response(generate404Page(), {
            status: 404,
            headers: {
              'Content-Type': 'text/html',
              'Cache-Control': 'public, max-age=3600'
            }
          });
        }
        
        // Get appropriate content type based on file extension
        const extension = contentPath.path.split('.').pop().toLowerCase();
        const contentType = contentTypes[extension] || 'text/plain';
        
        // Create a new response with custom headers
        const newResponse = new Response(response.body, response);
        newResponse.headers.set('Content-Type', contentType);
        newResponse.headers.set('Cache-Control', 'public, max-age=86400');
        
        return newResponse;
      }
      
      // Handle page requests by assembling components
      if (contentPath.type === 'page') {
        // Get the navbar and footer components
        const [navbar, footer] = await Promise.all([
          fetchComponent('/TopNavBar.html'),
          fetchComponent('/footer.html')
        ]);
        
        if (!navbar || !footer) {
          throw new Error('Could not load page template components');
        }
        
        let content;
        let pageTitle = 'ENOUGHGAMBLING';
        
        // Load the appropriate content based on the page ID
        if (contentPath.id === 'home') {
          content = await fetchComponent('/homepage.html');
          pageTitle += ' - Support For Problem Gambling';
        } else {
          // Check if a specific page template exists
          content = await fetchComponent(`/pages/${contentPath.id}.html`);
          
          // If no specific page template, return 404
          if (!content) {
            return new Response(generate404Page(), {
              status: 404,
              headers: {
                'Content-Type': 'text/html',
                'Cache-Control': 'public, max-age=3600'
              }
            });
          }
          
          pageTitle += ` - ${contentPath.id.charAt(0).toUpperCase() + contentPath.id.slice(1).replace(/-/g, ' ')}`;
        }
        
        // If content still couldn't be loaded, return 404
        if (!content) {
          return new Response(generate404Page(), {
            status: 404,
            headers: {
              'Content-Type': 'text/html',
              'Cache-Control': 'public, max-age=3600'
            }
          });
        }
        
        // Assemble the complete page
        const assembledPage = assemblePage(
          navbar,
          content,
          footer,
          pageTitle
        );
        
        // Return the assembled page
        return new Response(assembledPage, {
          headers: {
            'Content-Type': 'text/html',
            'Cache-Control': 'public, max-age=3600'
          }
        });
      }
      
      // Handle location requests
      if (contentPath.type === 'location') {
        // Here we would normally make a call to a location service
        // For now, we'll show a placeholder page that can be replaced with actual service binding later
        
        const postcode = contentPath.id;
        
        // Verify postcode format (basic UK postcode validation)
        const postcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i;
        if (!postcodeRegex.test(postcode)) {
          return new Response(`
            <div>
              <h1>Invalid Postcode Format</h1>
              <p>The postcode "${postcode}" does not appear to be valid. Please check and try again.</p>
            </div>
          `, {
            status: 400,
            headers: {
              'Content-Type': 'text/html',
            }
          });
        }
        
        // Get the navbar and footer
        const [navbar, footer] = await Promise.all([
          fetchComponent('/TopNavBar.html'),
          fetchComponent('/footer.html')
        ]);
        
        if (!navbar || !footer) {
          throw new Error('Could not load page template components');
        }
        
        // Create a placeholder content block (this would be replaced by service binding later)
        const locationContent = `
          <div class="main-content">
            <div class="info-box">
              <h1>Support Services Near ${postcode.toUpperCase()}</h1>
              <p>This page will display gambling support services near your location.</p>
              <p>In the future, this content will be dynamically loaded from a location service binding.</p>
            </div>
            
            <div class="resources-grid">
              <div class="resource-card">
                <h3>Local Support Group</h3>
                <p>Example support group near ${postcode.toUpperCase()}</p>
                <p>Address: 123 Example Street</p>
                <p>Phone: 01234 567890</p>
              </div>
              <div class="resource-card">
                <h3>Counseling Center</h3>
                <p>Example counseling service within 5 miles of ${postcode.toUpperCase()}</p>
                <p>Address: 456 Example Road</p>
                <p>Phone: 01234 567891</p>
              </div>
            </div>
          </div>
        `;
        
        // Assemble the complete page
        const assembledPage = assemblePage(
          navbar,
          locationContent,
          footer,
          `ENOUGHGAMBLING - Support Services Near ${postcode.toUpperCase()}`
        );
        
        // Return the assembled page
        return new Response(assembledPage, {
          headers: {
            'Content-Type': 'text/html',
            'Cache-Control': 'public, max-age=3600'
          }
        });
      }
      
      // If we get here, we don't know how to handle the request
      return new Response(generate404Page(), {
        status: 404,
        headers: {
          'Content-Type': 'text/html',
          'Cache-Control': 'public, max-age=3600'
        }
      });
      
    } catch (error) {
      // Log error and return 500 response
      console.error(`Error handling request for ${pathname}:`, error);
      return new Response('Internal Server Error', {
        status: 500,
        headers: {
          'Content-Type': 'text/plain'
        }
      });
    }
  }
};
