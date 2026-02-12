// RNK-Quantum D35E Lazy Vortex Loader
// Innovative: Vortex-based lazy loading with gravitational pull for dependencies

class VortexLoader {
  constructor() {
    this.loadedModules = new Map();
    this.vortexPull = new Set(); // Dependencies in gravitational pull
  }

  async loadModule(modulePath) {
    if (this.loadedModules.has(modulePath)) {
      return this.loadedModules.get(modulePath);
    }

    try {
      const module = await import(modulePath);
      this.loadedModules.set(modulePath, module);
      this.updateVortexPull(modulePath);
      return module;
    } catch (error) {
      console.error('Vortex Load Failed:', error);
      throw error;
    }
  }

  updateVortexPull(modulePath) {
    this.vortexPull.add(modulePath);
    // Pull related modules
    const related = this.getRelatedModules(modulePath);
    related.forEach(rel => this.vortexPull.add(rel));
  }

  getRelatedModules(modulePath) {
    // Define relations
    const relations = {
      './actor/entity.js': ['./item/entity.js'],
      './combat.js': ['./dice.js'],
      // Add more as needed
    };
    return relations[modulePath] || [];
  }

  unloadModule(modulePath) {
    this.loadedModules.delete(modulePath);
    this.vortexPull.delete(modulePath);
  }
}

const vortexLoader = new VortexLoader();

export { VortexLoader, vortexLoader };
