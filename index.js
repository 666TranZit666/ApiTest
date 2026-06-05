// Global memory store to preserve user input values without running external database steps
const serverMemoryStore = {};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Dynamic Header Definitions resolving all browser cross-origin policy exceptions
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // Intercept standard browser pre-flight checks instantly
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // 1. DATA RECEIVER ROUTE: Receives numerical value directly from the webpage slider
    if (request.method === "POST" && url.pathname === "/api/update-config") {
      try {
        const bodyData = await request.json();
        const userKey = bodyData.key || "DEFAULT_KEY";

        // Save exactly what the webpage passed inside runtime memory layout
        serverMemoryStore[userKey] = bodyData.value;

        return new Response(JSON.stringify({ success: true }), {
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: "Malformed payload body structure" }), { 
          status: 400, 
          headers: corsHeaders 
        });
      }
    }

    // 2. DATA PROVIDER ROUTE: Gives the numerical value straight to your game executor loop
    if (request.method === "GET" && url.pathname === "/api/get-config") {
      const userKey = url.searchParams.get("key") || "DEFAULT_KEY";
      
      // Pull value out of memory, falling back to 16 if empty
      const activeValue = serverMemoryStore[userKey] !== undefined ? serverMemoryStore[userKey] : 16;

      return new Response(JSON.stringify({ WalkSpeedValue: activeValue }), {
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    // Fallback catching general pattern variations
    return new Response("Not Found", { status: 404, headers: corsHeaders });
  }
};
