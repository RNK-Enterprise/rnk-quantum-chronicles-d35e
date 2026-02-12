/**
 * RNK-Quantum D35E - Modern Roll Dialog System
 * Pre-roll configuration for advantage, bonuses, and roll modifiers
 */

/**
 * Modern Roll Configuration Dialog
 */
export class ModernRollDialog {
  constructor(actor, rollType = "generic", options = {}) {
    this.actor = actor;
    this.rollType = rollType;
    this.options = options;
    this.rollConfig = {
      advantage: false,
      disadvantage: false,
      bonus: 0,
      penalty: 0,
      criticalConfirm: false,
      rollType: rollType
    };
  }

  /**
   * Show roll dialog to player
   */
  async show() {
    return new Promise((resolve) => {
      const dialog = new Dialog({
        title: `${this.options.title || "Roll"} Configuration`,
        content: this.getHTML(),
        buttons: {
          roll: {
            icon: '<i class="fas fa-dice-d20"></i>',
            label: "Roll",
            callback: (html) => {
              this.readFromHTML(html);
              resolve(this.rollConfig);
            }
          },
          cancel: {
            icon: '<i class="fas fa-times"></i>',
            label: "Cancel",
            callback: () => resolve(null)
          }
        },
        default: "roll",
        close: () => resolve(null)
      });

      dialog.render(true);
    });
  }

  /**
   * Get HTML for dialog
   */
  getHTML() {
    const advCheckbox = this.rollType.includes("attack") || this.rollType.includes("save") || this.rollType.includes("skill");
    
    let html = `
      <form class="modern-roll-dialog">
        <div class="form-group">
          <label for="roll-advantage">
            <input type="checkbox" id="roll-advantage" name="advantage" />
            Advantage (Roll twice, use higher)
          </label>
        </div>

        <div class="form-group">
          <label for="roll-disadvantage">
            <input type="checkbox" id="roll-disadvantage" name="disadvantage" />
            Disadvantage (Roll twice, use lower)
          </label>
        </div>

        <div class="form-group">
          <label for="roll-bonus">Bonus:</label>
          <input type="number" id="roll-bonus" name="bonus" value="0" min="0" />
        </div>

        <div class="form-group">
          <label for="roll-penalty">Penalty:</label>
          <input type="number" id="roll-penalty" name="penalty" value="0" min="0" />
        </div>
    `;

    if (this.rollType === "attack") {
      html += `
        <div class="form-group">
          <label for="roll-critical-confirm">
            <input type="checkbox" id="roll-critical-confirm" name="criticalConfirm" />
            Confirming Critical
          </label>
        </div>

        <div class="form-group">
          <label for="attack-type">Attack Type:</label>
          <select id="attack-type" name="attackType">
            <option value="normal">Normal Attack</option>
            <option value="touch">Touch Attack</option>
            <option value="flatfooted">vs Flat-Footed</option>
          </select>
        </div>
      `;
    }

    if (this.rollType === "save") {
      html += `
        <div class="form-group">
          <label for="save-dc">DC to Beat:</label>
          <input type="number" id="save-dc" name="saveDC" value="10" min="1" />
        </div>
      `;
    }

    if (this.rollType === "skill") {
      html += `
        <div class="form-group">
          <label for="skill-dc">DC (if applicable):</label>
          <input type="number" id="skill-dc" name="skillDC" value="10" min="1" />
        </div>
      `;
    }

    html += `</form>`;
    return html;
  }

  /**
   * Read values from HTML form
   */
  readFromHTML(html) {
    const form = html.find("form")[0];
    if (!form) return;

    this.rollConfig.advantage = form.querySelector('[name="advantage"]')?.checked || false;
    this.rollConfig.disadvantage = form.querySelector('[name="disadvantage"]')?.checked || false;
    this.rollConfig.bonus = parseInt(form.querySelector('[name="bonus"]')?.value || 0);
    this.rollConfig.penalty = parseInt(form.querySelector('[name="penalty"]')?.value || 0);
    
    if (this.rollType === "attack") {
      this.rollConfig.criticalConfirm = form.querySelector('[name="criticalConfirm"]')?.checked || false;
      this.rollConfig.attackType = form.querySelector('[name="attackType"]')?.value || "normal";
    }

    if (this.rollType === "save") {
      this.rollConfig.saveDC = parseInt(form.querySelector('[name="saveDC"]')?.value || 10);
    }

    if (this.rollType === "skill") {
      this.rollConfig.skillDC = parseInt(form.querySelector('[name="skillDC"]')?.value || 10);
    }
  }
}

