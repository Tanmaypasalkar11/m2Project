import "dotenv/config";
import { Sequelize, DataTypes } from "sequelize";
import buttonCommandModel from "./models/buttonCommandModel.js";
import machineStatusModel from "./models/machineStatusModel.js";

const timezone = process.env.DB_TIMEZONE ?? "+05:30";
const databaseUrl = process.env.DATABASE_URL;

function createDialectOptions() {
  const dialectOptions = {
    timezone: process.env.DB_DIALECT_TIMEZONE ?? "Asia/Kolkata",
  };

  if (process.env.DB_SSL === "true") {
    dialectOptions.ssl = {
      require: true,
      rejectUnauthorized: false,
    };
  }

  return dialectOptions;
}

const sequelize = databaseUrl
  ? new Sequelize(databaseUrl, {
      dialect: "postgres",
      timezone,
      dialectOptions: createDialectOptions(),
      pool: { max: 20, min: 0, idle: 10000 },
      logging: false,
    })
  : new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST ?? "localhost",
        port: Number.parseInt(process.env.DB_PORT ?? "5432", 10),
        dialect: "postgres",
        timezone,
        dialectOptions: createDialectOptions(),
        pool: { max: 20, min: 0, idle: 10000 },
        logging: false,
      },
    );

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.buttonCommand = buttonCommandModel(sequelize, DataTypes);
db.machineStatus = machineStatusModel(sequelize, DataTypes);

export async function syncDatabase() {
  try {
    await db.sequelize.sync({ force: false });
    console.log("Synced db.");
  } catch (error) {
    console.log(`Failed to sync db: ${error.message}`);
    throw error;
  }
}

export default db;
