// RNK-Quantum D35E Trigger Nexus
// Innovative: Central nexus for all system triggers, using event-driven chaos theory

class TriggerNexus {
  constructor() {
    this.triggers = new Map();
  }

  registerTrigger(event, handler) {
    if (!this.triggers.has(event)) {
      this.triggers.set(event, []);
    }
    this.triggers.get(event).push(handler);
  }

  fireTrigger(event, data) {
    const handlers = this.triggers.get(event) || [];
    handlers.forEach(handler => handler(data));
  }

  unregisterTrigger(event, handler) {
    const handlers = this.triggers.get(event) || [];
    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
    }
  }

}

const nexus = new TriggerNexus();

// Predefined triggers for system events
nexus.registerTrigger('actorUpdate', (data) => {
  console.log('Quantum Actor Update Triggered:', data);
});

nexus.registerTrigger('itemRoll', (data) => {
  console.log('Quantum Item Roll Triggered:', data);
});

nexus.registerTrigger('combatStart', (data) => {
  console.log('Quantum Combat Start Triggered:', data);
});

export { TriggerNexus, nexus };
