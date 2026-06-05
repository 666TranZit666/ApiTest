// Global In-Memory Cache (Stores active player names cleanly without a database)
const globalStateStorage = {};

// Default Base Configurations Template Matrix
const defaultConfigurationMatrix = {
    WalkSpeed: 16,
    JumpPower: 50,
    HipHeight: 16,
    FlySpeed: 50,
    FlyKey: 'E',
    Noclip: false,
    Invis: false,
    AntiAFK: false,
    Flashlight: false,
    InfZoom: false,
    FOV: 70,
    PlayerToView: '',
    FastCheckout: false,
    HardDragger: false,
    AlwaysDay: false,
    AlwaysNight: false,
    NoFog: false,
    SignDupeAmount: 1,
    TeleportWithTree: true,
    SelectedTreeTypeSize: 'Largest',
    AutoSaveGUIConfiguration: true,
    GlobalShadows: true,
    UnboxItems: false,
    FreeCamera: false,
    DropAxeAfterDupe: false,
    SellPlankAfterMilling: false,
    UITheme: 'Rise'
};

// Main Network Pipeline Event Receiver
export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const method = request.method;

        // Setup standard open cross-origin safety header tokens
        const corsHeaders = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
            "Content-Type": "application/json"
        };

        // Handle preflight safety handshake requests smoothly
        if (method === "OPTIONS") {
            return new Response(null, { headers: corsHeaders });
        }

        // Parse incoming key tokens from URL query lines (?key=LUMA-...)
        const sessionKey = url.searchParams.get("key");

        // Helper to initialize missing session tracking layers dynamically
        const enforceSessionMemory = (key) => {
            if (!globalStateStorage[key]) {
                globalStateStorage[key] = {
                    config: { ...defaultConfigurationMatrix },
                    codePayload: "",
                    localPlayerName: "",
                    connectedClientsList: []
                };
            }
        };

        // --------------------------------------------------------
        // 1. ROUTE: /update-state (POST) - Called by Roblox Lua Script
        // --------------------------------------------------------
        if (url.pathname === "/update-state" && method === "POST") {
            try {
                const incomingPayload = await request.json();
                const clientKey = incomingPayload.key;

                if (!clientKey) {
                    return new Response(JSON.stringify({ error: "Missing identity token verification." }), { status: 400, headers: corsHeaders });
                }

                enforceSessionMemory(clientKey);

                // Cache structural active state registers
                globalStateStorage[clientKey].localPlayerName = incomingPayload.localPlayerName || "";
                globalStateStorage[clientKey].connectedClientsList = incomingPayload.connectedClientsList || [];

                return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders });
            } catch (err) {
                return new Response(JSON.stringify({ error: "Payload parsing execution exception." }), { status: 400, headers: corsHeaders });
            }
        }

        // --------------------------------------------------------
        // 2. ROUTE: /get-state (GET) - Called by Webpage Polling
        // --------------------------------------------------------
        if (url.pathname === "/get-state" && method === "GET") {
            if (!sessionKey) {
                return new Response(JSON.stringify({ error: "Required identifier parameter empty." }), { status: 400, headers: corsHeaders });
            }

            const activeSession = globalStateStorage[sessionKey];
            if (!activeSession) {
                return new Response(JSON.stringify({ localPlayerName: "", connectedClientsList: [] }), { status: 200, headers: corsHeaders });
            }

            return new Response(JSON.stringify({
                localPlayerName: activeSession.localPlayerName,
                connectedClientsList: activeSession.connectedClientsList
            }), { status: 200, headers: corsHeaders });
        }

        // --------------------------------------------------------
        // 3. ROUTE: /get-config (GET) - Polled by Roblox Lua Script
        // --------------------------------------------------------
        if (url.pathname === "/get-config" && method === "GET") {
            if (!sessionKey) {
                return new Response("Missing tracking access parameters.", { status: 400, headers: corsHeaders });
            }

            enforceSessionMemory(sessionKey);
            return new Response(JSON.stringify(globalStateStorage[sessionKey].config), { status: 200, headers: corsHeaders });
        }

        // --------------------------------------------------------
        // 4. ROUTE: /send-config (POST) - Called by Webpage Config Updates
        // --------------------------------------------------------
        if (url.pathname === "/send-config" && method === "POST") {
            try {
                const incomingPayload = await request.json();
                const clientKey = incomingPayload.key;

                if (!clientKey) {
                    return new Response(JSON.stringify({ error: "Validation key parameters absent." }), { status: 400, headers: corsHeaders });
                }

                enforceSessionMemory(clientKey);

                // Merge configuration adjustments cleanly
                globalStateStorage[clientKey].config = { ...globalStateStorage[clientKey].config, ...incomingPayload.config };
                return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders });
            } catch (err) {
                return new Response(JSON.stringify({ error: "Invalid layout data matrix transmission." }), { status: 400, headers: corsHeaders });
            }
        }

        // --------------------------------------------------------
        // 5. ROUTE: /get-code (GET) - Polled by Roblox Lua Script
        // --------------------------------------------------------
        if (url.pathname === "/get-code" && method === "GET") {
            if (!sessionKey) {
                return new Response("Missing tracking access parameters.", { status: 400, headers: corsHeaders });
            }

            enforceSessionMemory(sessionKey);
            
            // Extract the pending payload script string
            const payload = globalStateStorage[sessionKey].codePayload || "";
            
            // Self-clearing mechanism so it doesn't loop execute the same payload string continuously
            globalStateStorage[sessionKey].codePayload = ""; 

            return new Response(payload, { status: 200, headers: { ...corsHeaders, "Content-Type": "text/plain" } });
        }

        // --------------------------------------------------------
        // 6. ROUTE: /send-code (POST) - Called by Webpage Code Sender
        // --------------------------------------------------------
        if (url.pathname === "/send-code" && method === "POST") {
            try {
                const incomingPayload = await request.json();
                const clientKey = incomingPayload.key;

                if (!clientKey || !incomingPayload.code) {
                    return new Response(JSON.stringify({ error: "Execution context components validation failure." }), { status: 400, headers: corsHeaders });
                }

                enforceSessionMemory(clientKey);

                // Cache raw execution plain text instructions into queue registers
                globalStateStorage[clientKey].codePayload = incomingPayload.code;
                return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders });
            } catch (err) {
                return new Response(JSON.stringify({ error: "Action processing payload failure." }), { status: 400, headers: corsHeaders });
            }
        }

        // Catch-all response for unmatched paths
        return new Response(JSON.stringify({ error: "Target infrastructure endpoint routing mapping absent." }), { status: 404, headers: corsHeaders });
    }
};
