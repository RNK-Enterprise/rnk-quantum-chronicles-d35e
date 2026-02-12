// RNK-Quantum D35E System - Vortex Integration
// Innovative: Main system file assembling all vortex components

import { CONSTANTS } from "./constants.js";
import { D35E } from "./module/config.js";
import { TriggerNexus, nexus } from "./nexus.js";
import { VortexLoader, vortexLoader } from "./loader.js";

import { ActorPF } from "./module/actor/entity.js";
import { ActorSheetPFCharacter } from "./module/actor/sheets/character.js";
import { ActorSheetPFNPC } from "./module/actor/sheets/npc.js";
import { ActorSheetPF } from "./module/actor/sheets/base.js";

import { ItemPF } from "./module/item/entity.js";
import { ItemSheetPF } from "./module/item/sheets/base.js";

import { CombatPF } from "./module/combat.js";
import { DicePF } from "./module/dice.js";

import { SpellEffects } from "./module/spell-effects.js";
import { MetamagicFeats } from "./module/metamagic.js";
import { SpellFocus } from "./module/spell-focus.js";

import { FeatsSystem } from "./module/feats.js";
import { TreasureGenerator } from "./module/treasure-generator.js";
import { NPCGenerator } from "./module/npc-generator.js";

import { registerSystemSettings, SYSTEM_ID } from "./module/settings.js";
import { preloadHandlebarsTemplates } from "./module/templates.js";

