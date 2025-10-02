import { generateHorses, generateHorseNames } from '@/utils/horseGenerator'

describe('horseGenerator.js', () => {
  describe('generateHorses', () => {
    it('generates default 20 horses when no count specified', () => {
      const horses = generateHorses()
      expect(horses).toHaveLength(20)
    })

    it('generates specified number of horses', () => {
      const horses = generateHorses(5)
      expect(horses).toHaveLength(5)
    })

    it('generates horses with required properties', () => {
      const horses = generateHorses(3)
      
      horses.forEach(horse => {
        expect(horse).toHaveProperty('id')
        expect(horse).toHaveProperty('name')
        expect(horse).toHaveProperty('condition')
        expect(horse).toHaveProperty('color')
        expect(horse).toHaveProperty('totalRaces')
        expect(horse).toHaveProperty('wins')
        expect(horse).toHaveProperty('winRate')
      })
    })

    it('generates horses with unique sequential IDs', () => {
      const horses = generateHorses(10)
      const ids = horses.map(horse => horse.id)
      
      expect(ids).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    })

    it('generates horses with unique names (up to available names)', () => {
      const horses = generateHorses(20)
      const names = horses.map(horse => horse.name)
      const uniqueNames = new Set(names)
      
      expect(uniqueNames.size).toBe(20) // All names should be unique
    })

    it('generates horses with unique colors (up to available colors)', () => {
      const horses = generateHorses(20)
      const colors = horses.map(horse => horse.color)
      const uniqueColors = new Set(colors)
      
      expect(uniqueColors.size).toBe(20) // All colors should be unique
    })

    it('generates condition scores within valid range (1-100)', () => {
      const horses = generateHorses(50) // Test with more horses for better randomness coverage
      
      horses.forEach(horse => {
        expect(horse.condition).toBeGreaterThanOrEqual(1)
        expect(horse.condition).toBeLessThanOrEqual(100)
        expect(Number.isInteger(horse.condition)).toBe(true)
      })
    })

    it('initializes racing statistics to zero', () => {
      const horses = generateHorses(5)
      
      horses.forEach(horse => {
        expect(horse.totalRaces).toBe(0)
        expect(horse.wins).toBe(0)
        expect(horse.winRate).toBe(0)
      })
    })

    it('generates valid hex color codes', () => {
      const horses = generateHorses(20)
      const hexColorRegex = /^#[0-9A-F]{6}$/i
      
      horses.forEach(horse => {
        expect(hexColorRegex.test(horse.color)).toBe(true)
      })
    })

    it('uses predefined horse names from the list', () => {
      const horses = generateHorses(20)
      const expectedNames = [
        'Ada Lovelace', 'Grace Hopper', 'Margaret Hamilton', 'Joan Clarke',
        'Lightning Bolt', 'Thunder Strike', 'Storm Chaser', 'Wind Runner',
        'Fire Blaze', 'Star Dancer', 'Moon Walker', 'Sun Rider',
        'Ocean Wave', 'Mountain Peak', 'Desert Wind', 'Forest Spirit',
        'Golden Arrow', 'Silver Bullet', 'Bronze Medal', 'Diamond Dust'
      ]
      
      horses.forEach((horse, index) => {
        expect(horse.name).toBe(expectedNames[index])
      })
    })

    it('handles edge case of generating 0 horses', () => {
      const horses = generateHorses(0)
      expect(horses).toHaveLength(0)
      expect(Array.isArray(horses)).toBe(true)
    })

    it('handles edge case of generating 1 horse', () => {
      const horses = generateHorses(1)
      expect(horses).toHaveLength(1)
      expect(horses[0].id).toBe(1)
      expect(horses[0].name).toBe('Ada Lovelace')
    })

    it('generates different condition scores for multiple calls', () => {
      const horses1 = generateHorses(20)
      const horses2 = generateHorses(20)
      
      const conditions1 = horses1.map(h => h.condition)
      const conditions2 = horses2.map(h => h.condition)
      
      // Very unlikely to get identical condition arrays if truly random
      expect(conditions1).not.toEqual(conditions2)
    })

    it('maintains consistency in names and colors across calls', () => {
      const horses1 = generateHorses(10)
      const horses2 = generateHorses(10)
      
      horses1.forEach((horse, index) => {
        expect(horse.name).toBe(horses2[index].name)
        expect(horse.color).toBe(horses2[index].color)
      })
    })

    it('handles requests for more horses than available names/colors', () => {
      // We have 20 predefined names and colors
      const horses = generateHorses(25)
      expect(horses).toHaveLength(25)
      
      // First 20 should have unique names and colors
      const first20Names = horses.slice(0, 20).map(h => h.name)
      const first20Colors = horses.slice(0, 20).map(h => h.color)
      
      expect(new Set(first20Names).size).toBe(20)
      expect(new Set(first20Colors).size).toBe(20)
    })
  })

  describe('generateHorseNames', () => {
    it('returns the predefined horse names array', () => {
      const names = generateHorseNames()
      
      expect(Array.isArray(names)).toBe(true)
      expect(names).toHaveLength(20)
    })

    it('returns names in expected order', () => {
      const names = generateHorseNames()
      
      expect(names[0]).toBe('Ada Lovelace')
      expect(names[1]).toBe('Grace Hopper')
      expect(names[2]).toBe('Margaret Hamilton')
      expect(names[3]).toBe('Joan Clarke')
    })

    it('includes tech pioneer names', () => {
      const names = generateHorseNames()
      const techPioneers = ['Ada Lovelace', 'Grace Hopper', 'Margaret Hamilton', 'Joan Clarke']
      
      techPioneers.forEach(name => {
        expect(names).toContain(name)
      })
    })

    it('includes racing-themed names', () => {
      const names = generateHorseNames()
      const racingNames = ['Lightning Bolt', 'Thunder Strike', 'Storm Chaser', 'Wind Runner']
      
      racingNames.forEach(name => {
        expect(names).toContain(name)
      })
    })

    it('returns the same array on multiple calls', () => {
      const names1 = generateHorseNames()
      const names2 = generateHorseNames()
      
      expect(names1).toEqual(names2)
    })
  })

  describe('Integration Tests', () => {
    it('generates a complete racing roster with proper diversity', () => {
      const horses = generateHorses(20)
      
      // Check condition distribution
      const lowCondition = horses.filter(h => h.condition <= 33).length
      const mediumCondition = horses.filter(h => h.condition > 33 && h.condition <= 66).length
      const highCondition = horses.filter(h => h.condition > 66).length
      
      // Should have some distribution across condition ranges (not all in one category)
      expect(lowCondition + mediumCondition + highCondition).toBe(20)
      expect(lowCondition).toBeGreaterThan(0)
      expect(highCondition).toBeGreaterThan(0)
    })

    it('generates data suitable for race simulation', () => {
      const horses = generateHorses(20)
      
      // Verify all horses can be used in race selection
      horses.forEach(horse => {
        expect(typeof horse.id === 'number').toBe(true)
        expect(typeof horse.name === 'string').toBe(true)
        expect(typeof horse.condition === 'number').toBe(true)
        expect(typeof horse.color === 'string').toBe(true)
        expect(horse.name.length).toBeGreaterThan(0)
        expect(horse.color.length).toBe(7) // #RRGGBB format
      })
    })

    it('supports selecting random subsets for races', () => {
      const horses = generateHorses(20)
      
      // Simulate selecting 10 random horses for a race
      const shuffled = [...horses].sort(() => Math.random() - 0.5)
      const raceHorses = shuffled.slice(0, 10)
      
      expect(raceHorses).toHaveLength(10)
      expect(new Set(raceHorses.map(h => h.id)).size).toBe(10) // All unique
    })
  })

  describe('Performance Tests', () => {
    it('generates horses efficiently for large numbers', () => {
      const startTime = performance.now()
      const horses = generateHorses(1000)
      const endTime = performance.now()
      
      expect(horses).toHaveLength(1000)
      expect(endTime - startTime).toBeLessThan(100) // Should complete within 100ms
    })

    it('handles multiple rapid generations without issues', () => {
      const results = []
      
      for (let i = 0; i < 100; i++) {
        results.push(generateHorses(5))
      }
      
      expect(results).toHaveLength(100)
      results.forEach(horses => {
        expect(horses).toHaveLength(5)
      })
    })
  })
})