/**
 * Roll Result Evaluator
 */
export class RollResultEvaluator {
  constructor(roll, config = {}) {
    this.roll = roll;
    this.config = config;
  }

  /**
   * Evaluate roll success
   */
  evaluateSuccess(targetDC) {
    if (!targetDC) return null;

    const total = this.roll.total;
    const isSuccess = total >= targetDC;
    const isCriticalSuccess = this.roll.terms[0]?.results?.[0]?.result === 20;
    const isCriticalFailure = this.roll.terms[0]?.results?.[0]?.result === 1;

    return {
      success: isSuccess && !isCriticalFailure,
      failure: !isSuccess || isCriticalFailure,
      criticalSuccess: isCriticalSuccess,
      criticalFailure: isCriticalFailure,
      margin: total - targetDC,
      total: total,
      dc: targetDC
    };
  }

  /**
   * Get result string for display
   */
  getResultString(targetDC) {
    const result = this.evaluateSuccess(targetDC);
    if (!result) return "Roll complete";

    let string = `**Total: ${result.total}**`;
    
    if (result.criticalSuccess) {
      string += " - **CRITICAL SUCCESS!**";
    } else if (result.criticalFailure) {
      string += " - **CRITICAL FAILURE!**";
    } else if (result.success) {
      string += ` - Success (by ${result.margin})`;
    } else {
      string += ` - Failure (by ${Math.abs(result.margin)})`;
    }

    return string;
  }

  /**
   * Format roll for chat
   */
  formatForChat() {
    const terms = this.roll.terms;
    const d20 = terms[0];
    let modifier = 0;

    // Sum modifiers
    for (let i = 2; i < terms.length; i++) {
      if (typeof terms[i] === "number") {
        modifier += terms[i];
      } else if (terms[i].number !== undefined) {
        modifier += terms[i].number;
      }
    }

    return {
      d20Result: d20.results?.[0]?.result || 0,
      modifier: modifier,
      total: this.roll.total,
      formula: this.roll.formula
    };
  }
}

/**
 * Advanced Roll System
 */
export class AdvancedRoller {
  /**
   * Roll with advantage/disadvantage
   */
  static async rollWithAdvantage(actor, formula, config = {}) {
    if (config.advantage || config.disadvantage) {
      const roll1 = new Roll(formula, actor.getRollData());
      const roll2 = new Roll(formula, actor.getRollData());
      
      await roll1.evaluate();
      await roll2.evaluate();

      const useRoll = config.advantage && roll1.total >= roll2.total ? roll1 : roll2;
      return useRoll;
    }

    const roll = new Roll(formula, actor.getRollData());
    await roll.evaluate();
    return roll;
  }

  /**
   * Build formula with modifiers
   */
  static buildFormula(baseFormula, bonus = 0, penalty = 0) {
    let formula = baseFormula;

    if (bonus > 0) formula += ` + ${bonus}`;
    if (penalty > 0) formula += ` - ${penalty}`;

    return formula;
  }

  /**
   * Quick attack roll
   */
  static async quickAttackRoll(actor, config = {}) {
    const bonus = (config.bonus || 0) - (config.penalty || 0);
    const formula = `1d20 + ${bonus}`;

    return this.rollWithAdvantage(actor, formula, config);
  }

  /**
   * Quick skill roll
   */
  static async quickSkillRoll(actor, skillMod, config = {}) {
    const bonus = skillMod + (config.bonus || 0) - (config.penalty || 0);
    const formula = `1d20 + ${bonus}`;

    return this.rollWithAdvantage(actor, formula, config);
  }

  /**
   * Quick save roll
   */
  static async quickSaveRoll(actor, saveMod, config = {}) {
    const bonus = saveMod + (config.bonus || 0) - (config.penalty || 0);
    const formula = `1d20 + ${bonus}`;

    return this.rollWithAdvantage(actor, formula, config);
  }
}
