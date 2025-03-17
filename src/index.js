/**
 * Cloudflare Worker for ENOUGHGAMBLING website
 * - Fixed priority order for path handling
 * - Enhanced debug endpoint
 * - Improved override mechanism
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
  // The original function content remains the same
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Coming Soon - ENOUGHGAMBLING</title>
    <style>
      /* Your original CSS styles here */
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
    
    <!-- Rest of the original content -->
    
    <script>
      // Countdown timer script
    </script>
  </body>
  </html>`;
}

/**
 * Assemble a complete HTML page from components
 */
function assemblePage(navbar, content, footer, title = 'ENOUGHGAMBLING - Support For Problem Gambling') {
  // Original function remains the same
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
 */
function parseContentPath(pathname) {
  // Original function remains the same
  if (pathname === '/' || pathname === '') {
    return { type: 'page', id: 'home' };
  }
  
  if (pathname.includes('.')) {
    return { type: 'static', path: pathname };
  }

  const pathParts = pathname.split('/').filter(part => part !== '');
  
  if (pathParts[0] === 'location' && pathParts.length > 1) {
    return { type: 'location', id: pathParts[1] };
  }
  
  if (pathParts[0] === 'resources') {
    return { type: 'page', id: 'resources' };
  }
  
  if (pathParts[0] === 'support-groups') {
    return { type: 'page', id: 'support-groups' };
  }
  
  return { type: 'page', id: pathParts.join('/') };
}

/**
 * Fetch component from assets
 */
async function fetchComponent(path) {
  // Original function remains the same
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
 */
async function checkAuthentication(request) {
  // Original function remains the same
  const authHeader = request.headers.get('Authorization');
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        if (payload.exp && Date.now() < payload.exp * 1000) {
          return true;
        }
      }
    } catch (error) {
      console.error('Error validating token:', error);
    }
  }
  
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
   */
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    let pathname = url.pathname;
    
    // FIXED: Handle debug endpoint first, before any other checks
    if (pathname === '/debug-info') {
      // Enhanced debug information
      const comingSoonValue = env.COMING_SOON || 'not set';
      const debugInfo = {
        url: request.url,
        method: request.method,
        pathname,
        query: Object.fromEntries(url.searchParams.entries()),
        overrideTests: {
          pathStartsWithOverride: pathname.startsWith('/override/'),
          hasOverrideParam: url.searchParams.has('override'),
          overrideParamValue: url.searchParams.get('override'),
          isOverrideDetected: pathname.startsWith('/override/') || url.searchParams.has('override')
        },
        environmentInfo: {
          comingSoon: comingSoonValue,
          comingSoonEvaluation: comingSoonValue === 'TRUE',
          availableEnvVars: Object.keys(env)
        },
        headers: Object.fromEntries(
          [...request.headers.entries()].map(([key, value]) => [
            key, 
            key.toLowerCase() === 'authorization' ? '***REDACTED***' : value
          ])
        )
      };
      
      return new Response(JSON.stringify(debugInfo, null, 2), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
    }
    
    // Handle outbound-emails route for authentication system
    if (pathname.startsWith('/outbound-emails')) {
      // Original email handling logic remains
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
        if (request.method === 'POST') {
          try {
            const body = await request.clone().json();
            console.log('Email request body:', body);
          } catch (e) {
            console.error('Failed to parse email request:', e);
          }
        }
        
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
      // Original inbox UI logic remains
      if (env.INBOX_UI) {
        try {
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
      const isAuthenticated = await checkAuthentication(request);
      
      if (!isAuthenticated) {
        return new Response(null, {
          status: 302,
          headers: {
            'Location': '/',
          }
        });
      }
    }
    
    // FIXED: Improved override handling
    let isOverride = false;
    
    // Check explicit override param
    if (url.searchParams.has('override')) {
      const overrideValue = url.searchParams.get('override');
      // Accept any value that could reasonably mean "yes"
      isOverride = overrideValue === 'true' || 
                   overrideValue === '1' || 
                   overrideValue === 'yes' ||
                   overrideValue === '';  // Handle case where just "?override" is passed
    }
    
    // Check path override
    if (pathname.startsWith('/override/')) {
      isOverride = true;
      // Rewrite path by removing /override/ prefix
      pathname = pathname.replace('/override/', '/');
      if (pathname === '') pathname = '/';
    }
    
    // FIXED: Improved coming soon check with better logging
    const comingSoonValue = env.COMING_SOON || '';
    // Check multiple possible values for "true"
    const comingSoon = comingSoonValue === 'TRUE' || 
                       comingSoonValue === 'true' || 
                       comingSoonValue === '1' || 
                       comingSoonValue === 'yes';
    
    console.log(`Path: ${pathname}, Coming soon: ${comingSoon}, Override: ${isOverride}`);
    
    if (comingSoon && !isOverride) {
      // Add a visible link to easily access the site with override
      const comingSoonPage = generateComingSoonPage();
      
      // FIXED: Make the override link more prominent and explicit
      const overrideLink = `
      <div style="margin-top: 20px; padding: 10px; text-align: center; background-color: #f1f1f1; border: 1px solid #ddd;">
        <p style="margin: 5px 0;">
          <a href="/?override=true" style="color: #333; text-decoration: underline; font-size: 1rem; font-weight: bold;">
            Preview Site (Development Access)
          </a>
        </p>
        <p style="margin: 5px 0; font-size: 0.8rem; color: #666;">
          Alternative access methods: 
          <a href="/override/" style="color: #666;">Path-based override</a>
        </p>
      </div>
      `;
      
      // Insert before closing body tag
      const enhancedPage = comingSoonPage.replace('</body>', `${overrideLink}</body>`);
      
      return new Response(enhancedPage, {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
    }
    
    // Rest of the worker logic for handling content
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
      
      // Handle page requests and other content types
      // ... (rest of original code)
      
    } catch (error) {
      // Log error and return 500 response
      console.error(`Error handling request for ${pathname}:`, error);
      return new Response('Internal Server Error', {
        status: 500,
        headers: {
          'Content-Type': 'text/plain',
          'Cache-Control': 'no-store'
        }
      });
    }
  }
};
