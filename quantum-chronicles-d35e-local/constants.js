// RNK-Quantum D35E System Constants - Quantum State Core
// Innovative: Constants exist in superposition, resolved on-demand via quantum entanglement

const QUANTUM_ENTANGLEMENT = {
  SYSTEM_ID: "rnk-quantum-d35e",
  SYSTEM_NAME: "RNK-Quantum D35E",
  VERSION: "1.0.0"
};

const VORTEX_TEMPLATES = {
  ACTORS: {
    CHARACTER: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/templates/actors/character-sheet.hbs`,
    NPC: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/templates/actors/npc-sheet.hbs`,
    LIMITED: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/templates/actors/limited-sheet.hbs`
  },
  ITEMS: {
    WEAPON: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/templates/items/weapon-sheet.hbs`,
    ARMOR: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/templates/items/armor-sheet.hbs`,
    EQUIPMENT: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/templates/items/equipment-sheet.hbs`,
    SPELL: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/templates/items/spell-sheet.hbs`
  },
  CHAT: {
    ATTACK: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/templates/chat/attack-card.hbs`,
    DAMAGE: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/templates/chat/damage-card.hbs`
  }
};

const NEXUS_SETTINGS = {
  DEBUG_MODE: "debugMode",
  SYSTEM_VERSION: "systemVersion"
};

const FRACTAL_ASSETS = {
  ICONS: {
    SPELLS: {
      DARK: {
        DARK_6: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/icons/SpellIconsVolume_1_Free/Dark/Dark_6.png`,
        DARK_7: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/icons/SpellIconsVolume_1_Free/Dark/Dark_7.png`,
        DARK_8: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/icons/SpellIconsVolume_1_Free/Dark/Dark_8.png`,
        DARK_9: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/icons/SpellIconsVolume_1_Free/Dark/Dark_9.png`,
        DARK_10: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/icons/SpellIconsVolume_1_Free/Dark/Dark_10.png`,
        DARK_11: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/icons/SpellIconsVolume_1_Free/Dark/Dark_11.png`,
        DARK_12: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/icons/SpellIconsVolume_1_Free/Dark/Dark_12.png`,
        DARK_13: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/icons/SpellIconsVolume_1_Free/Dark/Dark_13.png`,
        DARK_14: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/icons/SpellIconsVolume_1_Free/Dark/Dark_14.png`,
        DARK_15: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/icons/SpellIconsVolume_1_Free/Dark/Dark_15.png`
      },
      FIRE: {
        FIRE_5: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/icons/SpellIconsVolume_1_Free/Fire/Fire_5.png`,
        FIRE_7: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/icons/SpellIconsVolume_1_Free/Fire/Fire_7.png`,
        FIRE_8: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/icons/SpellIconsVolume_1_Free/Fire/Fire_8.png`,
        FIRE_9: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/icons/SpellIconsVolume_1_Free/Fire/Fire_9.png`,
        FIRE_10: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/icons/SpellIconsVolume_1_Free/Fire/Fire_10.png`,
        FIRE_11: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/icons/SpellIconsVolume_1_Free/Fire/Fire_11.png`,
        FIRE_12: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/icons/SpellIconsVolume_1_Free/Fire/Fire_12.png`,
        FIRE_13: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/icons/SpellIconsVolume_1_Free/Fire/Fire_13.png`,
        FIRE_14: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/icons/SpellIconsVolume_1_Free/Fire/Fire_14.png`,
        FIRE_28: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/icons/SpellIconsVolume_1_Free/Fire/Fire_28.png`
      },
      HOLY: {
        HOLY_5: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/icons/SpellIconsVolume_1_Free/Holy/Holy_5.png`,
        HOLY_6: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/icons/SpellIconsVolume_1_Free/Holy/Holy_6.png`,
        HOLY_7: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/icons/SpellIconsVolume_1_Free/Holy/Holy_7.png`,
        HOLY_8: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/icons/SpellIconsVolume_1_Free/Holy/Holy_8.png`,
        HOLY_9: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/icons/SpellIconsVolume_1_Free/Holy/Holy_9.png`,
        HOLY_10: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/icons/SpellIconsVolume_1_Free/Holy/Holy_10.png`,
        HOLY_11: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/icons/SpellIconsVolume_1_Free/Holy/Holy_11.png`,
        HOLY_12: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/icons/SpellIconsVolume_1_Free/Holy/Holy_12.png`,
        HOLY_13: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/icons/SpellIconsVolume_1_Free/Holy/Holy_13.png`,
        HOLY_14: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/icons/SpellIconsVolume_1_Free/Holy/Holy_14.png`
      },
      NATURE: {
        NATURE_2: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/icons/SpellIconsVolume_1_Free/Nature/Nature_2.png`,
        NATURE_4: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/icons/SpellIconsVolume_1_Free/Nature/Nature_4.png`,
        NATURE_6: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/icons/SpellIconsVolume_1_Free/Nature/Nature_6.png`,
        NATURE_7: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/icons/SpellIconsVolume_1_Free/Nature/Nature_7.png`,
        NATURE_8: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/icons/SpellIconsVolume_1_Free/Nature/Nature_8.png`,
        NATURE_9: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/icons/SpellIconsVolume_1_Free/Nature/Nature_9.png`,
        NATURE_10: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/icons/SpellIconsVolume_1_Free/Nature/Nature_10.png`,
        NATURE_11: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/icons/SpellIconsVolume_1_Free/Nature/Nature_11.png`,
        NATURE_12: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/icons/SpellIconsVolume_1_Free/Nature/Nature_12.png`,
        NATURE_13: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/icons/SpellIconsVolume_1_Free/Nature/Nature_13.png`
      }
    },
    ENEMIES: {
      B_1: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/icons/30_Enemy_graphic/enemy/B_1.png`,
      B_2: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/icons/30_Enemy_graphic/enemy/B_2.png`,
      B_3: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/icons/30_Enemy_graphic/enemy/B_3.png`,
      B_4: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/icons/30_Enemy_graphic/enemy/B_4.png`,
      B_5: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/icons/30_Enemy_graphic/enemy/B_5.png`,
      B_6: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/icons/30_Enemy_graphic/enemy/B_6.png`,
      B_7: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/icons/30_Enemy_graphic/enemy/B_7.png`,
      B_8: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/icons/30_Enemy_graphic/enemy/B_8.png`,
      B_9: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/icons/30_Enemy_graphic/enemy/B_9.png`,
      B_10: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/icons/30_Enemy_graphic/enemy/B_10.png`,
      B_11: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/icons/30_Enemy_graphic/enemy/B_11.png`,
      B_12: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/icons/30_Enemy_graphic/enemy/B_12.png`,
      B_13: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/icons/30_Enemy_graphic/enemy/B_13.png`,
      B_14: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/icons/30_Enemy_graphic/enemy/B_14.png`,
      B_15: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/icons/30_Enemy_graphic/enemy/B_15.png`,
      B_16: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/icons/30_Enemy_graphic/enemy/B_16.png`,
      B_17: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/icons/30_Enemy_graphic/enemy/B_17.png`,
      B_18: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/icons/30_Enemy_graphic/enemy/B_18.png`,
      B_19: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/icons/30_Enemy_graphic/enemy/B_19.png`,
      B_20: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/icons/30_Enemy_graphic/enemy/B_20.png`,
      B_21: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/icons/30_Enemy_graphic/enemy/B_21.png`,
      B_22: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/icons/30_Enemy_graphic/enemy/B_22.png`,
      B_23: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/icons/30_Enemy_graphic/enemy/B_23.png`,
      B_24: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/icons/30_Enemy_graphic/enemy/B_24.png`,
      B_25: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/icons/30_Enemy_graphic/enemy/B_25.png`,
      B_26: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/icons/30_Enemy_graphic/enemy/B_26.png`,
      B_27: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/icons/30_Enemy_graphic/enemy/B_27.png`,
      B_28: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/icons/30_Enemy_graphic/enemy/B_28.png`,
      B_29: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/icons/30_Enemy_graphic/enemy/B_29.png`,
      B_30: `systems/${QUANTUM_ENTANGLEMENT.SYSTEM_ID}/icons/30_Enemy_graphic/enemy/B_30.png`
    }
  }
};

// Export via quantum resolution
export const CONSTANTS = {
  ...QUANTUM_ENTANGLEMENT,
  TEMPLATES: VORTEX_TEMPLATES,
  SETTINGS: NEXUS_SETTINGS,
  ASSETS: FRACTAL_ASSETS
};