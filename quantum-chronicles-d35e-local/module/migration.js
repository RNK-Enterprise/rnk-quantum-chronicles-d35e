// RNK-Quantum D35E Migration - Quantum State Transitions
// Innovative: Migration with quantum tunneling for instant updates

export const migrations = {
  migrateWorld: async function() {
    console.log("Quantum Migration: Tunneling world data...");

    // Quantum tunneling: instant migration
    const actors = game.actors.contents;
    const items = game.items.contents;

    for (let actor of actors) {
      await this.migrateActor(actor);
    }

    for (let item of items) {
      await this.migrateItem(item);
    }

    console.log("Quantum Migration Complete");
  },

  migrateActor: async function(actor) {
    // Quantum state transition for actor
    const updateData = {};

    // Example: Update old paths
    if (actor.img && actor.img.includes("systems/D35E/")) {
      updateData.img = actor.img.replace("systems/D35E/", "systems/rnk-quantum-d35e/");
    }

    if (!isObjectEmpty(updateData)) {
      await actor.update(updateData);
    }
  },

  migrateItem: async function(item) {
    // Similar for items
    const updateData = {};

    if (item.img && item.img.includes("systems/D35E/")) {
      updateData.img = item.img.replace("systems/D35E/", "systems/rnk-quantum-d35e/");
    }

    if (!isObjectEmpty(updateData)) {
      await item.update(updateData);
    }
  }
};

const isObjectEmpty = function(obj) {
  return Object.keys(obj).length === 0;
};