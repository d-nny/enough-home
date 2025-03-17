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
        font-size: 2.5rem;
      }
      .logo span.red {
        color: #FF0000;
        font-weight: bold;
        font-size: 2.5rem;
      }
      .message {
        font-size: 1.2rem;
        margin-bottom: 2rem;
        max-width: 600px;
        padding: 0 20px;
      }
      .countdown {
        margin-top: 2rem;
        font-weight: bold;
        font-size: 1.5rem;
      }
      .contact {
        margin-top: 2rem;
        font-size: 0.9rem;
        color: #666;
      }
      .contact a {
        color: #FF0000;
        text-decoration: none;
      }
      .contact a:hover {
        text-decoration: underline;
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
      <p>Our site is under construction but will be launching soon.</p>
    </div>
    <div class="contact">
      Need immediate help? Contact the National Gambling Helpline: <a href="tel:18005224700">1-800-522-4700</a>
    </div>
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
 * Main event handler for the worker
 */
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request, event.env));
});

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
 * Handle the request
 * @param {Request} request - The incoming request
 * @param {Object} env - Environment variables
 * @returns {Response} - The response
 */
async function handleRequest(request, env) {
  const url = new URL(request.url);
  let pathname = url.pathname;
  
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
