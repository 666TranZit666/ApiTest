export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Handle CORS preflight requests so your web browser is allowed to communicate with Cloudflare
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    // ==========================================
    // 1. ORIGINAL SCRIPT CODE ENDPOINTS
    // ==========================================

    // FRONTEND WEBSITE SENDS CODE HERE (/send-code)
    if (request.method === "POST" && url.pathname === "/send-code") {
      try {
        const data = await request.json();
        const sessionKey = data.key;
        const luauCode = data.code;

        if (!sessionKey || !luauCode) {
          return new Response("Missing session key or code payload.", { 
            status: 400, 
            headers: { "Access-Control-Allow-Origin": "*" } 
          });
        }

        // Save script data directly to the KV Namespace under a specific prefix
        await env.ROBLOX_QUEUE.put(`code:${sessionKey}`, luauCode);

        return new Response("Code successfully cached at the edge network.", {
          status: 200,
          headers: { "Access-Control-Allow-Origin": "*" }
        });
      } catch (err) {
        return new Response("Invalid request payload syntax.", { 
          status: 400, 
          headers: { "Access-Control-Allow-Origin": "*" } 
        });
      }
    }

    // ROBLOX PICKS UP CODE HERE (/get-code)
    if (request.method === "GET" && url.pathname === "/get-code") {
      const sessionKey = url.searchParams.get("key");

      if (!sessionKey) {
        return new Response("Missing search identification parameter key.", { 
          status: 400, 
          headers: { "Access-Control-Allow-Origin": "*" } 
        });
      }

      // Fetch the queued text execution package from KV Storage
      const cachedCode = await env.ROBLOX_QUEUE.get(`code:${sessionKey}`);

      if (cachedCode) {
        // Clear it out so it executes exactly once
        await env.ROBLOX_QUEUE.delete(`code:${sessionKey}`);
        
        return new Response(cachedCode, {
          status: 200,
          headers: { 
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "text/plain"
          }
        });
      }

      return new Response("", { 
        status: 200, 
        headers: { "Access-Control-Allow-Origin": "*" } 
      });
    }

    // ==========================================
    // 2. NEW CONFIGURATION SYNC ENDPOINTS
    // ==========================================

    // FRONTEND WEBSITE SAVES FULL CONFIGS HERE (/send-config)
    if (request.method === "POST" && url.pathname === "/send-config") {
      try {
        const data = await request.json();
        const sessionKey = data.key;
        const configObject = data.config; // Expects the full JavaScript settings dictionary object

        if (!sessionKey || !configObject) {
          return new Response("Missing session key or config structure payload.", { 
            status: 400, 
            headers: { "Access-Control-Allow-Origin": "*" } 
          });
        }

        // Stringify and store the configuration properties securely under a config prefix
        await env.ROBLOX_QUEUE.put(`config:${sessionKey}`, JSON.stringify(configObject));

        return new Response("Configuration state successfully synchronized.", {
          status: 200,
          headers: { "Access-Control-Allow-Origin": "*" }
        });
      } catch (err) {
        return new Response("Invalid request config payload syntax.", { 
          status: 400, 
          headers: { "Access-Control-Allow-Origin": "*" } 
        });
      }
    }

    // ROBLOX POLLS COMPLEX PROPERTIES HERE (/get-config)
    if (request.method === "GET" && url.pathname === "/get-config") {
      const sessionKey = url.searchParams.get("key");

      if (!sessionKey) {
        return new Response("Missing search identification parameter key.", { 
          status: 400, 
          headers: { "Access-Control-Allow-Origin": "*" } 
        });
      }

      const storedConfig = await env.ROBLOX_QUEUE.get(`config:${sessionKey}`);

      if (storedConfig) {
        return new Response(storedConfig, {
          status: 200,
          headers: { 
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json" // Informs the client it is a strict JSON object
          }
        });
      }

      // Return an empty JSON object layout if no configuration matrix has been pushed yet
      return new Response(JSON.stringify({}), { 
        status: 200, 
        headers: { 
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json"
        } 
      });
    }

    // Final fallback catching mismatched parameters or raw endpoint roots
    return new Response("Endpoint Not Found or Method Not Allowed", { 
      status: 404, 
      headers: { "Access-Control-Allow-Origin": "*" } 
    });
  },
};
