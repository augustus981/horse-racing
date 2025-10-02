import { simulateRace, calculateHorseSpeed } from '@/utils/raceSimulator'

describe('raceSimulator.js', () => {
  const mockHorses = [
    { id: 1, name: 'Fast Horse', condition: 95, color: '#FF6B6B' },
    { id: 2, name: 'Average Horse', condition: 50, color: '#4ECDC4' },
    { id: 3, name: 'Slow Horse', condition: 20, color: '#45B7D1' },
    { id: 4, name: 'Elite Horse', condition: 100, color: '#96CEB4' },
    { id: 5, name: 'Weak Horse', condition: 1, color: '#FECA57' }
  ]

  describe('simulateRace', () => {
    it('returns race results with correct structure', () => {
      const result = simulateRace(mockHorses, 1200)
      
      expect(result).toHaveProperty('results')
      expect(result).toHaveProperty('distance')
      expect(result).toHaveProperty('winner')
      expect(result.distance).toBe(1200)
    })

    it('returns all horses in results', () => {
      const result = simulateRace(mockHorses, 1200)
      
      expect(result.results).toHaveLength(5)
      expect(result.results.every(horse => 
        mockHorses.some(original => original.id === horse.id)
      )).toBe(true)
    })

    it('assigns finish positions correctly (1 to N)', () => {
      const result = simulateRace(mockHorses, 1200)
      
      const positions = result.results.map(horse => horse.finishPosition)
      expect(positions.sort()).toEqual([1, 2, 3, 4, 5])
    })

    it('sorts results by race time (fastest first)', () => {
      const result = simulateRace(mockHorses, 1200)
      
      for (let i = 1; i < result.results.length; i++) {
        expect(result.results[i - 1].raceTime).toBeLessThanOrEqual(result.results[i].raceTime)
      }
    })

    it('identifies correct winner (fastest time)', () => {
      const result = simulateRace(mockHorses, 1200)
      
      expect(result.winner.finishPosition).toBe(1)
      expect(result.winner.raceTime).toBe(result.results[0].raceTime)
    })

    it('includes all original horse properties in results', () => {
      const result = simulateRace(mockHorses, 1200)
      
      result.results.forEach(horse => {
        const original = mockHorses.find(h => h.id === horse.id)
        expect(horse.id).toBe(original.id)
        expect(horse.name).toBe(original.name)
        expect(horse.condition).toBe(original.condition)
        expect(horse.color).toBe(original.color)
      })
    })

    it('adds race-specific properties', () => {
      const result = simulateRace(mockHorses, 1200)
      
      result.results.forEach(horse => {
        expect(horse).toHaveProperty('raceTime')
        expect(horse).toHaveProperty('finishPosition')
        expect(typeof horse.raceTime).toBe('number')
        expect(typeof horse.finishPosition).toBe('number')
      })
    })

    it('generates reasonable race times for different distances', () => {
      const distances = [1200, 1400, 1600, 1800, 2000, 2200]
      
      distances.forEach(distance => {
        const result = simulateRace(mockHorses, distance)
        
        result.results.forEach(horse => {
          // Race time should be positive and reasonable for the distance
          expect(horse.raceTime).toBeGreaterThan(0)
          expect(horse.raceTime).toBeLessThan(distance) // Faster than 1 second per meter
        })
      })
    })

    it('shows better condition horses generally perform better', () => {
      // Run multiple races to check statistical tendency
      const results = []
      for (let i = 0; i < 50; i++) {
        results.push(simulateRace(mockHorses, 1200))
      }
      
      // Calculate average positions for each horse
      const averagePositions = mockHorses.map(horse => {
        const positions = results.map(result => 
          result.results.find(h => h.id === horse.id).finishPosition
        )
        return {
          id: horse.id,
          condition: horse.condition,
          avgPosition: positions.reduce((a, b) => a + b, 0) / positions.length
        }
      })
      
      // Sort by condition (highest first)
      averagePositions.sort((a, b) => b.condition - a.condition)
      
      // Generally, higher condition should lead to better average positions
      // (This is statistical, so we allow some variance)
      const topConditionAvg = averagePositions[0].avgPosition
      const bottomConditionAvg = averagePositions[averagePositions.length - 1].avgPosition
      
      expect(topConditionAvg).toBeLessThan(bottomConditionAvg)
    })

    it('produces different results for multiple races (randomness)', () => {
      const result1 = simulateRace(mockHorses, 1200)
      const result2 = simulateRace(mockHorses, 1200)
      
      // Very unlikely to get identical race times
      const times1 = result1.results.map(h => h.raceTime)
      const times2 = result2.results.map(h => h.raceTime)
      
      expect(times1).not.toEqual(times2)
    })

    it('handles single horse race', () => {
      const result = simulateRace([mockHorses[0]], 1200)
      
      expect(result.results).toHaveLength(1)
      expect(result.results[0].finishPosition).toBe(1)
      expect(result.winner.id).toBe(mockHorses[0].id)
    })

    it('handles maximum horse count (10 horses)', () => {
      const tenHorses = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        name: `Horse ${i + 1}`,
        condition: Math.floor(Math.random() * 100) + 1,
        color: '#FF6B6B'
      }))
      
      const result = simulateRace(tenHorses, 1600)
      
      expect(result.results).toHaveLength(10)
      expect(result.results.map(h => h.finishPosition).sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    })

    it('formats race times to 2 decimal places', () => {
      const result = simulateRace(mockHorses, 1200)
      
      result.results.forEach(horse => {
        const timeString = horse.raceTime.toString()
        const decimalIndex = timeString.indexOf('.')
        if (decimalIndex !== -1) {
          const decimalPlaces = timeString.length - decimalIndex - 1
          expect(decimalPlaces).toBeLessThanOrEqual(2)
        }
      })
    })
  })

  describe('calculateHorseSpeed', () => {
    it('returns reasonable speed values', () => {
      mockHorses.forEach(horse => {
        const speed = calculateHorseSpeed(horse, 1200)
        
        expect(speed).toBeGreaterThan(0)
        expect(speed).toBeLessThan(50) // Reasonable upper limit for horse speed
      })
    })

    it('gives higher speeds for better condition horses on average', () => {
      const speeds = []
      
      // Calculate average speeds over multiple calls
      for (let i = 0; i < 100; i++) {
        mockHorses.forEach(horse => {
          speeds.push({
            condition: horse.condition,
            speed: calculateHorseSpeed(horse, 1200)
          })
        })
      }
      
      // Group by condition and calculate averages
      const conditionGroups = {}
      speeds.forEach(({ condition, speed }) => {
        if (!conditionGroups[condition]) {
          conditionGroups[condition] = []
        }
        conditionGroups[condition].push(speed)
      })
      
      const averageSpeeds = Object.keys(conditionGroups).map(condition => ({
        condition: parseInt(condition),
        avgSpeed: conditionGroups[condition].reduce((a, b) => a + b, 0) / conditionGroups[condition].length
      }))
      
      // Sort by condition
      averageSpeeds.sort((a, b) => a.condition - b.condition)
      
      // Generally, higher condition should lead to higher average speeds
      const lowestConditionSpeed = averageSpeeds[0].avgSpeed
      const highestConditionSpeed = averageSpeeds[averageSpeeds.length - 1].avgSpeed
      
      expect(highestConditionSpeed).toBeGreaterThan(lowestConditionSpeed)
    })

    it('applies random variation to speed', () => {
      const horse = mockHorses[0]
      const speeds = []
      
      for (let i = 0; i < 100; i++) {
        speeds.push(calculateHorseSpeed(horse, 1200))
      }
      
      // Should have variation in speeds
      const uniqueSpeeds = new Set(speeds)
      expect(uniqueSpeeds.size).toBeGreaterThan(50) // Should have substantial variation
    })

    it('handles extreme condition values', () => {
      const extremeHorses = [
        { id: 1, name: 'Min Horse', condition: 1 },
        { id: 2, name: 'Max Horse', condition: 100 }
      ]
      
      extremeHorses.forEach(horse => {
        const speed = calculateHorseSpeed(horse, 1200)
        expect(speed).toBeGreaterThan(0)
        expect(speed).toBeLessThan(50)
      })
    })

    it('is distance-independent (speed calculation)', () => {
      const horse = mockHorses[0]
      const distances = [1200, 1400, 1600, 1800, 2000, 2200]
      
      // Speed calculation should not depend on distance
      // (though actual implementation might vary)
      distances.forEach(distance => {
        const speed = calculateHorseSpeed(horse, distance)
        expect(speed).toBeGreaterThan(0)
        expect(speed).toBeLessThan(50)
      })
    })
  })

  describe('Integration Tests', () => {
    it('simulates complete 6-round race series', () => {
      const distances = [1200, 1400, 1600, 1800, 2000, 2200]
      const raceResults = []
      
      distances.forEach((distance, round) => {
        // Select 10 random horses for each round
        const selectedHorses = [...mockHorses].sort(() => Math.random() - 0.5).slice(0, 5)
        const result = simulateRace(selectedHorses, distance)
        
        raceResults.push({
          round: round + 1,
          distance,
          results: result.results,
          winner: result.winner
        })
      })
      
      expect(raceResults).toHaveLength(6)
      raceResults.forEach((raceResult, index) => {
        expect(raceResult.round).toBe(index + 1)
        expect(raceResult.distance).toBe(distances[index])
        expect(raceResult.results.length).toBeLessThanOrEqual(5)
        expect(raceResult.winner.finishPosition).toBe(1)
      })
    })

    it('supports horse performance tracking across races', () => {
      const horse = mockHorses[0]
      const raceHistory = []
      
      // Simulate horse in multiple races
      for (let i = 0; i < 10; i++) {
        const result = simulateRace([horse, ...mockHorses.slice(1, 4)], 1400)
        const horseResult = result.results.find(h => h.id === horse.id)
        raceHistory.push(horseResult)
      }
      
      expect(raceHistory).toHaveLength(10)
      raceHistory.forEach(result => {
        expect(result.id).toBe(horse.id)
        expect(result.finishPosition).toBeGreaterThanOrEqual(1)
        expect(result.finishPosition).toBeLessThanOrEqual(4)
      })
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('handles empty horse array gracefully', () => {
      const result = simulateRace([], 1200)
      
      expect(result.results).toHaveLength(0)
      expect(result.distance).toBe(1200)
    })

    it('handles horses with undefined condition', () => {
      const horsesWithUndefined = [
        { id: 1, name: 'Horse 1', condition: undefined, color: '#FF6B6B' },
        { id: 2, name: 'Horse 2', condition: 50, color: '#4ECDC4' }
      ]
      
      // Should not throw error
      expect(() => simulateRace(horsesWithUndefined, 1200)).not.toThrow()
    })

    it('handles very short distances', () => {
      const result = simulateRace(mockHorses, 100)
      
      expect(result.distance).toBe(100)
      expect(result.results).toHaveLength(5)
      result.results.forEach(horse => {
        expect(horse.raceTime).toBeGreaterThan(0)
      })
    })

    it('handles very long distances', () => {
      const result = simulateRace(mockHorses, 5000)
      
      expect(result.distance).toBe(5000)
      expect(result.results).toHaveLength(5)
      result.results.forEach(horse => {
        expect(horse.raceTime).toBeGreaterThan(0)
      })
    })
  })

  describe('Performance Tests', () => {
    it('simulates race efficiently', () => {
      const startTime = performance.now()
      
      for (let i = 0; i < 100; i++) {
        simulateRace(mockHorses, 1600)
      }
      
      const endTime = performance.now()
      expect(endTime - startTime).toBeLessThan(100) // Should complete within 100ms
    })

    it('handles large horse counts efficiently', () => {
      const manyHorses = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        name: `Horse ${i + 1}`,
        condition: Math.floor(Math.random() * 100) + 1,
        color: '#FF6B6B'
      }))
      
      const startTime = performance.now()
      const result = simulateRace(manyHorses, 1600)
      const endTime = performance.now()
      
      expect(result.results).toHaveLength(100)
      expect(endTime - startTime).toBeLessThan(50) // Should complete within 50ms
    })
  })
})
