import { useEffect, useRef, useState } from "react";
import { createFallbackDashboardState, HMI_PAGES } from "../data/mockData";

// HTTP base URL for fetching the current HMI snapshot and sending commands.
const HTTP_BASE_URL =
  import.meta.env.VITE_HMI_HTTP_URL ??
  `${window.location.protocol}//${window.location.hostname}:4000`;

// WebSocket URL used for live push updates from the backend.
const WS_URL =
  import.meta.env.VITE_HMI_WS_URL ??
  `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.hostname}:4000/ws`;

const SNAPSHOT_URL = new URL("/api/hmi/state", HTTP_BASE_URL).toString();
const ACTIVE_PAGE_URL = new URL("/api/hmi/active-page", HTTP_BASE_URL).toString();
const COMMAND_URL = new URL("/api/hmi/command", HTTP_BASE_URL).toString();

// Loads the latest full dashboard state before live socket updates begin.
async function fetchSnapshot() {
  const response = await fetch(SNAPSHOT_URL);

  if (!response.ok) {
    throw new Error(`Snapshot request failed with status ${response.status}`);
  }

  return response.json();
}

// Sends a footer button click to the backend so Python can react to it.
async function postCommand(actionId) {
  const response = await fetch(COMMAND_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ actionId }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error ?? `Command request failed with status ${response.status}`);
  }

  return payload;
}

function mapTabToPageKey(activeTab) {
  return activeTab === "Methanol Reformer" ? HMI_PAGES.methanolReformer : HMI_PAGES.fuelCell;
}

async function postActivePage(page) {
  const response = await fetch(ACTIVE_PAGE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ page }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error ?? `Active page request failed with status ${response.status}`);
  }

  return payload;
}

export default function useHmiDashboard(activeTab) {
  // Fallback state keeps the UI render-safe even before the backend responds.
  const [dashboardState, setDashboardState] = useState(() => createFallbackDashboardState());
  const [transportConnected, setTransportConnected] = useState(false);
  const [pendingActionId, setPendingActionId] = useState(null);
  const [lastError, setLastError] = useState(null);
  // These refs keep the current socket and reconnect timer across renders.
  const reconnectTimerRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    // Prevents multiple reconnect timers from stacking up.
    const clearReconnectTimer = () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    };

    // First fetch gives the UI an immediate state before websocket events arrive.
    const loadInitialSnapshot = async () => {
      try {
        const payload = await fetchSnapshot();

        if (isMounted && payload.state) {
          setDashboardState(payload.state);
          setLastError(null);
        }
      } catch (error) {
        if (isMounted) {
          setLastError(error.message);
        }
      }
    };

    // Opens the websocket and keeps local UI state in sync with backend pushes.
    const connect = () => {
      clearReconnectTimer();

      const socket = new WebSocket(WS_URL);
      socketRef.current = socket;

      socket.addEventListener("open", () => {
        if (!isMounted) {
          return;
        }

        setTransportConnected(true);
        setLastError(null);
      });

      // Both first-load and live updates come through the same state payload shape.
      socket.addEventListener("message", (event) => {
        if (!isMounted) {
          return;
        }

        try {
          const payload = JSON.parse(event.data);

          if ((payload.type === "state:init" || payload.type === "state:update") && payload.state) {
            setDashboardState(payload.state);
            setLastError(null);
          }
        } catch (error) {
          setLastError(error.message);
        }
      });

      // Auto-reconnect makes the dashboard recover after backend restarts.
      socket.addEventListener("close", () => {
        if (!isMounted) {
          return;
        }

        setTransportConnected(false);
        reconnectTimerRef.current = setTimeout(connect, 1500);
      });

      // Socket errors are handled by closing and reusing the reconnect path above.
      socket.addEventListener("error", () => {
        socket.close();
      });
    };

    loadInitialSnapshot();
    connect();

    return () => {
      isMounted = false;
      clearReconnectTimer();

      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    const syncActivePage = async () => {
      try {
        await postActivePage(mapTabToPageKey(activeTab));

        if (!ignore) {
          setLastError(null);
        }
      } catch (error) {
        if (!ignore) {
          setLastError(error.message);
        }
      }
    };

    syncActivePage();

    return () => {
      ignore = true;
    };
  }, [activeTab]);

  // Wraps footer actions so the UI can show loading and surface backend errors.
  const sendCommand = async (actionId) => {
    setPendingActionId(actionId);

    try {
      await postCommand(actionId);
      setLastError(null);
    } catch (error) {
      setLastError(error.message);
    } finally {
      setPendingActionId(null);
    }
  };

  return {
    dashboardState,
    transportConnected,
    pendingActionId,
    lastError,
    sendCommand,
  };
}
