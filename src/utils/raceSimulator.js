export function simulateRace(horses, distance) {
  const results = horses.map(horse => {
    // Calculate race time based on horse condition, distance, and some randomness
    const baseTime = distance / 15 // Base speed: 15 meters per second
    const conditionBonus = (horse.condition / 100) * 0.3 // Up to 30% time reduction for good condition
    const randomFactor = (Math.random() * 0.4) + 0.8 // Random factor between 0.8 and 1.2
    
    const raceTime = baseTime * (1 - conditionBonus) * randomFactor
    
    return {
      ...horse,
      raceTime: parseFloat(raceTime.toFixed(2)),
      finishPosition: 0 // Will be set after sorting
    }
  })
  
  // Sort by race time (fastest first) and assign positions
  results.sort((a, b) => a.raceTime - b.raceTime)
  results.forEach((horse, index) => {
    horse.finishPosition = index + 1
  })
  
  return {
    results,
    distance,
    winner: results[0]
  }
}

export function calculateHorseSpeed(horse, distance) {
  // Calculate speed based on condition and some randomness
  const baseSpeed = 12 + (horse.condition / 100) * 8 // Speed between 12-20 m/s
  const randomVariation = (Math.random() * 0.4) + 0.8 // ±20% variation
  return baseSpeed * randomVariation
}
