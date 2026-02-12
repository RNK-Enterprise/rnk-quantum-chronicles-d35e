// RNK-Quantum D35E Actor Sheet Base - Version Compatible
// Innovative: Class extension with quantum enhancements

import { ActorTraitSelector } from "../../apps/trait-selector.js";
import { DicePF } from "../../dice.js";
import { D35E } from "../../config.js";
import { SYSTEM_ID } from "../../settings.js";

// Modern V13 API resolution with robust fallbacks
const api = foundry?.applications?.api;
const sheets = foundry?.applications?.sheets;

// Resolve Base Class - Prefer ApplicationV2 (V13+) then fallback to legacy ActorSheet
const V2Base = api?.ActorSheetV2 || api?.DocumentSheetV2 || api?.ApplicationV2 || sheets?.ActorSheetV2;
const BaseClass = V2Base || globalThis?.ActorSheet || class DefaultActorSheet {};

// Only apply HandlebarsApplicationMixin if we are using a V2 base class
const ActorSheetClass = (V2Base && api?.HandlebarsApplicationMixin) 
  ? api.HandlebarsApplicationMixin(BaseClass) 
  : BaseClass;

export class ActorSheetPF extends ActorSheetClass {

  /** V2 compatibility: this.document is V2, this.actor is V1. Bridge both. */
  get actor() {
    return this.document;
  }

  static get DEFAULT_OPTIONS() {
    return {
      classes: ["rnk-quantum-d35e", "sheet", "actor"],
      window: {
        resizable: true,
        minimizable: true
      },
      position: {
        width: 1200,
        height: 900
      }
    };
  }

  // V2 compatibility: Define PARTS for V2 sheets
  static get PARTS() {
    return {
      sheet: {
        tag: "form",
        template: "systems/rnk-quantum-d35e/templates/actors/actor-sheet.hbs",
        classes: ["actor-sheet"]
      }
    };
  }

  async _prepareContext(options = {}) {
    const context = await super._prepareContext(options);
    const actor = this.document;
    if (!actor) return context ?? {};

    // Persistent Tab State for V2
    if (!this.tabGroups) this.tabGroups = {};
    if (!this.tabGroups.primary) {
        if (actor.type === "npc") this.tabGroups.primary = "stats";
        else this.tabGroups.primary = "abilities";
    }

    context.actor = actor;
    context.system = actor.system;
    context.items = actor.items;
    context.config = D35E;
    context.cssClass = this.options.classes?.join(" ") ?? "";
    context.quantumEntropy = Math.random();
    context.activeTab = this.tabGroups.primary;
    return context;
  }

  // Fallback for V1 compatibility
  async getData(options = {}) {
    const context = await this._prepareContext(options);
    return context;
  }

  // Handle both V1 and V2 click events
  _onTabClick(event) {
    event.preventDefault();
    const tab = event.currentTarget.dataset.tab;
    const element = this.element instanceof HTMLElement ? this.element : this.element[0];

    // Update ApplicationV2 Tab State
    if (!this.tabGroups) this.tabGroups = {};
    this.tabGroups.primary = tab;

    // Remove active class from all buttons and tabs
    element.querySelectorAll('.sheet-tabs button').forEach(btn => btn.classList.remove('active'));
    element.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));

    // Add active class to clicked button and corresponding tab
    event.currentTarget.classList.add('active');
    const targetTab = element.querySelector(`.tab[data-tab="${tab}"]`);
    if (targetTab) {
      targetTab.classList.add('active');
    }

    // Force Scroll to top
    const sheetBody = element.querySelector('.sheet-body');
    if (sheetBody) sheetBody.scrollTop = 0;

    // internal state sync for foundry
    if (this._tabs?.[0]) this._tabs[0].activate(tab);
  }

