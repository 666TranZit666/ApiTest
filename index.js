var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// index.js
var globalStateStorage = {};
var defaultConfigurationMatrix = {
  WalkSpeed: 16,
  JumpPower: 50,
  HipHeight: 16,
  FlySpeed: 50,
  FlyKey: "E",
  Noclip: false,
  Invis: false,
  AntiAFK: false,
  Flashlight: false,
  InfZoom: false,
  FOV: 70,
  PlayerToView: "",
  FastCheckout: false,
  HardDragger: false,
  AlwaysDay: false,
  AlwaysNight: false,
  NoFog: false,
  SignDupeAmount: 1,
  TeleportWithTree: true,
  SelectedTreeTypeSize: "Largest",
  AutoSaveGUIConfiguration: true,
  GlobalShadows: true,
  UnboxItems: false,
  FreeCamera: false,
  DropAxeAfterDupe: false,
  SellPlankAfterMilling: false,
  UITheme: "Rise"
};
var index_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const method = request.method;
    const sanitizedPath = url.pathname.replace(/\/$/, "");
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json"
    };
    if (method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }
    const sessionKey = url.searchParams.get("key");
    const enforceSessionMemory = /* @__PURE__ */ __name((key) => {
      if (!globalStateStorage[key]) {
        globalStateStorage[key] = {
          config: { ...defaultConfigurationMatrix },
          codePayload: "",
          localPlayerName: "",
          connectedClientsList: []
        };
      }
    }, "enforceSessionMemory");
    if (sanitizedPath === "/update-state" && method === "POST") {
      try {
        const incomingPayload = await request.json();
        const clientKey = incomingPayload.key;
        if (!clientKey) {
          return new Response(JSON.stringify({ error: "Missing identity token verification." }), { status: 400, headers: corsHeaders });
        }
        enforceSessionMemory(clientKey);
        globalStateStorage[clientKey].localPlayerName = incomingPayload.localPlayerName || "";
        globalStateStorage[clientKey].connectedClientsList = incomingPayload.connectedClientsList || [];
        return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders });
      } catch (err) {
        return new Response(JSON.stringify({ error: "Payload parsing execution exception." }), { status: 400, headers: corsHeaders });
      }
    }
    if (sanitizedPath === "/get-state" && method === "GET") {
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
    if (sanitizedPath === "/get-config" && method === "GET") {
      if (!sessionKey) {
        return new Response("Missing tracking access parameters.", { status: 400, headers: corsHeaders });
      }
      enforceSessionMemory(sessionKey);
      return new Response(JSON.stringify(globalStateStorage[sessionKey].config), { status: 200, headers: corsHeaders });
    }
    if (sanitizedPath === "/send-config" && method === "POST") {
      try {
        const incomingPayload = await request.json();
        const clientKey = incomingPayload.key;
        if (!clientKey) {
          return new Response(JSON.stringify({ error: "Validation key parameters absent." }), { status: 400, headers: corsHeaders });
        }
        enforceSessionMemory(clientKey);
        globalStateStorage[clientKey].config = { ...globalStateStorage[clientKey].config, ...incomingPayload.config };
        return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders });
      } catch (err) {
        return new Response(JSON.stringify({ error: "Invalid layout data matrix transmission." }), { status: 400, headers: corsHeaders });
      }
    }
    if (sanitizedPath === "/get-code" && method === "GET") {
      if (!sessionKey) {
        return new Response("Missing tracking access parameters.", { status: 400, headers: corsHeaders });
      }
      enforceSessionMemory(sessionKey);
      const payload = globalStateStorage[sessionKey].codePayload || "";
      globalStateStorage[sessionKey].codePayload = "";
      return new Response(payload, { status: 200, headers: { ...corsHeaders, "Content-Type": "text/plain" } });
    }
    if (sanitizedPath === "/send-code" && method === "POST") {
      try {
        const incomingPayload = await request.json();
        const clientKey = incomingPayload.key;
        if (!clientKey || !incomingPayload.code) {
          return new Response(JSON.stringify({ error: "Execution context components validation failure." }), { status: 400, headers: corsHeaders });
        }
        enforceSessionMemory(clientKey);
        globalStateStorage[clientKey].codePayload = incomingPayload.code;
        return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders });
      } catch (err) {
        return new Response(JSON.stringify({ error: "Action processing payload failure." }), { status: 400, headers: corsHeaders });
      }
    }
    return new Response(JSON.stringify({
      error: "Target infrastructure endpoint routing mapping absent.",
      receivedPath: url.pathname,
      sanitizedPath,
      receivedMethod: method
    }), { status: 404, headers: corsHeaders });
  }
};
export {
  index_default as default
};
//# sourceMappingURL=index.js.map
