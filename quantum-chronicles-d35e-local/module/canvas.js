// RNK-Quantum D35E Canvas - Vortex Measurements
// Innovative: Canvas functions with vortex distance calculations

export const measureDistances = function(segments, options = {}) {
  // Vortex measurement: curved space distances
  if (!options.gridSpaces) return segments;

  return segments.map(segment => {
    const ray = segment.ray;
    let distance = ray.distance;

    // Quantum curvature effect
    const curvature = Math.sin(ray.angle) * 0.1;
    distance *= (1 + curvature);

    return {
      ...segment,
      distance,
      text: `${Math.round(distance * 100) / 100} ${canvas.scene.grid.units}`
    };
  });
};

export const measureDistance = function(p0, p1, options = {}) {
  // Euclidean distance with quantum fluctuations
  const dx = p1.x - p0.x;
  const dy = p1.y - p0.y;
  let distance = Math.sqrt(dx * dx + dy * dy);

  // Add quantum uncertainty
  distance += (Math.random() - 0.5) * 2;

  return distance;
};

export const getConditions = function() {
  // Quantum condition states
  return {
    blinded: "D35E.ConditionBlinded",
    confused: "D35E.ConditionConfused",
    dazed: "D35E.ConditionDazed",
    dazzled: "D35E.ConditionDazzled",
    deafened: "D35E.ConditionDeafened",
    exhausted: "D35E.ConditionExhausted",
    frightened: "D35E.ConditionFrightened",
    grappled: "D35E.ConditionGrappled",
    helpless: "D35E.ConditionHelpless",
    invisible: "D35E.ConditionInvisible",
    panicked: "D35E.ConditionPanicked",
    paralyzed: "D35E.ConditionParalyzed",
    petrified: "D35E.ConditionPetrified",
    poisoned: "D35E.ConditionPoisoned",
    shaken: "D35E.ConditionShaken",
    sickened: "D35E.ConditionSickened",
    stunned: "D35E.ConditionStunned",
    turned: "D35E.ConditionTurned"
  };
};