export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Handle CORS preflight requests so your website doesn't get blocked
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    // 1. DATA RECEIVER: Website sends the raw slider value here
    if (request.method === "POST" && url.pathname === "/api/update-config") {
      try {
        const data = await request.json();
        
        if (!data.key) {
          return new Response("Missing unique session key", { status: 400 });
        }

        // Save the dynamic value inside Cloudflare KV storage
        await env.LUMA_KV.put(`config:${data.key}`, JSON.stringify({ 
          WalkSpeedValue: data.WalkSpeedValue 
        }));

        return new Response(JSON.stringify({ success: true }), {
          headers: { 
            "Content-Type": "application/json", 
            "Access-Control-Allow-Origin": "*" 
          }
        });
      } catch (err) {
        return new Response("Invalid JSON payload", { status: 400 });
      }
    }

    // 2. DATA TRANSMITTER: Roblox pulls the saved data here
    if (request.method === "GET" && url.pathname === "/api/get-config") {
      const key = url.searchParams.get("key");
      if (!key) {
        return new Response("Missing unique session key parameter", { status: 400 });
      }

      // Read the raw values straight from your KV storage namespace
      const config = await env.LUMA_KV.get(`config:${key}`);
      
      // Fallback default value (16) if no slider value has been saved yet
      const responsePayload = config || JSON.stringify({ WalkSpeedValue: 16 });

      return new Response(responsePayload, {
        headers: { 
          "Content-Type": "application/json", 
          "Access-Control-Allow-Origin": "*" 
        }
      });
    }

    // Fallback error routing
    return new Response("Endpoint Route Not Found", { status: 404 });
  }
};
