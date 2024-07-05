//@ts-check

import "dotenv/config";
import express from "express";
import cron from "node-cron";
import webPush from "web-push";
import { kv } from "@vercel/kv";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { getPeriodosEscolares, isCurrentYearOut } from "./helpers.js";

if (
  !process.env.EMAIL ||
  !process.env.PUBLIC_KEY ||
  !process.env.PRIVATE_KEY ||
  !process.env.PORT ||
  !process.env.WEBSITE ||
  !process.env.CRON_JOB_PATTERN
) {
  throw new Error("Todas las variables de entorno son necesarias");
}

const app = express();

app.set("view engine", "ejs");
app.use(express.json());
app.use(
  express.static(join(dirname(fileURLToPath(import.meta.url)), "public"))
);

webPush.setVapidDetails(
  `mailto:${process.env.EMAIL}`,
  process.env.PUBLIC_KEY,
  process.env.PRIVATE_KEY
);

app.get("/", async (req, res) => {
  try {
    const { isOut, year } = await isCurrentYearOut();
    const users = (await kv.get("subscriptions")) || [];

    res.render("index", {
      isOut,
      year,
      publicKey: process.env.PUBLIC_KEY,
      users: users.length,
    });
  } catch (error) {
    res
      .status(500)
      .send("Hubo en error de nuestro lado, favor intentarlo más tarde");
  }
});

app.get("/api/periodos", async (req, res) => {
  try {
    const periodos = await getPeriodosEscolares();
    res.json(periodos);
  } catch (error) {
    res.send(500).json({
      msg: "Error al llamar la API",
    });
  }
});

app.post("/api/subscribe", async (req, res) => {
  const subscription = req.body;
  const kvSubs = (await kv.get("subscriptions")) || [];
  const subscriptions = JSON.parse(JSON.stringify(kvSubs));
  subscriptions.push(subscription);
  await kv.set("subscriptions", JSON.stringify(subscriptions));
  res.status(201).json({
    data: "Te has suscrito correctamente",
  });
});

async function sendNotifications(payload) {
  const promises = [];
  let subscriptions = await kv.get("subscriptions");
  if (subscriptions) {
    subscriptions.forEach((subscription) => {
      promises.push(
        webPush.sendNotification(subscription, JSON.stringify(payload))
      );
    });

    Promise.allSettled(promises)
      .then(() => console.log("All users notificated"))
      .catch((err) => {
        console.error("Error sending notification:", err);
      });
  }
}

const cronJob = cron.schedule(process.env.CRON_JOB_PATTERN, async () => {
  try {
    const { isOut, year } = await isCurrentYearOut();
    const notificationPayload = {
      notification: {
        title: "Revisa tus resultados de las pruebas nacionales",
        body: `Los resultados de las pruebsa nacionales (${year}) han sido publicados`,
        data: { url: process.env.WEBSITE },
      },
    };

    console.log(`Checking... ¿Salió? ${isOut}`);

    if (isOut) {
      await sendNotifications(notificationPayload);
    }
  } catch (error) {
    console.log("Error en el cronjob");
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
  cronJob.start();
  console.log("CronJob started");
});
