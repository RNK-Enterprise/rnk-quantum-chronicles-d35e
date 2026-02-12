// RNK-Quantum D35E Actor Entity
// Core actor class with D&D 3.5e calculation pipeline

import { D35E, getAbilityModifier } from "../config.js";
import { SpellSlotManager } from "../spells.js";
import { ConditionUIManager } from "../conditions-ui.js";
import { CurrencyManager, EncumbranceCalculator, WealthManager } from "../currency.js";
import { CharacterCreationHelper } from "../character-creation.js";

export class ActorPF extends Actor {
  constructor(...args) {
    super(...args);
    this._runningFunctions = {};
    this._cachedRollData = this.getRollData();
    this._cachedAuras = this.items.filter(o => o.type === "aura" && o.system.active);
    this._currentLevel = 1;
    
    // Initialize modern systems
    this._spellSlots = new SpellSlotManager(this);
    this._conditions = new ConditionUIManager(this);
    this._currency = new CurrencyManager(this);
    this._encumbrance = new EncumbranceCalculator(this);
    this._wealth = new WealthManager(this);
    this._characterCreation = new CharacterCreationHelper(this);
  }

  /**
   * Getters for easy access to major systems
   */
  get spellSlots() { return this._spellSlots; }
  get conditions() { return this._conditions; }
  get currency() { return this._currency; }
  get encumbrance() { return this._encumbrance; }
  get wealth() { return this._wealth; }
  get characterCreation() { return this._characterCreation; }

  /* -------------------------------------------- */
  /*  Data Preparation                            */
  /* -------------------------------------------- */

  prepareBaseData() {
    super.prepareBaseData();
    const s = this.system;

    // Details defaults
    s.details = s.details || {};
    s.details.race = s.details.race || "";
    s.details.class = s.details.class || "";
    
    // Robust level check - Ensure it's an object, not a number (fix for "Cannot create property 'value' on number")
    if (typeof s.details.level !== "object" || s.details.level === null) {
      s.details.level = { value: Number(s.details.level) || 1 };
    }
    s.details.level.value = Math.max(1, Math.floor(Number(s.details.level.value) || 1));
    this._currentLevel = s.details.level.value;

    // Abilities defaults
    if (!s.abilities || typeof s.abilities !== "object") {
      s.abilities = {};
    }
    for (const key of Object.keys(D35E.abilities)) {
      if (!s.abilities[key] || typeof s.abilities[key] !== "object") {
        s.abilities[key] = { value: 10, mod: 0, temp: 0, bonus: 0 };
      }
      const ab = s.abilities[key];
      ab.value = Number(ab.value) || 10;
      ab.temp = Number(ab.temp) || 0;
      ab.bonus = 0;
    }

    // Attributes defaults
    s.attributes = s.attributes || {};
    s.attributes.bab = Number(s.attributes.bab) || 0;
    
    if (typeof s.attributes.ac !== "object" || s.attributes.ac === null) {
      s.attributes.ac = { normal: 10, touch: 10, flatFooted: 10, misc: 0, bonus: 0 };
    }
    s.attributes.ac.misc = Number(s.attributes.ac.misc) || 0;
    s.attributes.ac.bonus = 0;
    s.attributes.acp = Number(s.attributes.acp) || 0;

    if (typeof s.attributes.hp !== "object" || s.attributes.hp === null) {
      s.attributes.hp = { value: 0, max: 0, temp: 0, tempmax: 0 };
    }

    if (typeof s.attributes.init !== "object" || s.attributes.init === null) {
      s.attributes.init = { value: 0, total: 0, misc: 0, bonus: 0 };
    }
    s.attributes.init.misc = Number(s.attributes.init.misc) || 0;
    s.attributes.init.bonus = 0;

    // Attack & Damage defaults
    s.attributes.attack = s.attributes.attack || { bonus: 0 };
    s.attributes.damage = s.attributes.damage || { bonus: 0 };
    s.attributes.attack.bonus = 0;
    s.attributes.damage.bonus = 0;

    s.attributes.speed = s.attributes.speed || { land: 30, fly: 0, swim: 0, climb: 0, burrow: 0 };

    // Saves defaults
    s.attributes.saves = s.attributes.saves || {};
    for (const key of Object.keys(D35E.savingThrows)) {
      if (!s.attributes.saves[key] || typeof s.attributes.saves[key] !== "object") {
        s.attributes.saves[key] = { base: 0, misc: 0, magic: 0, temp: 0, total: 0, bonus: 0 };
      }
      const sv = s.attributes.saves[key];
      sv.base = Number(sv.base) || 0;
      sv.misc = Number(sv.misc) || 0;
      sv.bonus = 0;
    }

    // Skills defaults
    if (!s.skills || typeof s.skills !== "object") {
      s.skills = {};
    }
    for (const [key, cfg] of Object.entries(D35E.skills)) {
      if (!s.skills[key] || typeof s.skills[key] !== "object") {
        s.skills[key] = { rank: 0, mod: 0, misc: 0, cs: false, ability: cfg.ability, acp: cfg.armorCheck || false };
      }
      const sk = s.skills[key];
      sk.rank = Number(sk.rank) || 0;
      sk.misc = Number(sk.misc) || 0;
      sk.bonus = 0;
      sk.ability = sk.ability || cfg.ability;
    }

    // Traits defaults
    s.traits = s.traits || {};
    s.traits.size = s.traits.size || "medium";
  }

