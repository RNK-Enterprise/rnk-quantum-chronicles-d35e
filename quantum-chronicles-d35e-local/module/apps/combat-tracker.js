/**
 * D&D 3.5 Combat Tracker
 * Enhanced combat tracker with D35E-specific features
 */

import { CombatManager } from "../combat.js";

export class CombatTrackerPF extends CombatTracker {
  /**
   * Get default options for the combat tracker
   */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "combat-tracker",
      template: "systems/rnk-quantum-d35e/templates/combat/tracker.html",
      title: "Combat Tracker",
      classes: ["rnk-d35e", "combat-tracker"],
      width: 300,
      height: 600,
      resizable: true,
      minimizable: true
    });
  }

  /**
   * Get data for template rendering
   */
  getData() {
    const data = super.getData();

    // Add D35E-specific data
    if (this.combat) {
      data.combat = {
        round: this.combat.round,
        turn: this.combat.turn,
        currentCombatantId: this.combat.currentCombatantId,
        combatants: this.combat.combatants.map(c => ({
          _id: c._id,
          name: c.name,
          img: c.img,
          initiative: c.initiative,
          actor: c.actor ? {
            system: {
              attributes: {
                hp: c.actor.system.attributes.hp,
                ac: c.actor.system.attributes.ac
              }
            }
          } : null
        }))
      };
    }

    return data;
  }

  /**
   * Activate event listeners
   */
  activateListeners(html) {
    super.activateListeners(html);

    // Combat control buttons
    html.find('.combat-control').click(this._onCombatControl.bind(this));

    // Combatant control buttons
    html.find('.control-btn').click(this._onCombatantControl.bind(this));

    // Action buttons
    html.find('.action-btn').click(this._onActionButton.bind(this));

    // Add combatants button
    html.find('.add-combatants-btn').click(this._onAddCombatants.bind(this));
  }

  /**
   * Handle combat control button clicks
   * @private
   */
  async _onCombatControl(event) {
    event.preventDefault();
    const action = event.currentTarget.dataset.action;

    if (!this.combat) return;

    switch (action) {
      case 'start':
        await this.combat.startCombat();
        break;
      case 'next-turn':
        await this.combat.nextTurn();
        break;
      case 'end':
        await this.combat.endCombat();
        break;
    }

    this.render();
  }

  /**
   * Handle combatant control button clicks
   * @private
   */
  async _onCombatantControl(event) {
    event.preventDefault();
    const action = event.currentTarget.dataset.action;
    const combatantId = event.currentTarget.closest('.combatant').dataset.combatantId;
    const combatant = this.combat?.combatants.find(c => c._id === combatantId);

    if (!combatant) return;

    switch (action) {
      case 'roll-initiative':
        if (this.combat) {
          await this.combat.rollInitiativeForCombatant(combatantId);
          this.render();
        }
        break;
      case 'view-sheet':
        if (combatant.actor) {
          combatant.actor.sheet.render(true);
        }
        break;
      case 'remove':
        if (this.combat) {
          await this.combat.deleteEmbeddedDocuments("Combatant", [combatantId]);
          this.render();
        }
        break;
    }
  }

  /**
   * Handle action button clicks
   * @private
   */
  async _onActionButton(event) {
    event.preventDefault();
    const action = event.currentTarget.dataset.action;

    if (!this.combat) return;

    switch (action) {
      case 'roll-all-initiative':
        await this.combat.rollInitiative();
        this.render();
        break;
      case 'reset-initiative':
        const updates = this.combat.combatants.map(c => ({
          _id: c._id,
          initiative: null
        }));
        await this.combat.updateEmbeddedDocuments("Combatant", updates);
        this.render();
        break;
    }
  }

  /**
   * Handle add combatants button
   * @private
   */
  async _onAddCombatants(event) {
    event.preventDefault();

    // Create a dialog to select actors to add
    const actors = game.actors.filter(a => a.type === 'character' || a.type === 'npc');

    if (actors.length === 0) {
      ui.notifications.warn("No actors available to add to combat.");
      return;
    }

    const content = `
      <form>
        <div class="form-group">
          <label>Select actors to add to combat:</label>
          <div class="actor-selection">
            ${actors.map(actor => `
              <label class="actor-option">
                <input type="checkbox" name="actors" value="${actor._id}"/>
                <img src="${actor.img}" alt="${actor.name}" class="actor-thumbnail"/>
                ${actor.name}
              </label>
            `).join('')}
          </div>
        </div>
      </form>
    `;

    new Dialog({
      title: "Add Combatants",
      content: content,
      buttons: {
        add: {
          label: "Add Selected",
          callback: async (html) => {
            const selectedActorIds = [];
            html.find('input[name="actors"]:checked').each((i, el) => {
              selectedActorIds.push(el.value);
            });

            if (selectedActorIds.length === 0) return;

            // Create combat if it doesn't exist
            if (!this.combat) {
              this.combat = await Combat.create({ scene: canvas.scene._id });
            }

            // Add selected actors as combatants
            const combatants = selectedActorIds.map(actorId => ({
              actorId: actorId,
              sceneId: canvas.scene._id
            }));

            await this.combat.createEmbeddedDocuments("Combatant", combatants);
            this.render();
          }
        },
        cancel: {
          label: "Cancel"
        }
      },
      default: "add"
    }).render(true);
  }

  /**
   * Update the tracker when combat changes
   */
  async _onUpdateCombat(combat, updateData, options, userId) {
    await super._onUpdateCombat(combat, updateData, options, userId);
    this.render();
  }

  /**
   * Update the tracker when combatants change
   */
  async _onUpdateCombatant(combatant, updateData, options, userId) {
    await super._onUpdateCombatant(combatant, updateData, options, userId);
    this.render();
  }

  /**
   * Update the tracker when actors change
   */
  async _onUpdateActor(actor, updateData, options, userId) {
    await super._onUpdateActor(actor, updateData, options, userId);
    this.render();
  }
}
