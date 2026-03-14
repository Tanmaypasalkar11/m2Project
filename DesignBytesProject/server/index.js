import "dotenv/config";
import { createServer } from "node:http";
import { URL } from "node:url";
import { WebSocketServer } from "ws";
import { DashboardStore } from "./dashboardStore.js";
import { syncDatabase } from "./db.js";
import { createButtonCommand, listButtonCommands } from "./buttonCommandRepository.js";
import { listMachineStatuses, upsertMachineStatuses } from "./machineStatusRepository.js";
import { buildStatusesFromSnapshot } from "./machineStatusService.js";

// Local backend port used by the React app and the Python bridge.
const PORT = Number.parseInt(process.env.HMI_PORT ?? "4000", 10);
// Central in-memory state holder for the HMI dashboard.
const store = new DashboardStore();
const OPEN_SOCKET = 1;

// Allows the frontend and Python process to call this backend from localhost.
function setCorsHeaders(response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

// Standard helper to send JSON responses from every route.
function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json",
  });

  response.end(JSON.stringify(payload));
}

// Reads the full request body and parses it as JSON for POST routes.
function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;
    });

    request.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });

    request.on("error", reject);
  });
}

// HTTP API used by the frontend and the Python bridge.
const server = createServer(async (request, response) => {
  setCorsHeaders(response);

  if (request.method === "OPTIONS") {
    response.writeHead(204);
    response.end();
    return;
  }

  const requestUrl = new URL(request.url ?? "/", `http://${request.headers.host}`);

  try {
    if (request.method === "GET" && requestUrl.pathname === "/api/health") {
      sendJson(response, 200, { ok: true, service: "hmi-backend" });
      return;
    }

    if (request.method === "GET" && requestUrl.pathname === "/api/hmi/state") {
      sendJson(response, 200, { state: store.getSnapshot() });
      return;
    }

    if (request.method === "GET" && requestUrl.pathname === "/api/hmi/context") {
      sendJson(response, 200, { context: store.getContext() });
      return;
    }

    if (request.method === "GET" && requestUrl.pathname === "/api/hmi/commands") {
      const afterId = Number.parseInt(requestUrl.searchParams.get("afterId") ?? "0", 10);
      sendJson(response, 200, { commands: store.getCommands(afterId) });
      return;
    }

    if (request.method === "GET" && requestUrl.pathname === "/api/hmi/command-history") {
      const limit = Number.parseInt(requestUrl.searchParams.get("limit") ?? "50", 10);
      const commands = await listButtonCommands(Number.isFinite(limit) ? limit : 50);
      sendJson(response, 200, { commands });
      return;
    }

    if (request.method === "GET" && requestUrl.pathname === "/api/hmi/statuses") {
      const statuses = await listMachineStatuses();
      sendJson(response, 200, { statuses });
      return;
    }

    if (request.method === "GET" && requestUrl.pathname === "/api/hmi/control-state") {
      sendJson(response, 200, { controlState: store.getControlSnapshot() });
      return;
    }

    if (request.method === "POST" && requestUrl.pathname === "/api/hmi/python-update") {
      const payload = await readJsonBody(request);
      const state = store.applyPythonUpdate(payload);
      await upsertMachineStatuses(buildStatusesFromSnapshot(state));
      sendJson(response, 200, { ok: true, state });
      return;
    }

    if (request.method === "POST" && requestUrl.pathname === "/api/hmi/active-page") {
      const payload = await readJsonBody(request);
      const state = store.setActivePage(payload.page);
      sendJson(response, 200, { ok: true, state });
      return;
    }

    if (request.method === "POST" && requestUrl.pathname === "/api/hmi/command") {
      const payload = await readJsonBody(request);
      const action = store.resolveUiAction(payload.actionId);
      const requestedAt = new Date().toISOString();
      const persistedCommand = await createButtonCommand({
        actionId: action.id,
        label: action.label,
        requestedAt,
      });
      const command = store.createUiCommand(payload.actionId, {
        requestedAt,
        persistedCommandId: persistedCommand.id,
      });
      await upsertMachineStatuses(buildStatusesFromSnapshot(store.getSnapshot()));
      sendJson(response, 200, { ok: true, command });
      return;
    }

    sendJson(response, 404, { error: "Route not found" });
  } catch (error) {
    sendJson(response, 400, { error: error.message });
  }
});

// WebSocket server piggybacks on the same HTTP server.
const wss = new WebSocketServer({ noServer: true });

// Tracks how many frontend clients are currently connected over WebSocket.
function countConnectedClients() {
  return [...wss.clients].filter((client) => client.readyState === OPEN_SOCKET).length;
}

wss.on("connection", (socket) => {
  // Send the latest snapshot immediately so a new UI can render without waiting.
  socket.send(
    JSON.stringify({
      type: "state:init",
      state: store.getSnapshot(),
    }),
  );

  socket.on("close", () => {
    // Keep the dashboard meta in sync when browser tabs disconnect.
    store.setUiClientCount(countConnectedClients());
  });

  store.setUiClientCount(countConnectedClients());
});

// Every store change is pushed to all connected frontend clients in real time.
store.subscribe(({ reason, snapshot }) => {
  const payload = JSON.stringify({
    type: "state:update",
    reason,
    state: snapshot,
  });

  for (const client of wss.clients) {
    if (client.readyState === OPEN_SOCKET) {
      client.send(payload);
    }
  }
});

// Upgrades only the /ws route into a WebSocket connection.
server.on("upgrade", (request, socket, head) => {
  const requestUrl = new URL(request.url ?? "/", `http://${request.headers.host}`);

  if (requestUrl.pathname !== "/ws") {
    socket.destroy();
    return;
  }

  wss.handleUpgrade(request, socket, head, (client) => {
    wss.emit("connection", client, request);
  });
});

// Marks the Python bridge offline if updates stop arriving for too long.
setInterval(() => {
  store.refreshPythonBridgeStatus();
}, 1000);

await syncDatabase();

// Starts the backend server.
server.listen(PORT, () => {
  console.log(`HMI backend listening on http://localhost:${PORT}`);
});