Hooks.once("init", async function() {
  console.log(`Quantum Chronicles | Initializing RNK-Quantum D35E System`);

  // Register system settings and configuration menu
  registerSystemSettings();

  // DunGen compatibility: catch DunGen errors without wrapping global DOM methods
  window.addEventListener('error', (event) => {
    const stack = event.error?.stack || '';
    const msg = event.error?.message || '';
    if (stack.includes('dungen') || stack.includes('DunGen') ||
        (msg.includes("Cannot read properties of null") && (stack.includes('bundle.min') || msg.includes('setAttribute')))) {
      event.preventDefault();
      return true;
    }
  }, true);

  window.addEventListener('unhandledrejection', (event) => {
    const stack = event.reason?.stack || '';
    const msg = event.reason?.message || '';
    if (stack.includes('dungen') || stack.includes('DunGen') ||
        (msg.includes("Cannot read properties of null") && (stack.includes('bundle.min') || msg.includes('setAttribute')))) {
      event.preventDefault();
    }
  });

  // Modern V13 Error Interception Hook
  Hooks.on("onError", (err, info) => {
    const msg = err?.message || info?.msg || "";
    const stack = err?.stack || info?.stack || "";
    if (stack.includes('dungen') || stack.includes('DunGen') || (msg.includes("setAttribute") && msg.includes("null"))) {
      console.debug("Quantum Chronicles | Absorbed DunGen/V13 Settings error:", msg);
      return false; 
    }
  });

  // Vortex load core components
  game[SYSTEM_ID] = {
    ActorPF,
    DicePF,
    ItemPF,
    CombatPF,
    SpellEffects,
    MetamagicFeats,
    SpellFocus,
    FeatsSystem,
    TreasureGenerator,
    NPCGenerator,
    rollItemMacro: () => {},
    rollDefenses: () => {},
    rollTurnUndead: () => {},
    migrateWorld: () => {},
    createdMeasureTemplates: new Set()
  };

  // Record Configuration Values
  CONFIG.D35E = D35E;

  // Register document classes - THIS IS CRITICAL for prepareBaseData/prepareDerivedData to run
  CONFIG.Actor.documentClass = ActorPF;
  CONFIG.Item.documentClass = ItemPF;

  // Preload templates
  preloadHandlebarsTemplates();

  // Register sheet applications
  foundry.documents.collections.Actors.registerSheet(SYSTEM_ID, ActorSheetPFCharacter, {
    types: ["character"],
    makeDefault: true,
    label: "Quantum Character Sheet"
  });

  foundry.documents.collections.Actors.registerSheet(SYSTEM_ID, ActorSheetPFNPC, {
    types: ["npc"],
    makeDefault: true,
    label: "Quantum NPC Sheet"
  });

  foundry.documents.collections.Items.registerSheet(SYSTEM_ID, ItemSheetPF, {
    makeDefault: true,
    label: "Quantum Item Sheet"
  });

  // Register combat
  CONFIG.Combat.documentClass = CombatPF;

  // Register Handlebars helpers
  Handlebars.registerHelper("formatModifier", function(value) {
    const mod = Number(value) || 0;
    const prefix = mod >= 0 ? "+" : "";
    return `${prefix}${mod}`;
  });

  Handlebars.registerHelper("capitalize", function(str) {
    if (typeof str !== "string") return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  });

  Handlebars.registerHelper("skillLabel", function(key) {
    const skill = D35E.skills[key];
    if (skill && skill.label) return game.i18n.localize(skill.label);
    
    // Fallback to abbreviations if label is missing
    const labels = {
      appraise: "D35E.SkillApr",
      balance: "D35E.SkillBlc",
      bluff: "D35E.SkillBlf",
      climb: "D35E.SkillClm",
      concentration: "D35E.SkillCon",
      coc: "D35E.SkillCoc",
      craft: "D35E.SkillCrt",
      decipherScript: "D35E.SkillDec",
      diplomacy: "D35E.SkillDip",
      disableDevice: "D35E.SkillDsb",
      disguise: "D35E.SkillDsg",
      escapeArtist: "D35E.SkillEsc",
      forgery: "D35E.SkillFrg",
      gatherInformation: "D35E.SkillGth",
      handleAnimal: "D35E.SkillHnd",
      heal: "D35E.SkillHeal",
      hide: "D35E.SkillHide",
      intimidate: "D35E.SkillInt",
      jump: "D35E.SkillJmp",
      knowledge: "D35E.SkillKno",
      listen: "D35E.SkillLis",
      moveSilently: "D35E.SkillMov",
      openLock: "D35E.SkillOpn",
      perform: "D35E.SkillPrf",
      profession: "D35E.SkillPro",
      ride: "D35E.SkillRid",
      search: "D35E.SkillSch",
      senseMotive: "D35E.SkillSen",
      sleightOfHand: "D35E.SkillSht",
      spellcraft: "D35E.SkillSpl",
      spot: "D35E.SkillSpot",
      survival: "D35E.SkillSrv",
      swim: "D35E.SkillSwm",
      tumble: "D35E.SkillTum",
      useMagicDevice: "D35E.SkillUmd",
      useRope: "D35E.SkillUse"
    };
    return game.i18n.localize(labels[key] || key);
  });

  Handlebars.registerHelper("eq", function(a, b) {
    return a === b;
  });

  Handlebars.registerHelper("multiply", function(a, b) {
    return parseFloat(a) * parseFloat(b);
  });

  Handlebars.registerHelper("optionList", function(category) {
    const source = {
      race: D35E.races,
      class: D35E.classes
    }[category];
    if (!source) return "";
    const escape = Handlebars.Utils.escapeExpression;
    const options = Object.entries(source)
      .map(([key, label]) => `<option value="${escape(label)}">`)
      .join("");
    return new Handlebars.SafeString(options);
  });

  // Initialize vortex
  vortexLoader.loadModule('./nexus.js');
  
  // Suppress renderChatMessage deprecation warning from dnd5e compat layer
  // This warning comes from foundry.mjs and is not actionable for D35E
  const originalWarn = console.warn;
  const suppressed = new Set();
  console.warn = function(...args) {
    const message = args[0]?.toString() || '';
    if (message.includes('renderChatMessage hook is deprecated')) {
      return; // Silently suppress this specific warning
    }
    return originalWarn.apply(console, args);
  };
});

/**
 * Settings page hook - V13 CategoryBrowser handles layout natively.
 * Only add compatibility shims for legacy modules that query old DOM structures.
 */
Hooks.on("renderSettingsConfig", (app, html) => {
  const element = html instanceof HTMLElement ? html : html[0];
  if (!element) return;

  // Compatibility shim for legacy modules (like DunGen) that expect V10/V11 tab structures
  const main = element.querySelector('[data-application-part="main"]') || element.querySelector('.main');
  if (main && !main.querySelector(".tabs")) {
    const phantomTabs = document.createElement("nav");
    phantomTabs.className = "tabs";
    phantomTabs.style.display = "none";
    phantomTabs.setAttribute("data-group", "sections");
    main.appendChild(phantomTabs);
  }
});

Hooks.on("ready", () => {
  console.log("Quantum Chronicles | System Ready");
  nexus.fireTrigger('systemReady', {});

  console.log("Quantum Chronicles | System initialization complete");
});