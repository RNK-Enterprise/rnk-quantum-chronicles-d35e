/**
 * D&D 3.5 Attack Dialog
 * Dialog for performing attacks in combat
 */

import { CombatManager } from "../combat.js";
import { DicePF } from "../dice.js";

export class AttackDialog extends Dialog {
  constructor(attacker, options = {}) {
    const data = {
      attacker: attacker,
      targets: options.targets || [],
      weapons: options.weapons || attacker.items.filter(i => i.type === 'weapon'),
      spells: options.spells || attacker.items.filter(i => i.type === 'spell')
    };

    const dialogOptions = {
      title: `${attacker.name} - Attack`,
      content: AttackDialog.getContent(data),
      buttons: {
        attack: {
          label: "Attack",
          callback: (html) => this._onAttack(html, data)
        },
        fullAttack: {
          label: "Full Attack",
          callback: (html) => this._onFullAttack(html, data)
        },
        cancel: {
          label: "Cancel",
          callback: () => {}
        }
      },
      default: "attack",
      width: 400,
      height: 300,
      ...options
    };

    super(dialogOptions, options);

    this.attacker = attacker;
    this.data = data;
  }

  /**
   * Get dialog content
   * @param {Object} data - Dialog data
   * @returns {string} HTML content
   */
  static getContent(data) {
    return `
      <form class="attack-dialog">
        <div class="form-group">
          <label>Target:</label>
          <select name="target" required>
            <option value="">Select Target</option>
            ${data.targets.map(target => `
              <option value="${target._id}">${target.name} (AC: ${target.system.attributes.ac.normal})</option>
            `).join('')}
          </select>
        </div>

        <div class="form-group">
          <label>Attack Type:</label>
          <select name="attackType">
            <option value="weapon">Weapon Attack</option>
            <option value="spell">Spell Attack</option>
            <option value="unarmed">Unarmed Attack</option>
          </select>
        </div>

        <div class="form-group weapon-select" style="display: block;">
          <label>Weapon:</label>
          <select name="weapon">
            ${data.weapons.map(weapon => `
              <option value="${weapon._id}">${weapon.name} (${weapon.system.damage.parts[0][0]})</option>
            `).join('')}
            <option value="unarmed">Unarmed Strike (1d3)</option>
          </select>
        </div>

        <div class="form-group spell-select" style="display: none;">
          <label>Spell:</label>
          <select name="spell">
            ${data.spells.filter(spell => spell.system.level === 0).map(spell => `
              <option value="${spell._id}">${spell.name} (Cantrip)</option>
            `).join('')}
          </select>
        </div>

        <div class="form-group">
          <label>
            <input type="checkbox" name="advantage"/> Advantage
          </label>
          <label>
            <input type="checkbox" name="disadvantage"/> Disadvantage
          </label>
        </div>
      </form>
    `;
  }

  /**
   * Handle attack button
   * @private
   */
  async _onAttack(html, data) {
    const formData = new FormData(html.querySelector('form'));
    const targetId = formData.get('target');
    const attackType = formData.get('attackType');
    const weaponId = formData.get('weapon');
    const spellId = formData.get('spell');
    const advantage = formData.get('advantage') === 'on';
    const disadvantage = formData.get('disadvantage') === 'on';

    if (!targetId) {
      ui.notifications.warn("Please select a target.");
      return;
    }

    const target = data.targets.find(t => t._id === targetId);
    if (!target) {
      ui.notifications.warn("Invalid target selected.");
      return;
    }

    let attackOptions = {
      advantage,
      disadvantage
    };

    // Get weapon or spell data
    let weapon = null;
    let damageParts = [];
    let damageBonus = 0;

    if (attackType === 'weapon' || attackType === 'unarmed') {
      if (weaponId === 'unarmed') {
        // Unarmed strike
        damageParts = [['1d3', 'physical']];
        damageBonus = data.attacker.system.abilities.str.mod;
      } else {
        weapon = data.attacker.items.get(weaponId);
        if (weapon) {
          damageParts = weapon.system.damage.parts;
          damageBonus = weapon.getDamageBonus(data.attacker);
        }
      }
    }

    // Perform attack
    await CombatManager.performAttack(data.attacker, target, {
      ...attackOptions,
      damageParts,
      damageBonus
    });
  }

  /**
   * Handle full attack button
   * @private
   */
  async _onFullAttack(html, data) {
    const formData = new FormData(html.querySelector('form'));
    const targetId = formData.get('target');
    const attackType = formData.get('attackType');
    const weaponId = formData.get('weapon');

    if (!targetId) {
      ui.notifications.warn("Please select a target.");
      return;
    }

    const target = data.targets.find(t => t._id === targetId);
    if (!target) {
      ui.notifications.warn("Invalid target selected.");
      return;
    }

    // Perform full attack
    await CombatManager.performFullAttack(data.attacker, target, {});
  }

  /**
   * Show attack dialog for an actor
   * @param {ActorPF} attacker - Attacking actor
   * @param {Array} targets - Available targets
   * @returns {Promise} Dialog result
   */
  static async show(attacker, targets = []) {
    // Get potential targets (hostile tokens in combat)
    if (targets.length === 0 && game.combat) {
      targets = game.combat.combatants
        .filter(c => c.actor && c.actor._id !== attacker._id)
        .map(c => c.actor);
    }

    // Get available weapons
    const weapons = attacker.items.filter(i => i.type === 'weapon');
    const spells = attacker.items.filter(i => i.type === 'spell');

    const dialog = new AttackDialog(attacker, {
      targets,
      weapons,
      spells
    });

    dialog.render(true);
  }
}
