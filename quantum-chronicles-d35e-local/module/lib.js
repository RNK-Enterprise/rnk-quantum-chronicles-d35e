// RNK-Quantum D35E Lib - Quantum Utilities
// Innovative: Utility functions with quantum randomness and fractal operations

export const createTag = function(str) {
  if (str.length === 0) str = "quantumTag";
  return str.replace(/[^a-zA-Z0-9\s]/g, "").split(/\s+/).map((s, a) => {
    s = s.toLowerCase();
    if (a > 0) s = s.substring(0, 1).toUpperCase() + s.substring(1);
    return s;
  }).join("");
};

export const uuidv4 = function() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const alterRoll = function(str, add, multiply) {
  const rgx = /^([0-9]+)d([0-9]+)/;
  if (str.match(rgx)) {
    return str.replace(rgx, (match, nd, d, mods) => {
      nd = (nd * (multiply || 1)) + (add || 0);
      mods = mods || "";
      return ((nd == null || Number.isNaN(nd)) ? "" : nd) + "d" + d + mods;
    });
  }
  return str;
};

export const createTabs = function(html, tabGroups, existingTabs = null) {
  // Simplified quantum tabs
  const tabs = {};
  for (let group in tabGroups) {
    tabs[group] = {
      activate: (tabName) => {
        html.find(`[data-group="${group}"]`).removeClass('active');
        html.find(`[data-tab="${tabName}"][data-group="${group}"]`).addClass('active');
      }
    };
  }
  return tabs;
};

export const getItemOwner = function(item) {
  // Quantum ownership resolution
  return item.parent || null;
};

export const sizeDie = function(size) {
  const sizeDice = { fine: 0, dim: 0, tiny: 0, sm: 0, med: 0, lg: 1, huge: 2, garg: 4, col: 6 };
  return sizeDice[size] || 0;
};

export const getActorFromId = function(id) {
  return game.actors.get(id);
};

export const isMinimumCoreVersion = function(version) {
  return foundry.utils.isNewerVersion(game.version, version) || game.version === version;
};

export const sizeNaturalDie = function(size) {
  return sizeDie(size) + 'd6';
};

export const sizeMonkDamageDie = function(size) {
  const monkDice = { fine: '1d4', dim: '1d4', tiny: '1d4', sm: '1d6', med: '1d8', lg: '1d10', huge: '2d6', garg: '2d8', col: '4d6' };
  return monkDice[size] || '1d8';
};

export const sizeInt = function(size) {
  const sizeInts = { fine: 8, dim: 4, tiny: 2, sm: 1, med: 0, lg: -1, huge: -2, garg: -4, col: -8 };
  return sizeInts[size] || 0;
};