  prepareDerivedData() {
    super.prepareDerivedData();
    const s = this.system;

    // 0. Apply item changes
    this._applyItemChanges(s);

    // 1. Calculate ability modifiers
    for (const key of Object.keys(D35E.abilities)) {
      const ab = s.abilities[key];
      const total = (ab.value || 10) + (ab.temp || 0) + (ab.bonus || 0);
      ab.mod = getAbilityModifier(total);
      ab.total = total;
    }

    // 2. Initiative
    const dexMod = s.abilities.dex.mod;
    s.attributes.init.total = dexMod + (s.attributes.init.misc || 0) + (s.attributes.init.bonus || 0);
    s.attributes.init.value = s.attributes.init.total;

    // 3. BAB (from class hit dice if available, else average progression)
    this._calculateBAB(s);

    // 4. Saving throws
    this._calculateSaves(s);

    // 5. Skills
    this._calculateSkills(s);

    // 6. AC
    this._calculateAC(s);

    // 7. HP
    this._calculateHP(s);
  }

  /* -------------------------------------------- */
  /*  Derived Calculations                        */
  /* -------------------------------------------- */

  _applyItemChanges(s) {
    for (const item of this.items) {
      // feats and buffs are always active if checked
      const isActive = item.system.active || item.system.equipped;
      if (!isActive && item.type !== "buff") continue;

      const changes = item.system.changes || [];
      for (const change of changes) {
        if (!change.target || !change.formula) continue;
        const bonus = parseInt(change.formula) || 0;
        
        // Safety check for target: only allow specific paths to prevent prototype pollution
        const allowedTargets = [
          /^abilities\.[a-z]+\.value$/,
          /^attributes\.saves\.[a-z]+\.misc$/,
          /^attributes\.ac\.misc$/,
          /^attributes\.init\.misc$/,
          /^attributes\.attack\.bonus$/,
          /^attributes\.damage\.bonus$/,
          /^attributes\.bab$/
        ];
        
        // We modify the .bonus equivalent of the target to maintain separation
        let bonusPath = change.target;
        if (bonusPath.startsWith("abilities.")) bonusPath = bonusPath.replace(".value", ".bonus");
        else if (bonusPath.startsWith("attributes.saves.")) bonusPath = bonusPath.replace(".misc", ".bonus");
        else if (bonusPath === "attributes.ac.misc") bonusPath = "attributes.ac.bonus";
        else if (bonusPath === "attributes.init.misc") bonusPath = "attributes.init.bonus";
        else if (bonusPath === "attributes.bab") bonusPath = "attributes.bab_bonus"; // custom field
        // attack and damage bonus are already named .bonus

        const current = foundry.utils.getProperty(s, bonusPath) || 0;
        foundry.utils.setProperty(s, bonusPath, current + bonus);
      }
    }
  }

