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

    // 1. FRONTEND WEBSITE SENDS CODE HERE (/send-code)
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

        // Save script data directly to the KV Namespace using the session key as the dictionary identifier
        await env.ROBLOX_QUEUE.put(sessionKey, luauCode);

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

    // 2. ROBLOX STUDIO PICKS UP CODE HERE (/get-code)
    if (request.method === "GET" && url.pathname === "/get-code") {
      const sessionKey = url.searchParams.get("key");

      if (!sessionKey) {
        return new Response("Missing search identification parameter key.", { 
          status: 400, 
          headers: { "Access-Control-Allow-Origin": "*" } 
        });
      }

      // Fetch the queued text execution package from KV Storage
      const cachedCode = await env.ROBLOX_QUEUE.get(sessionKey);

      if (cachedCode) {
        // Clear the key out so Roblox executes it exactly once rather than in a continuous loop
        await env.ROBLOX_QUEUE.delete(sessionKey);
        
        return new Response(cachedCode, {
          status: 200,
          headers: { 
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "text/plain"
          }
        });
      }

      // Return an empty success string if Roblox polls but no script is waiting
      return new Response("", { 
        status: 200, 
        headers: { "Access-Control-Allow-Origin": "*" } 
      });
    }

    // Final fallback catching mismatched parameters or raw endpoint roots
    return new Response("Endpoint Not Found or Method Not Allowed", { 
      status: 404, 
      headers: { "Access-Control-Allow-Origin": "*" } 
    });
  },
};
