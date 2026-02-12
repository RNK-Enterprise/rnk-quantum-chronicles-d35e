// RNK-Quantum D35E Item Sheet Base - Version Compatible
// Innovative: Item sheets with fractal data display

import { D35E } from "../../config.js";

// Modern V13 API resolution with robust fallbacks
const api = foundry?.applications?.api;
const sheets = foundry?.applications?.sheets;

// Resolve Base Class - Prefer ApplicationV2 (V13+) then fallback to legacy ItemSheet
const V2Base = api?.ItemSheetV2 || api?.DocumentSheetV2 || api?.ApplicationV2 || sheets?.ItemSheetV2;
const BaseClass = V2Base || globalThis?.ItemSheet || class DefaultItemSheet {};

// Only apply HandlebarsApplicationMixin if we are using a V2 base class
const ItemSheetClass = (V2Base && api?.HandlebarsApplicationMixin) 
  ? api.HandlebarsApplicationMixin(BaseClass) 
  : BaseClass;

export class ItemSheetPF extends ItemSheetClass {

  /** V2 compatibility: this.document is V2, this.item is V1. Bridge both. */
  get item() {
    return this.document;
  }

  static get DEFAULT_OPTIONS() {
    return {
      classes: ["rnk-quantum-d35e", "sheet", "item"],
      window: {
        resizable: true,
        minimizable: true
      },
      position: {
        width: 800,
        height: 720
      }
    };
  }

  // V2 compatibility: Define PARTS for V2 sheets
  static get PARTS() {
    return {
      sheet: {
        tag: "form",
        template: "systems/rnk-quantum-d35e/templates/items/item-sheet.hbs",
        classes: ["item-sheet"]
      }
    };
  }

  get template() {
    const doc = this.document ?? this.object;
    if (doc?.type === "spell") return "systems/rnk-quantum-d35e/templates/items/spell-sheet.hbs";
    return "systems/rnk-quantum-d35e/templates/items/item-sheet.hbs";
  }

  async getData(options = {}) {
    const data = await super.getData(options);
    data.item = this.item;
    data.system = this.item.system;
    data.type = this.item.type;
    data.config = D35E;
    data.fractalTree = this.buildFractalDisplay();
    
    // Ensure activities and effects are available for V1 rendering
    data.activities = this.item.activities || [];
    data.effects = this.item.effects.contents;
    
    return data;
  }

  // V2 compatibility: Prepare context for V2 sheets
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const item = this.document ?? this.object;
    if (!item) return context ?? {};
    context.item = item;
    context.system = item.system;
    context.type = item.type;
    context.config = D35E;
    context.fractalTree = item.fractalRoot ? this.serializeFractal(item.fractalRoot) : {};
    context.activities = item.activities || [];
    context.effects = item.effects?.contents || [];
    return context;
  }

  // V2 compatibility: Configure render options
  _configureRenderOptions(options) {
    super._configureRenderOptions(options);

    // Swap template for spell items - use this.document (V2) with fallback to this.item (V1)
    const doc = this.document ?? this.item;
    if (doc?.type === "spell" && this.constructor.PARTS?.sheet) {
      this.constructor.PARTS.sheet.template = "systems/rnk-quantum-d35e/templates/items/spell-sheet.hbs";
    }
  }

  // V2 compatibility: Handle listeners in _onRender
  _onRender(context, options) {
    super._onRender(context, options);
    this._activateCustomListeners($(this.element));
  }

  _activateCustomListeners(html) {
    // Ensure we find the container
    const container = html.find('.item-sheet-container').length ? html.find('.item-sheet-container') : html;
    
    // Changes management
    container.find('.add-change').click(this._onAddChange.bind(this));
    container.find('.delete-change').click(this._onDeleteChange.bind(this));
    container.find('.roll-item').click(this._onRoll.bind(this));
    
    // Activity Management
    container.find('.add-activity').click(this._onAddActivity.bind(this));
    container.find('.delete-activity').click(this._onDeleteActivity.bind(this));
    container.find('.roll-activity').click(this._onRollActivity.bind(this));

    // Effect Management
    container.find('.add-effect').click(this._onAddEffect.bind(this));
    container.find('.edit-effect').click(this._onEditEffect.bind(this));
    container.find('.delete-effect').click(this._onDeleteEffect.bind(this));
  }

  async _onAddActivity(event) {
    event.preventDefault();
    // For now, let's just add a generic activity
    const activities = Array.from(this.item.system.activities || []);
    activities.push({
      name: "New Activity",
      type: "attack",
      activation: { type: "action", cost: 1 }
    });
    return this.item.update({ "system.activities": activities });
  }

  async _onDeleteActivity(event) {
    event.preventDefault();
    const li = event.currentTarget.closest(".activity-item");
    const index = parseInt(li.dataset.activityId);
    const activities = Array.from(this.item.system.activities || []);
    activities.splice(index, 1);
    return this.item.update({ "system.activities": activities });
  }

  async _onRollActivity(event) {
    event.preventDefault();
    const index = parseInt(event.currentTarget.dataset.activityId);
    const activity = this.item.activities[index];
    if (activity) {
      return activity.execute(this.item.actor || game.user.character);
    }
  }

  async _onAddEffect(event) {
    event.preventDefault();
    return ActiveEffect.create({
      name: "New Effect",
      img: "icons/svg/aura.svg",
      origin: this.item.uuid,
      disabled: false
    }, { parent: this.item }).then(ef => ef.sheet.render(true));
  }

  async _onEditEffect(event) {
    event.preventDefault();
    const li = event.currentTarget.closest(".effect-item");
    const effect = this.item.effects.get(li.dataset.effectId);
    effect.sheet.render(true);
  }

  async _onDeleteEffect(event) {
    event.preventDefault();
    const li = event.currentTarget.closest(".effect-item");
    const effect = this.item.effects.get(li.dataset.effectId);
    return effect.delete();
  }

  buildFractalDisplay() {
    const doc = this.document ?? this.object;
    return doc?.fractalRoot ? this.serializeFractal(doc.fractalRoot) : {};
  }

  serializeFractal(node) {
    return {
      data: node.data,
      children: node.children.map(child => this.serializeFractal(child))
    };
  }

  // Fallback for V1
  activateListeners(html) {
    super.activateListeners(html);
    html.find('.roll-item').click(this._onRoll.bind(this));
    
    // Changes management
    html.find('.add-change').click(this._onAddChange.bind(this));
    html.find('.delete-change').click(this._onDeleteChange.bind(this));
  }

  async _onAddChange(event) {
    event.preventDefault();
    const changes = Array.from(this.item.system.changes || []);
    changes.push({ formula: "0", target: "abilities.str.value", type: "untyped" });
    return this.item.update({ "system.changes": changes });
  }

  async _onDeleteChange(event) {
    event.preventDefault();
    const li = event.currentTarget.closest(".change-row");
    const index = parseInt(li.dataset.index);
    const changes = Array.from(this.item.system.changes || []);
    changes.splice(index, 1);
    return this.item.update({ "system.changes": changes });
  }

  _onRoll(event) {
    event.preventDefault();
    this.item.roll();
  }

  /**
   * Handle form submission for V2 compatibility
   * @param {Object} formConfig
   * @param {Event} event
   * @param {Object} formData
   */
  async _onSubmit(formConfig, event, formData) {
    // V2 form submission handler
    event.preventDefault();
    console.log("Quantum Chronicles | Item form submitted", formData);
    // Call parent if needed
    // await super._onSubmit(formConfig, event, formData);
  }
}