  _calculateBAB(s) {
    const level = this._currentLevel;
    // Check for class items that define BAB progression
    const classItem = this.items.find(i => i.type === "class");
    const bab = classItem?.system?.bab;

    if (bab === "high" || bab === "good") {
      s.attributes.bab = level; // Full BAB
    } else if (bab === "low" || bab === "poor") {
      s.attributes.bab = Math.floor(level / 2); // 1/2 BAB
    } else {
      // Default: 3/4 BAB (average)
      s.attributes.bab = Math.floor(level * 3 / 4);
    }
    
    // Apply BAB bonus from items/effects
    s.attributes.bab += (s.attributes.bab_bonus || 0);
  }

  _calculateSaves(s) {
    const level = this._currentLevel;
    const classItem = this.items.find(i => i.type === "class");

    for (const [key, abilityKey] of Object.entries(D35E.saveAbilities)) {
      const save = s.attributes.saves[key];
      const abilityMod = s.abilities[abilityKey]?.mod || 0;

      // Determine save progression from class item
      const progression = classItem?.system?.saves?.[key] || "poor";
      let baseSave;
      if (progression === "good" || progression === "high") {
        baseSave = 2 + Math.floor(level / 2);
      } else {
        baseSave = Math.floor(level / 3);
      }

      save.base = baseSave;
      save.ability = abilityMod;
      save.total = baseSave + abilityMod + (save.misc || 0) + (save.magic || 0) + (save.temp || 0) + (save.bonus || 0);
    }
  }

  _calculateSkills(s) {
    const acp = s.attributes.acp || 0;

    for (const [key, sk] of Object.entries(s.skills)) {
      const abilityMod = s.abilities[sk.ability]?.mod || 0;
      let total = abilityMod + (sk.rank || 0) + (sk.misc || 0);

      // Class skill bonus (+3 if trained and class skill)
      if (sk.cs && sk.rank > 0) total += 3;

      // Armor check penalty
      const cfg = D35E.skills[key];
      if ((cfg?.armorCheck || sk.acp) && acp) {
        total += acp; // acp is typically negative
      }

      sk.mod = total;
    }
  }

  _calculateAC(s) {
    const dexMod = s.abilities.dex.mod;
    const sizeMod = D35E.sizeMods[s.traits.size] || 0;
    const armor = this._getArmorValues();
    const dexForAC = (armor.maxDex < Infinity) ? Math.min(dexMod, armor.maxDex) : dexMod;
    const misc = (s.attributes.ac.misc || 0) + (s.attributes.ac.bonus || 0);

    s.attributes.ac.normal = 10 + armor.armorBonus + armor.shieldBonus + dexForAC + sizeMod + misc;
    s.attributes.ac.touch = 10 + dexForAC + sizeMod + misc;
    s.attributes.ac.flatFooted = 10 + armor.armorBonus + armor.shieldBonus + sizeMod + misc;
    s.attributes.acp = armor.acp;
  }

  _calculateHP(s) {
    const level = this._currentLevel;
    const conMod = s.abilities.con.mod;

    // Try to get hit die from a class item
    const classItem = this.items.find(i => i.type === "class");
    const hd = Number(classItem?.system?.hd) || 8; // Default d8

    // Average HP per level: (hd + 1) / 2, first level gets max
    const firstLevel = hd;
    const perLevel = (hd + 1) / 2;
    const baseHP = (level === 1) ? firstLevel : firstLevel + Math.round(perLevel * (level - 1));
    const derived = Math.max(1, baseHP + (conMod * level));

    s.attributes.hp.max = derived;
    // Clamp current HP to max but don't reset if already set
    if (s.attributes.hp.value > derived) {
      s.attributes.hp.value = derived;
    }
    if (s.attributes.hp.value <= 0 && !s.attributes.hp._initialized) {
      s.attributes.hp.value = derived;
      s.attributes.hp._initialized = true;
    }
  }

