import db from "./db.js";

export async function createButtonCommand({ actionId, label, requestedAt }) {
  return db.buttonCommand.create({
    actionId,
    label,
    requestedAt: new Date(requestedAt),
  });
}

export async function listButtonCommands(limit = 50) {
  return db.buttonCommand.findAll({
    order: [["requestedAt", "DESC"]],
    limit,
  });
}