// V2 logic: Hooks into rendering
  async _onRender(context, options) {
    const htmlElement = this.element instanceof HTMLElement ? this.element : this.element[0];

    // Restore active tab state after render
    const activeTab = this.tabGroups?.primary;
    if (activeTab) {
      htmlElement.querySelector(`.sheet-tabs button[data-tab="${activeTab}"]`)?.classList.add('active');
      htmlElement.querySelector(`.tab[data-tab="${activeTab}"]`)?.classList.add('active');
      htmlElement.querySelectorAll(`.sheet-tabs button:not([data-tab="${activeTab}"])`).forEach(btn => btn.classList.remove('active'));
      htmlElement.querySelectorAll(`.tab:not([data-tab="${activeTab}"])`).forEach(tab => tab.classList.remove('active'));
    }
    
    // Re-attach listeners
    this._activateSheetListeners(htmlElement);

    // V2-specific drag-drop binding - properly bind to items
    this._setupDragAndDrop(htmlElement);
  }

  /**
   * Set up drag and drop for items
   * @param {HTMLElement} htmlElement
   */
  _setupDragAndDrop(htmlElement) {
    // Store the handlers so we can remove them later
    if (!this._dragHandlers) {
      this._dragHandlers = {
        dragstart: (event) => this._onDragStart(event),
        dragover: (event) => {
          event.preventDefault();
          event.dataTransfer.dropEffect = 'copy';
        },
        drop: (event) => this._onDrop(event)
      };
    }

    // Clean up old listeners
    const oldItems = htmlElement.querySelectorAll('.item[data-item-id]');
    oldItems.forEach(item => {
      item.removeEventListener('dragstart', this._dragHandlers.dragstart);
      item.draggable = false;
    });

    const formElement = htmlElement.closest('form') || htmlElement;
    if (formElement && this._formElement && this._formElement !== formElement) {
      this._formElement.removeEventListener('dragover', this._dragHandlers.dragover);
      this._formElement.removeEventListener('drop', this._dragHandlers.drop);
    }

    // Add new listeners to items
    const itemElements = htmlElement.querySelectorAll('.item[data-item-id]');
    itemElements.forEach(item => {
      item.draggable = true;
      item.addEventListener('dragstart', this._dragHandlers.dragstart);
    });
    
    // Add drop handler on the sheet form
    if (formElement) {
      formElement.addEventListener('dragover', this._dragHandlers.dragover);
      formElement.addEventListener('drop', this._dragHandlers.drop);
      this._formElement = formElement;
      console.log('Drag and drop listeners attached to form element');
    }
  }

  activateListeners(html) {
    super.activateListeners(html);
    this._activateSheetListeners(html);
  }

  /**
   * Activate shared listeners for both V1 and V2 sheets
   * @param {HTMLElement|jQuery} html
   */
  _activateSheetListeners(html) {
    // Get the actual HTMLElement
    const element = html instanceof HTMLElement ? html : html[0] || html.get(0);

    // CRITICAL: Generic rollable handler - handle all roll-type elements
    element.addEventListener('click', (event) => {
      const rollable = event.target.closest('.rollable, [data-roll-type]');
      if (!rollable) return;

      event.preventDefault();
      event.stopPropagation();

      const rollType = rollable.dataset.rollType;
      const rollValue = rollable.dataset.ability || rollable.dataset.save || rollable.dataset.skill;

      console.log('Rollable clicked:', {rollType, rollValue, target: event.target.className});

      if (rollType === 'ability' && rollable.dataset.ability) {
        const ability = rollable.dataset.ability;
        if (typeof this.actor.rollAbilityTest === 'function') return this.actor.rollAbilityTest(ability, {event});
        if (typeof this.actor.rollAbilityCheck === 'function') return this.actor.rollAbilityCheck({ability, event});
        return;
      } else if (rollType === 'save' && rollable.dataset.save) {
        const save = rollable.dataset.save;
        if (typeof this.actor.rollSave === 'function') return this.actor.rollSave(save, {event});
        if (typeof this.actor.rollAbilitySave === 'function') return this.actor.rollAbilitySave(save, {event});
        return;
      } else if (rollType === 'skill' && rollable.dataset.skill) {
        const skill = rollable.dataset.skill;
        if (typeof this.actor.rollSkill === 'function') return this.actor.rollSkill(skill, {event});
        return;
      } else if (rollType === 'initiative') {
        if (typeof this.actor.rollInitiative === 'function') {
          return this.actor.rollInitiative({event: event});
        }
      } else if (rollType === 'bab') {
        if (typeof this.actor.rollBAB === 'function') {
          return this.actor.rollBAB({event: event});
        }
      } else if (rollType === 'ac') {
        console.log('AC roll not implemented yet');
      }
    }, true); // Capture phase to ensure it fires first
    element.querySelectorAll('.sheet-tabs button, .sheet-tabs .tab-btn').forEach(tab => {
      tab.addEventListener('click', (event) => {
        const tabName = event.currentTarget.dataset.tab;
        if (this._tabs?.[0]) {
          this._tabs[0].activate(tabName);
        } else {
          // Manual fallback if Foundry tabs aren't initialized
          this._onTabClick(event);
        }
      });
    });

    // Item roll listeners - both direct button clicks and item name clicks
    element.addEventListener('click', (event) => {
      if (event.target.matches('.item .item-name h4')) {
        this._onItemRoll(event);
      }
    });

    // Abilities
    element.addEventListener('click', (event) => {
      if (event.target.matches('.ability-check, .ability-name, .ability, .ability-square, .ability-title')) {
        this._onAbilityCheck(event);
      }
    });

    // Saves
    element.addEventListener('click', (event) => {
      if (event.target.matches('.save-roll, .saving-throw, .saves-panel strong')) {
        this._onSaveRoll(event);
      }
    });

    // BAB / Init
    element.addEventListener('click', (event) => {
      if (event.target.matches('.stat-summary strong')) {
        const text = event.target.textContent.trim().toLowerCase();
        if (text === "bab") this.actor.rollBAB({event: event});
        else if (text === "init") this.actor.rollInitiative({event: event});
      }
    });

    // CRITICAL: Handle skill-name spans that may have data-skill attribute
    element.addEventListener('click', (event) => {
      if (event.target.matches('.skill-name, [data-roll-type="skill"]')) {
        event.preventDefault();
        event.stopPropagation();
        let skill = event.target.dataset.skill;
        if (!skill) {
          skill = event.target.textContent.trim().toLowerCase();
        }

        if (skill && typeof this.actor.rollSkill === 'function') {
          this.actor.rollSkill(skill, {event: event});
          return;
        }
        this._onSkillCheck.call(this, event);
      }
    });

    // Skill roll listeners - handle skill rows and skill elements
    element.addEventListener('click', (event) => {
      if (event.target.matches('input, label, .skill-rank')) return;

      const skillElement = event.target.closest('.skill, .sub-skill, .skill-row');
      if (!skillElement) return;

      const skillRoll = skillElement.querySelector('.skill-roll');
      if (skillRoll) {
        event.preventDefault();
        event.stopPropagation();
        skillRoll.click();
      } else {
        this._onSkillCheck.call(this, event);
      }
    });

    // ENHANCED: Make abilities clickable container
    element.addEventListener('click', (event) => {
      if (event.target.matches('.ability, .ability-square')) {
        if (event.target.closest('input, button, .controls')) return;
        event.preventDefault();
        event.stopPropagation();
        const abilityName = event.target.querySelector('.ability-name, .ability-title');
        if (abilityName) abilityName.click();
      }
    });

    // ENHANCED: Make saving throws clickable
    element.addEventListener('click', (event) => {
      if (event.target.matches('.saving-throw, .saves-panel div')) {
        if (event.target.closest('input, button, .controls')) return;
        if (event.target.matches('strong')) return; // Handled by direct listener
        event.preventDefault();
        event.stopPropagation();
        const throwName = event.target.querySelector('.attribute-name, strong');
        if (throwName) throwName.click();
      }
    });

    // ENHANCED: Make skill names and values directly clickable
    element.addEventListener('click', (event) => {
      if (event.target.matches('.skill-name, .skill .skill-total')) {
        event.preventDefault();
        event.stopPropagation();
        const skill = event.target.closest('.skill, .sub-skill, .skill-row');
        if (!skill) return;
        const skillRoll = skill.querySelector('.skill-roll');
        if (skillRoll) skillRoll.click();
      }
    });

    // Item Management - Handle all item controls via delegation
    element.addEventListener('click', async (event) => {
      if (!event.target.matches('.item-control')) return;
      
      const control = event.target;
      console.log('Control element:', control, 'Classes:', control.className);
      
      // Handle item-create separately since it doesn't have a parent item
      if (control.classList.contains('item-create')) {
        console.log('Item create clicked');
        return this._onItemCreate.call(this, event);
      }
      
      // For other controls, find the parent item
      const item = control.closest('.item, .item-card');
      if (!item) {
        console.warn('Item control clicked but no parent item found', {
          control: control.className,
          parents: Array.from(control.parentElement?.classList || [])
        });
        return;
      }
      
      const itemId = item.dataset.itemId;
      if (!itemId) {
        console.warn('Item control clicked but no item ID found');
        return;
      }
      
      console.log(`Item control clicked: itemId=${itemId}, classes=${control.className}`);

      if (control.classList.contains('item-edit')) {
        this._onItemEdit.call(this, event);
      } else if (control.classList.contains('item-delete')) {
        this._onItemDelete.call(this, event);
      } else if (control.classList.contains('item-equip')) {
        this._onItemToggleEquip.call(this, event);
      } else if (control.classList.contains('item-roll')) {
        console.log(`Attempting to roll item: ${itemId}`);
        const itemObj = this.actor.items.get(itemId);
        console.log('Item object:', itemObj);
        
        if (!itemObj) {
          console.warn(`Item not found with ID: ${itemId}`);
          return;
        }
        
        console.log('Item type:', itemObj.type, 'Item activities:', itemObj.activities?.length || 0);
        
        try {
          // Use new activity system if available
          if (typeof itemObj.roll === 'function') {
            console.log('Calling itemObj.roll()');
            await itemObj.roll(this.actor);
          } else if (typeof itemObj.toMessage === 'function') {
            console.log('Calling itemObj.toMessage()');
            await itemObj.toMessage();
          } else {
            console.warn('Item has no roll() or toMessage() method', itemObj);
          }
        } catch (e) {
          console.error('Error rolling item:', e);
          ui.notifications.error(`Error rolling ${itemObj.name}: ${e.message}`);
        }
      }
    });

    element.addEventListener('click', (event) => {
      const button = event.target.closest('.btn-add-item');
      if (!button) return;
      event.preventDefault();
      event.stopPropagation();
      const type = button.dataset.itemType || button.dataset.type;
      if (!type) {
        console.warn('Add Item button clicked without an item type');
        return;
      }
      button.dataset.type = type;
      this._onItemCreate(event);
    });
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @private
   */
  async _onItemCreate(event) {
    event.preventDefault();
    event.stopPropagation();

    const header = event.currentTarget;
    const type = header.dataset.type;

    if (!type) {
      console.warn('Item create clicked but no item type specified');
      return;
    }

    const itemData = {
      name: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      type: type,
      system: structuredClone(header.dataset)
    };

    delete itemData.system["type"];

    console.log(`Quantum Chronicles | Creating item of type ${type}`);
    return this.actor.createEmbeddedDocuments("Item", [itemData]);
  }

  /**
   * Handle editing an existing Owned Item for the Actor
   * @private
   */
  _onItemEdit(event) {
    event.preventDefault();
    event.stopPropagation();

    const item = event.currentTarget.closest('.item, .item-card');
    if (!item) {
      console.warn('Item edit clicked but no parent item found');
      return;
    }

    const itemId = item.dataset.itemId;
    if (!itemId) {
      console.warn('Item edit clicked but no item ID found');
      return;
    }
    
    const itemObj = this.actor.items.get(itemId);
    if (!itemObj) {
      console.warn(`Item not found with ID: ${itemId}`);
      return;
    }
    
    itemObj.sheet.render(true);
  }

  /**
   * Handle deleting an existing Owned Item for the Actor
   * @private
   */
  async _onItemDelete(event) {
    event.preventDefault();
    event.stopPropagation();

    const item = event.currentTarget.closest('.item, .item-card');
    if (!item) {
      console.warn('Item delete clicked but no parent item found');
      return;
    }

    const itemId = item.dataset.itemId;
    if (!itemId) {
      console.warn('Item delete clicked but no item ID found');
      return;
    }
    
    // Verify item exists before attempting deletion
    if (!this.actor.items.get(itemId)) {
      console.warn(`Item not found with ID: ${itemId}`);
      return;
    }
    
    if (event.shiftKey) {
      // Shift+click: delete immediately
      return this.actor.deleteEmbeddedDocuments("Item", [itemId]);
    }

    // Show confirmation dialog
    return Dialog.confirm({
      title: game.i18n.localize("D35E.DeleteItem"),
      content: `<p>${game.i18n.localize("D35E.DeleteItemConfirmation")}</p>`,
      yes: async () => {
        // Double-check item still exists before deleting
        if (!this.actor.items.get(itemId)) {
          console.warn(`Item was already deleted (ID: ${itemId})`);
          return;
        }
        await this.actor.deleteEmbeddedDocuments("Item", [itemId]);
      },
      no: () => {},
      defaultYes: false
    });
  }

  async _onItemToggleEquip(event) {
    event.preventDefault();
    event.stopPropagation();

    const control = event.currentTarget;
    const itemElement = control.closest('.item, .item-card');
    if (!itemElement) {
      console.warn('Equip control clicked but no parent item found');
      return;
    }

    const itemId = itemElement.dataset.itemId;
    if (!itemId) {
      console.warn('Equip control clicked but no item ID found');
      return;
    }

    const item = this.actor.items.get(itemId);
    if (!item) {
      console.warn(`Unable to toggle equip state, item not found: ${itemId}`);
      return;
    }

    const currentlyEquipped = !!item.system?.equipped;
    await item.update({ 'system.equipped': !currentlyEquipped });
  }

  _onItemRoll(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const itemId = event.currentTarget.closest('.item, .item-card')?.dataset.itemId;
    if (!itemId) {
      console.warn('Item roll clicked but no valid item ID found');
      return;
    }
    
    const item = this.actor.items.get(itemId);
    if (!item) {
      console.warn(`Item not found with ID: ${itemId}`);
      return;
    }
    
    if (typeof item.roll === 'function') {
      item.roll();
    } else if (item) {
      item.toMessage();
    }
  }

  _onAbilityCheck(event) {
    event.preventDefault();
    event.stopPropagation();
    const el = event.currentTarget ?? event.target;
    let ability = el?.dataset?.ability;
    if (!ability && el?.closest) {
      ability = el.closest('[data-ability]')?.dataset.ability;
    }
    if (!ability) {
      const label = (el?.textContent || '').trim().toLowerCase();
      const map = { 'strength': 'str', 'dexterity': 'dex', 'constitution': 'con', 'intelligence': 'int', 'wisdom': 'wis', 'charisma': 'cha' };
      ability = map[label] || (label ? label.substring(0, 3) : null);
    }
    if (ability && typeof this.actor.rollAbilityTest === 'function') {
      this.actor.rollAbilityTest(ability, {event: event});
    } else if (ability && typeof this.actor.rollAbilityCheck === 'function') {
      this.actor.rollAbilityCheck({ability: ability, event: event});
    }
  }

  _onSaveRoll(event) {
    event.preventDefault();
    event.stopPropagation();
    const el = event.currentTarget ?? event.target;
    let save = el?.dataset?.save;
    if (!save && el?.closest) {
      save = el.closest('[data-save]')?.dataset.save;
    }
    if (!save) {
      const label = (el?.textContent || '').trim().toLowerCase();
      const map = { 'fortitude': 'fort', 'reflex': 'ref', 'will': 'will' };
      save = map[label] || (label ? label.substring(0, 4) : null);
    }
    if (save && typeof this.actor.rollSave === 'function') {
      this.actor.rollSave(save, {event: event});
    } else if (save && typeof this.actor.rollAbilitySave === 'function') {
      this.actor.rollAbilitySave(save, {event: event});
    }
  }

  _onSkillCheck(event) {
    event.preventDefault();
    event.stopPropagation();
    const el = event.currentTarget ?? event.target;
    let skill = el?.dataset?.skill;
    if (!skill && el?.closest) {
      skill = el.closest('[data-skill]')?.dataset.skill;
    }
    if (!skill && el?.closest) {
      const skillRow = el.closest('.skill, .sub-skill, .skill-row');
      skill = skillRow?.dataset.skill;
    }
    if (!skill) {
      skill = el?.textContent?.trim().toLowerCase();
    }

    if (skill && typeof this.actor.rollSkill === 'function') {
      this.actor.rollSkill(skill, {event: event});
    }
  }

  /** @override */
  async _onDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    
    let data;
    try {
      // Use the namespaced TextEditor for Foundry v13+ compatibility
      const TextEditorImpl = foundry.applications.ux?.TextEditor?.implementation || TextEditor;
      data = TextEditorImpl.getDragEventData(event);
    } catch (e) {
      console.warn('Failed to get drag data:', e);
      return;
    }
    
    if (!data) {
      console.warn('No drop data found');
      return;
    }

    console.log('Drop event received:', data);

    // Standard drop handling
    switch (data.type) {
      case "Item":
        return this._onDropItem(event, data);
      case "Actor":
        return this._onDropActor(event, data);
      case "Folder":
        return this._onDropFolder(event, data);
    }
    
    // Call super for anything else
    if (super._onDrop) return super._onDrop(event);
  }

  /**
   * Handle the start of a drag event for an item
   * @param {DragEvent} event 
   */
  _onDragStart(event) {
    // When using native addEventListener, event.target is the element we're dragging
    const item = event.target.closest(".item, .item-card") || event.target;
    if (!item) return;
    
    const itemId = item.getAttribute('data-item-id');
    if (!itemId) return;
    
    const itemObj = this.actor.items.get(itemId);
    if (!itemObj) {
      console.warn(`Item not found for drag: ${itemId}`);
      return;
    }

    const dragData = itemObj.toDragData();
    if (!dragData) {
      console.warn(`No drag data for item: ${itemId}`);
      return;
    }

    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
  }

  /**
   * Handle dropping an Item on the Actor sheet
   * @param {DragEvent} event 
   * @param {Object} data 
   * @returns {Promise<Item[]>}
   */
  async _onDropItem(event, data) {
    if (!this.actor.isOwner) return false;
    const item = await Item.fromDropData(data);
    const itemData = item.toObject();

    // Handle item sorting or placement if needed
    // Otherwise just create the item on the actor
    return this.actor.createEmbeddedDocuments("Item", [itemData]);
  }

  /**
   * Handle dropping an Actor on the Actor sheet (e.g. for minions/companions)
   * @param {DragEvent} event 
   * @param {Object} data 
   */
  async _onDropActor(event, data) {
    if (!this.actor.isOwner) return false;
    // Implementation for minions could go here
    console.log("Quantum Chronicles | Actor drop detected, but minion logic not implemented yet.");
  }

  /**
   * Handle dropping a Folder on the Actor sheet
   * @param {DragEvent} event 
   * @param {Object} data 
   */
  async _onDropFolder(event, data) {
    if (!this.actor.isOwner) return false;
    // Could import items from folder
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
    console.log("Quantum Chronicles | Actor form submitted", formData);
    // Call parent if needed
    // await super._onSubmit(formConfig, event, formData);
  }

}