  _getArmorValues() {
    const result = { armorBonus: 0, shieldBonus: 0, maxDex: Infinity, acp: 0 };
    if (!this.items) return result;

    for (const item of this.items) {
      const d = item.system;
      if (!d?.equipped) continue;

      const isShield = item.type === "shield" || d.equipmentType === "shield";
      const isArmor = item.type === "armor" || d.equipmentType === "armor" || item.type === "equipment";
      if (!isArmor && !isShield) continue;

      const bonus = Number(d.armor?.value ?? d.armor?.bonus ?? d.armorBonus ?? d.bonus ?? 0);
      const shieldVal = Number(d.armor?.shieldBonus ?? d.shieldBonus ?? 0);
      const dexCap = d.armor?.dex ?? d.armor?.maxDex ?? d.maxDex;
      const penalty = Number(d.armor?.acp ?? d.armor?.penalty ?? d.acp ?? 0);

      if (isShield) {
        result.shieldBonus += shieldVal || bonus;
      } else {
        result.armorBonus += bonus;
        if (typeof dexCap === "number") {
          result.maxDex = Math.min(result.maxDex, dexCap);
        }
      }
      result.acp += penalty;
    }

    return result;
  }

  /* -------------------------------------------- */
  /*  Roll Helpers                                */
  /* -------------------------------------------- */

  getRollData() {
    const data = super.getRollData();
    if (this.system.abilities) {
      for (const [key, ab] of Object.entries(this.system.abilities)) {
        data[key] = ab.mod;
        data[`${key}Mod`] = ab.mod;
      }
    }
    if (this.system.attributes) {
      data.attributes = this.system.attributes;
    }
    data.skills = this.system.skills;
    return data;
  }

  get level() {
    return this.system.details?.level?.value || 1;
  }

  async rollAbilityTest(ability) {
    const mod = this.system.abilities[ability]?.mod || 0;
    const label = D35E.abilities[ability] || ability;
    const roll = new Roll("1d20 + @mod", { mod });
    await roll.evaluate();
    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: `${game.i18n.localize(label)} Check`
    });
    return roll;
  }

  async rollSave(saveKey) {
    const save = this.system.attributes.saves[saveKey];
    if (!save) return;
    const label = D35E.savingThrows[saveKey] || saveKey;
    const roll = new Roll("1d20 + @total", { total: save.total });
    await roll.evaluate();
    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: `${game.i18n.localize(label)} Save`
    });
    return roll;
  }

  async rollSkillCheck(skillKey) {
    const skill = this.system.skills[skillKey];
    if (!skill) return;
    const label = D35E.skills[skillKey]?.label || skillKey;
    const roll = new Roll("1d20 + @mod", { mod: skill.mod });
    await roll.evaluate();
    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: `${game.i18n.localize(label)} Check`
    });
    return roll;
  }

  // Alias for compatibility
  async rollSkill(skillKey, options = {}) {
    return this.rollSkillCheck(skillKey);
  }

  async rollBAB(options = {}) {
    const bab = this.system.attributes.bab || 0;
    const roll = new Roll("1d20 + @bab", { bab });
    await roll.evaluate();
    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: `${game.i18n.localize("D35E.BAB")} Check`
    });
    return roll;
  }

  async rollInitiative(options = {}) {
    const total = this.system.attributes.init.total || 0;
    const roll = new Roll("1d20 + @total", { total });
    await roll.evaluate();
    // Use core initiative if possible
    if (typeof super.rollInitiative === 'function') return super.rollInitiative(options);
    
    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: `${game.i18n.localize("D35E.Initiative")} Check`
    });
    return roll;
  }
}
