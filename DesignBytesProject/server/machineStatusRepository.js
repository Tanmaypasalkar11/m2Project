import db from "./db.js";
import { STATUS_KEY_VALUES } from "./models/machineStatusModel.js";

export const STATUS_KEYS = {
  systemPower: "SYSTEM_POWER",
  h2Bypass: "H2_BYPASS",
  serviceMode: "SERVICE_MODE",
};

function normalizeBinaryValue(value) {
  return value ? 1 : 0;
}

export async function upsertMachineStatuses(statuses) {
  const entries = Object.entries(statuses ?? {});

  if (entries.length === 0) {
    return [];
  }

  return Promise.all(
    entries.map(async ([key, value]) => {
      if (!STATUS_KEY_VALUES.includes(key)) {
        throw new Error(`Unsupported status key: ${key}`);
      }

      const normalizedValue = normalizeBinaryValue(value);
      const [record] = await db.machineStatus.findOrCreate({
        where: { key },
        defaults: {
          key,
          value: normalizedValue,
        },
      });

      if (record.value !== normalizedValue) {
        record.value = normalizedValue;
        await record.save();
      }

      return record;
    }),
  );
}

export async function listMachineStatuses() {
  return db.machineStatus.findAll({
    order: [["key", "ASC"]],
  });
}
