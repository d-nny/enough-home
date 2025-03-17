(() => {
  var __defProp = Object.defineProperty;
  var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

  // .wrangler/tmp/bundle-eqwEgP/checked-fetch.js
  var urls = /* @__PURE__ */ new Set();
  function checkURL(request, init) {
    const url = request instanceof URL ? request : new URL(
      (typeof request === "string" ? new Request(request, init) : request).url
    );
    if (url.port && url.port !== "443" && url.protocol === "https:") {
      if (!urls.has(url.toString())) {
        urls.add(url.toString());
        console.warn(
          `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
        );
      }
    }
  }
  __name(checkURL, "checkURL");
  globalThis.fetch = new Proxy(globalThis.fetch, {
    apply(target, thisArg, argArray) {
      const [request, init] = argArray;
      checkURL(request, init);
      return Reflect.apply(target, thisArg, argArray);
    }
  });

  // ../../../Users/dchee/AppData/Roaming/npm/node_modules/wrangler/templates/middleware/common.ts
  var __facade_middleware__ = [];
  function __facade_register__(...args) {
    __facade_middleware__.push(...args.flat());
  }
  __name(__facade_register__, "__facade_register__");
  function __facade_registerInternal__(...args) {
    __facade_middleware__.unshift(...args.flat());
  }
  __name(__facade_registerInternal__, "__facade_registerInternal__");
  function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
    const [head, ...tail] = middlewareChain;
    const middlewareCtx = {
      dispatch,
      next(newRequest, newEnv) {
        return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
      }
    };
    return head(request, env, ctx, middlewareCtx);
  }
  __name(__facade_invokeChain__, "__facade_invokeChain__");
  function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
    return __facade_invokeChain__(request, env, ctx, dispatch, [
      ...__facade_middleware__,
      finalMiddleware
    ]);
  }
  __name(__facade_invoke__, "__facade_invoke__");

  // ../../../Users/dchee/AppData/Roaming/npm/node_modules/wrangler/templates/middleware/loader-sw.ts
  var __FACADE_EVENT_TARGET__;
  if (globalThis.MINIFLARE) {
    __FACADE_EVENT_TARGET__ = new (Object.getPrototypeOf(WorkerGlobalScope))();
  } else {
    __FACADE_EVENT_TARGET__ = new EventTarget();
  }
  function __facade_isSpecialEvent__(type) {
    return type === "fetch" || type === "scheduled";
  }
  __name(__facade_isSpecialEvent__, "__facade_isSpecialEvent__");
  var __facade__originalAddEventListener__ = globalThis.addEventListener;
  var __facade__originalRemoveEventListener__ = globalThis.removeEventListener;
  var __facade__originalDispatchEvent__ = globalThis.dispatchEvent;
  globalThis.addEventListener = function(type, listener, options) {
    if (__facade_isSpecialEvent__(type)) {
      __FACADE_EVENT_TARGET__.addEventListener(
        type,
        listener,
        options
      );
    } else {
      __facade__originalAddEventListener__(type, listener, options);
    }
  };
  globalThis.removeEventListener = function(type, listener, options) {
    if (__facade_isSpecialEvent__(type)) {
      __FACADE_EVENT_TARGET__.removeEventListener(
        type,
        listener,
        options
      );
    } else {
      __facade__originalRemoveEventListener__(type, listener, options);
    }
  };
  globalThis.dispatchEvent = function(event) {
    if (__facade_isSpecialEvent__(event.type)) {
      return __FACADE_EVENT_TARGET__.dispatchEvent(event);
    } else {
      return __facade__originalDispatchEvent__(event);
    }
  };
  globalThis.addMiddleware = __facade_register__;
  globalThis.addMiddlewareInternal = __facade_registerInternal__;
  var __facade_waitUntil__ = Symbol("__facade_waitUntil__");
  var __facade_response__ = Symbol("__facade_response__");
  var __facade_dispatched__ = Symbol("__facade_dispatched__");
  var __Facade_ExtendableEvent__ = class extends Event {
    [__facade_waitUntil__] = [];
    waitUntil(promise) {
      if (!(this instanceof __Facade_ExtendableEvent__)) {
        throw new TypeError("Illegal invocation");
      }
      this[__facade_waitUntil__].push(promise);
    }
  };
  __name(__Facade_ExtendableEvent__, "__Facade_ExtendableEvent__");
  var __Facade_FetchEvent__ = class extends __Facade_ExtendableEvent__ {
    #request;
    #passThroughOnException;
    [__facade_response__];
    [__facade_dispatched__] = false;
    constructor(type, init) {
      super(type);
      this.#request = init.request;
      this.#passThroughOnException = init.passThroughOnException;
    }
    get request() {
      return this.#request;
    }
    respondWith(response) {
      if (!(this instanceof __Facade_FetchEvent__)) {
        throw new TypeError("Illegal invocation");
      }
      if (this[__facade_response__] !== void 0) {
        throw new DOMException(
          "FetchEvent.respondWith() has already been called; it can only be called once.",
          "InvalidStateError"
        );
      }
      if (this[__facade_dispatched__]) {
        throw new DOMException(
          "Too late to call FetchEvent.respondWith(). It must be called synchronously in the event handler.",
          "InvalidStateError"
        );
      }
      this.stopImmediatePropagation();
      this[__facade_response__] = response;
    }
    passThroughOnException() {
      if (!(this instanceof __Facade_FetchEvent__)) {
        throw new TypeError("Illegal invocation");
      }
      this.#passThroughOnException();
    }
  };
  __name(__Facade_FetchEvent__, "__Facade_FetchEvent__");
  var __Facade_ScheduledEvent__ = class extends __Facade_ExtendableEvent__ {
    #scheduledTime;
    #cron;
    #noRetry;
    constructor(type, init) {
      super(type);
      this.#scheduledTime = init.scheduledTime;
      this.#cron = init.cron;
      this.#noRetry = init.noRetry;
    }
    get scheduledTime() {
      return this.#scheduledTime;
    }
    get cron() {
      return this.#cron;
    }
    noRetry() {
      if (!(this instanceof __Facade_ScheduledEvent__)) {
        throw new TypeError("Illegal invocation");
      }
      this.#noRetry();
    }
  };
  __name(__Facade_ScheduledEvent__, "__Facade_ScheduledEvent__");
  __facade__originalAddEventListener__("fetch", (event) => {
    const ctx = {
      waitUntil: event.waitUntil.bind(event),
      passThroughOnException: event.passThroughOnException.bind(event)
    };
    const __facade_sw_dispatch__ = /* @__PURE__ */ __name(function(type, init) {
      if (type === "scheduled") {
        const facadeEvent = new __Facade_ScheduledEvent__("scheduled", {
          scheduledTime: Date.now(),
          cron: init.cron ?? "",
          noRetry() {
          }
        });
        __FACADE_EVENT_TARGET__.dispatchEvent(facadeEvent);
        event.waitUntil(Promise.all(facadeEvent[__facade_waitUntil__]));
      }
    }, "__facade_sw_dispatch__");
    const __facade_sw_fetch__ = /* @__PURE__ */ __name(function(request, _env, ctx2) {
      const facadeEvent = new __Facade_FetchEvent__("fetch", {
        request,
        passThroughOnException: ctx2.passThroughOnException
      });
      __FACADE_EVENT_TARGET__.dispatchEvent(facadeEvent);
      facadeEvent[__facade_dispatched__] = true;
      event.waitUntil(Promise.all(facadeEvent[__facade_waitUntil__]));
      const response = facadeEvent[__facade_response__];
      if (response === void 0) {
        throw new Error("No response!");
      }
      return response;
    }, "__facade_sw_fetch__");
    event.respondWith(
      __facade_invoke__(
        event.request,
        globalThis,
        ctx,
        __facade_sw_dispatch__,
        __facade_sw_fetch__
      )
    );
  });
  __facade__originalAddEventListener__("scheduled", (event) => {
    const facadeEvent = new __Facade_ScheduledEvent__("scheduled", {
      scheduledTime: event.scheduledTime,
      cron: event.cron,
      noRetry: event.noRetry.bind(event)
    });
    __FACADE_EVENT_TARGET__.dispatchEvent(facadeEvent);
    event.waitUntil(Promise.all(facadeEvent[__facade_waitUntil__]));
  });

  // ../../../Users/dchee/AppData/Roaming/npm/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
  var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
    try {
      return await middlewareCtx.next(request, env);
    } finally {
      try {
        if (request.body !== null && !request.bodyUsed) {
          const reader = request.body.getReader();
          while (!(await reader.read()).done) {
          }
        }
      } catch (e) {
        console.error("Failed to drain the unused request body.", e);
      }
    }
  }, "drainBody");
  var middleware_ensure_req_body_drained_default = drainBody;

  // ../../../Users/dchee/AppData/Roaming/npm/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
  function reduceError(e) {
    return {
      name: e?.name,
      message: e?.message ?? String(e),
      stack: e?.stack,
      cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
    };
  }
  __name(reduceError, "reduceError");
  var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
    try {
      return await middlewareCtx.next(request, env);
    } catch (e) {
      const error = reduceError(e);
      return Response.json(error, {
        status: 500,
        headers: { "MF-Experimental-Error-Stack": "true" }
      });
    }
  }, "jsonError");
  var middleware_miniflare3_json_error_default = jsonError;

  // .wrangler/tmp/bundle-eqwEgP/middleware-insertion-facade.js
  __facade_registerInternal__([middleware_ensure_req_body_drained_default, middleware_miniflare3_json_error_default]);

  // src/index.js
  var contentTypes = {
    "html": "text/html",
    "css": "text/css",
    "js": "text/javascript",
    "json": "application/json",
    "png": "image/png",
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "svg": "image/svg+xml",
    "ico": "image/x-icon",
    "webp": "image/webp",
    "woff": "font/woff",
    "woff2": "font/woff2",
    "ttf": "font/ttf",
    "otf": "font/otf",
    "eot": "application/vnd.ms-fontobject"
  };
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
  __name(generate404Page, "generate404Page");
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
  __name(generateComingSoonPage, "generateComingSoonPage");
  function assemblePage(navbar, content, footer, title = "ENOUGHGAMBLING - Support For Problem Gambling") {
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
    <script src="/scripts/script.js"><\/script>
  </body>
  </html>`;
  }
  __name(assemblePage, "assemblePage");
  addEventListener("fetch", (event) => {
    event.respondWith(handleRequest(event.request, event.env));
  });
  function parseContentPath(pathname) {
    if (pathname === "/" || pathname === "") {
      return { type: "page", id: "home" };
    }
    if (pathname.includes(".")) {
      return { type: "static", path: pathname };
    }
    const pathParts = pathname.split("/").filter((part) => part !== "");
    if (pathParts[0] === "location" && pathParts.length > 1) {
      return { type: "location", id: pathParts[1] };
    }
    if (pathParts[0] === "resources") {
      return { type: "page", id: "resources" };
    }
    if (pathParts[0] === "support-groups") {
      return { type: "page", id: "support-groups" };
    }
    return { type: "page", id: pathParts.join("/") };
  }
  __name(parseContentPath, "parseContentPath");
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
  __name(fetchComponent, "fetchComponent");
  async function handleRequest(request, env) {
    const url = new URL(request.url);
    let pathname = url.pathname;
    const isOverride = pathname.startsWith("/override/");
    if (isOverride) {
      pathname = pathname.replace("/override", "");
    }
    const comingSoon = env.COMING_SOON === "TRUE";
    if (comingSoon && !isOverride) {
      return new Response(generateComingSoonPage(), {
        status: 200,
        headers: {
          "Content-Type": "text/html",
          "Cache-Control": "public, max-age=3600"
        }
      });
    }
    try {
      const contentPath = parseContentPath(pathname);
      if (contentPath.type === "static") {
        const assetUrl = new URL(contentPath.path, url.origin);
        const response = await fetch(assetUrl.toString());
        if (response.status === 404) {
          return new Response(generate404Page(), {
            status: 404,
            headers: {
              "Content-Type": "text/html",
              "Cache-Control": "public, max-age=3600"
            }
          });
        }
        const extension = contentPath.path.split(".").pop().toLowerCase();
        const contentType = contentTypes[extension] || "text/plain";
        const newResponse = new Response(response.body, response);
        newResponse.headers.set("Content-Type", contentType);
        newResponse.headers.set("Cache-Control", "public, max-age=86400");
        return newResponse;
      }
      if (contentPath.type === "page") {
        const [navbar, footer] = await Promise.all([
          fetchComponent("/TopNavBar.html"),
          fetchComponent("/footer.html")
        ]);
        if (!navbar || !footer) {
          throw new Error("Could not load page template components");
        }
        let content;
        let pageTitle = "ENOUGHGAMBLING";
        if (contentPath.id === "home") {
          content = await fetchComponent("/homepage.html");
          pageTitle += " - Support For Problem Gambling";
        } else {
          content = await fetchComponent(`/pages/${contentPath.id}.html`);
          if (!content) {
            return new Response(generate404Page(), {
              status: 404,
              headers: {
                "Content-Type": "text/html",
                "Cache-Control": "public, max-age=3600"
              }
            });
          }
          pageTitle += ` - ${contentPath.id.charAt(0).toUpperCase() + contentPath.id.slice(1).replace(/-/g, " ")}`;
        }
        if (!content) {
          return new Response(generate404Page(), {
            status: 404,
            headers: {
              "Content-Type": "text/html",
              "Cache-Control": "public, max-age=3600"
            }
          });
        }
        const assembledPage = assemblePage(
          navbar,
          content,
          footer,
          pageTitle
        );
        return new Response(assembledPage, {
          headers: {
            "Content-Type": "text/html",
            "Cache-Control": "public, max-age=3600"
          }
        });
      }
      if (contentPath.type === "location") {
        const postcode = contentPath.id;
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
              "Content-Type": "text/html"
            }
          });
        }
        const [navbar, footer] = await Promise.all([
          fetchComponent("/TopNavBar.html"),
          fetchComponent("/footer.html")
        ]);
        if (!navbar || !footer) {
          throw new Error("Could not load page template components");
        }
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
        const assembledPage = assemblePage(
          navbar,
          locationContent,
          footer,
          `ENOUGHGAMBLING - Support Services Near ${postcode.toUpperCase()}`
        );
        return new Response(assembledPage, {
          headers: {
            "Content-Type": "text/html",
            "Cache-Control": "public, max-age=3600"
          }
        });
      }
      return new Response(generate404Page(), {
        status: 404,
        headers: {
          "Content-Type": "text/html",
          "Cache-Control": "public, max-age=3600"
        }
      });
    } catch (error) {
      console.error(`Error handling request for ${pathname}:`, error);
      return new Response("Internal Server Error", {
        status: 500,
        headers: {
          "Content-Type": "text/plain"
        }
      });
    }
  }
  __name(handleRequest, "handleRequest");
})();
//# sourceMappingURL=index.js.map
