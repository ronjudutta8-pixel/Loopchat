import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import webpush from "web-push";
import dotenv from "dotenv";

dotenv.config();

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || "";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "";
let VAPID_EMAIL = process.env.VAPID_EMAIL || "mailto:example@example.com";

if (VAPID_EMAIL && !VAPID_EMAIL.startsWith("mailto:") && !VAPID_EMAIL.startsWith("http")) {
  VAPID_EMAIL = `mailto:${VAPID_EMAIL}`;
}

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  try {
    webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
    console.log("VAPID details set successfully");
  } catch (error) {
    console.error("Failed to set VAPID details:", error);
  }
} else {
  console.warn("\x1b[33m%s\x1b[0m", "PUSH NOTIFICATIONS DISABLED: VAPID_PUBLIC_KEY or VAPID_PRIVATE_KEY is missing in environment variables.");
  console.log("To enable push notifications, generate VAPID keys and add them to your settings:");
  try {
    const keys = webpush.generateVAPIDKeys();
    console.log("Suggested Public Key:", keys.publicKey);
    console.log("Suggested Private Key:", keys.privateKey);
  } catch (e) {
    console.error("Failed to generate suggested VAPID keys:", e);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/vapid-public-key", (req, res) => {
    res.json({ publicKey: VAPID_PUBLIC_KEY });
  });

  app.post("/api/notify-call", async (req, res) => {
    const { subscription, title, body, callId, callerName } = req.body;
    
    if (!subscription) {
      return res.status(400).json({ error: "No subscription provided" });
    }

    const payload = JSON.stringify({
      title: title || "ইনকামিং কল",
      body: body || `${callerName} আপনাকে কল করছেন`,
      data: {
        url: `/?callId=${callId}`,
        callId
      },
      tag: `call-${callId}`,
      renotify: true,
      requireInteraction: true,
      actions: [
        { action: 'answer', title: 'Answer' },
        { action: 'decline', title: 'Decline' }
      ]
    });

    try {
      await webpush.sendNotification(subscription, payload);
      res.json({ success: true });
    } catch (error) {
      console.error("Error sending push:", error);
      res.status(500).json({ error: "Failed to send notification" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
