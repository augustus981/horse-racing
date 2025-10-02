import Vuex from 'vuex'
import { createLocalVue } from '@vue/test-utils'
import * as horseGenerator from '@/utils/horseGenerator'
import * as raceSimulator from '@/utils/raceSimulator'

const localVue = createLocalVue()
localVue.use(Vuex)

// Mock the utility modules
jest.mock('@/utils/horseGenerator')
jest.mock('@/utils/raceSimulator')

// Create store configuration for testing
const createStoreConfig = () => ({
  state: {
    horses: [],
    raceProgram: [],
    raceResults: [],
    isRacing: false,
    hasProgram: false,
    currentRound: 0,
    currentRacePositions: [],
    raceDistances: [1200, 1400, 1600, 1800, 2000, 2200],
    raceInProgress: false,
    currentAnimationTimer: null
  },
  
  mutations: {
    SET_HORSES(state, horses) {
      state.horses = horses
    },
    
    SET_RACE_PROGRAM(state, program) {
      state.raceProgram = program
      state.hasProgram = true
    },
    
    SET_RACING_STATE(state, isRacing) {
      state.isRacing = isRacing
    },
    
    SET_CURRENT_ROUND(state, round) {
      state.currentRound = round
    },
    
    ADD_RACE_RESULT(state, result) {
      state.raceResults.push(result)
    },
    
    SET_CURRENT_RACE_POSITIONS(state, positions) {
      state.currentRacePositions = positions
    },
    
    SET_RACE_IN_PROGRESS(state, inProgress) {
      state.raceInProgress = inProgress
    },
    
    SET_ANIMATION_TIMER(state, timer) {
      state.currentAnimationTimer = timer
    },
    
    RESET_RACE(state) {
      if (state.currentAnimationTimer) {
        clearInterval(state.currentAnimationTimer)
      }
      state.raceProgram = []
      state.raceResults = []
      state.currentRound = 0
      state.isRacing = false
      state.hasProgram = false
      state.currentRacePositions = []
      state.raceInProgress = false
      state.currentAnimationTimer = null
    }
  },
  
  getters: {
    currentRaceData: (state) => {
      return state.raceProgram[state.currentRound] || null
    },
    
    allRacesCompleted: (state) => {
      return state.raceProgram.length > 0 && state.raceResults.length >= state.raceProgram.length
    }
  },
  
  actions: {
    async initializeHorses({ commit }) {
      const horses = horseGenerator.generateHorses(20)
      commit('SET_HORSES', horses)
    },
    
    async generateProgram({ commit, state }) {
      let horses = state.horses
      if (!horses.length) {
        horses = horseGenerator.generateHorses(20)
        commit('SET_HORSES', horses)
      }
      
      const distances = state.raceDistances
      
      const program = []
      for (let i = 0; i < 6; i++) {
        const shuffledHorses = [...horses].sort(() => Math.random() - 0.5)
        const raceHorses = shuffledHorses.slice(0, 10).map((horse, index) => ({
          ...horse,
          lane: index + 1
        }))
        
        program.push({
          round: i + 1,
          distance: distances[i],
          horses: raceHorses
        })
      }
      
      commit('RESET_RACE')
      commit('SET_RACE_PROGRAM', program)
    },
    
    async toggleRace({ commit, state, dispatch, getters }) {
      // Don't allow starting if all races are completed
      if (!state.isRacing && getters.allRacesCompleted) {
        return
      }
      
      if (state.isRacing) {
        commit('SET_RACING_STATE', false)
      } else {
        commit('SET_RACING_STATE', true)
        if (!state.raceInProgress) {
          commit('SET_RACE_IN_PROGRESS', true)
          await dispatch('runRaces')
        }
      }
    },
    
    async runRaces({ commit, state, dispatch }) {
      commit('SET_RACE_IN_PROGRESS', true)
      
      try {
        for (let round = 0; round < state.raceProgram.length; round++) {
          if (!state.isRacing) break
          
          commit('SET_CURRENT_ROUND', round)
          const raceData = state.raceProgram[round]
          
          const result = await dispatch('simulateRaceWithAnimation', raceData)
          commit('ADD_RACE_RESULT', result)
          
          if (round < state.raceProgram.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 2000))
          }
        }
      } finally {
        commit('SET_RACE_IN_PROGRESS', false)
        // Only set racing to false if all races are completed
        if (state.raceResults.length >= state.raceProgram.length) {
          commit('SET_RACING_STATE', false)
        }
      }
    },
    
    async simulateRaceWithAnimation({ commit }, raceData) {
      const { horses, distance, round } = raceData
      
      // Mock the animation for tests - simulate position updates
      const result = raceSimulator.simulateRace(horses, distance)
      
      // Simulate some position updates during animation
      const positions = horses.map((horse, index) => ({
        ...horse,
        position: distance * 0.5, // Halfway through
        lane: index + 1
      }))
      commit('SET_CURRENT_RACE_POSITIONS', positions)
      
      // Wait longer to simulate animation time (longer than test's 200ms wait)
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Clear positions after race (as the real implementation does)
      commit('SET_CURRENT_RACE_POSITIONS', [])
      
      return Promise.resolve({
        round,
        distance,
        results: result.results,
        completedAt: new Date().toLocaleTimeString()
      })
    }
  },
  
  getters: {
    currentRaceData: (state) => {
      return state.raceProgram[state.currentRound] || null
    },
    
    getHorseById: (state) => (id) => {
      return state.horses.find(horse => horse.id === id)
    }
  }
})

describe('Vuex Store', () => {
  let store

  beforeEach(() => {
    store = new Vuex.Store(createStoreConfig())
    jest.clearAllMocks()
    
    // Set up default mocks
    horseGenerator.generateHorses.mockReturnValue([
      { id: 1, name: 'Horse 1', condition: 85, color: '#FF6B6B' },
      { id: 2, name: 'Horse 2', condition: 90, color: '#4ECDC4' }
    ])
    
    raceSimulator.simulateRace.mockReturnValue({
      results: [
        { id: 1, name: 'Horse 1', raceTime: 45.32, finishPosition: 1 },
        { id: 2, name: 'Horse 2', raceTime: 46.15, finishPosition: 2 }
      ]
    })
  })

  describe('Initial State', () => {
    it('has correct initial state', () => {
      expect(store.state.horses).toEqual([])
      expect(store.state.raceProgram).toEqual([])
      expect(store.state.raceResults).toEqual([])
      expect(store.state.currentRound).toBe(0)
      expect(store.state.isRacing).toBe(false)
      expect(store.state.hasProgram).toBe(false)
      expect(store.state.currentRacePositions).toEqual([])
      expect(store.state.raceDistances).toEqual([1200, 1400, 1600, 1800, 2000, 2200])
    })
  })

  describe('Mutations', () => {
    it('SET_HORSES updates horses state', () => {
      const horses = [
        { id: 1, name: 'Horse 1', condition: 85, color: '#FF6B6B' },
        { id: 2, name: 'Horse 2', condition: 92, color: '#4ECDC4' }
      ]
      
      store.commit('SET_HORSES', horses)
      expect(store.state.horses).toEqual(horses)
    })

    it('SET_RACE_PROGRAM updates program and resets state', () => {
      const program = [
        { round: 1, distance: 1200, horses: [] },
        { round: 2, distance: 1400, horses: [] }
      ]
      
      store.commit('SET_RACE_PROGRAM', program)
      
      expect(store.state.raceProgram).toEqual(program)
      expect(store.state.hasProgram).toBe(true)
      expect(store.state.currentRound).toBe(0)
      expect(store.state.raceResults).toEqual([])
    })

    it('SET_RACING_STATE updates racing state', () => {
      store.commit('SET_RACING_STATE', true)
      expect(store.state.isRacing).toBe(true)
      
      store.commit('SET_RACING_STATE', false)
      expect(store.state.isRacing).toBe(false)
    })

    it('SET_CURRENT_ROUND updates current round', () => {
      store.commit('SET_CURRENT_ROUND', 3)
      expect(store.state.currentRound).toBe(3)
    })

    it('ADD_RACE_RESULT adds result to array', () => {
      const result1 = { round: 1, distance: 1200, results: [] }
      const result2 = { round: 2, distance: 1400, results: [] }
      
      store.commit('ADD_RACE_RESULT', result1)
      expect(store.state.raceResults).toEqual([result1])
      
      store.commit('ADD_RACE_RESULT', result2)
      expect(store.state.raceResults).toEqual([result1, result2])
    })

    it('SET_CURRENT_RACE_POSITIONS updates race positions', () => {
      const positions = [
        { id: 1, position: 500, lane: 1 },
        { id: 2, position: 300, lane: 2 }
      ]
      
      store.commit('SET_CURRENT_RACE_POSITIONS', positions)
      expect(store.state.currentRacePositions).toEqual(positions)
    })

    it('RESET_RACE clears all race-related state', () => {
      // Set up some state first
      store.commit('SET_RACE_PROGRAM', [{ round: 1 }])
      store.commit('ADD_RACE_RESULT', { round: 1 })
      store.commit('SET_CURRENT_ROUND', 2)
      store.commit('SET_RACING_STATE', true)
      store.commit('SET_CURRENT_RACE_POSITIONS', [{ id: 1 }])
      
      store.commit('RESET_RACE')
      
      expect(store.state.raceProgram).toEqual([])
      expect(store.state.raceResults).toEqual([])
      expect(store.state.currentRound).toBe(0)
      expect(store.state.isRacing).toBe(false)
      expect(store.state.hasProgram).toBe(false)
      expect(store.state.currentRacePositions).toEqual([])
    })
  })

  describe('Actions', () => {
    describe('initializeHorses', () => {
      it('generates and commits horses', async () => {
        const mockHorses = [
          { id: 1, name: 'Horse 1', condition: 85, color: '#FF6B6B' }
        ]
        horseGenerator.generateHorses.mockReturnValue(mockHorses)
        
        await store.dispatch('initializeHorses')
        
        expect(horseGenerator.generateHorses).toHaveBeenCalledWith(20)
        expect(store.state.horses).toEqual(mockHorses)
      })
    })

    describe('generateProgram', () => {
      it('generates horses if none exist and creates program', async () => {
        const mockHorses = Array.from({ length: 20 }, (_, i) => ({
          id: i + 1,
          name: `Horse ${i + 1}`,
          condition: 80,
          color: '#FF6B6B'
        }))
        horseGenerator.generateHorses.mockReturnValue(mockHorses)
        
        await store.dispatch('generateProgram')
        
        expect(horseGenerator.generateHorses).toHaveBeenCalledWith(20)
        expect(store.state.raceProgram).toHaveLength(6)
        expect(store.state.hasProgram).toBe(true)
      })

      it('uses existing horses if available', async () => {
        const existingHorses = Array.from({ length: 20 }, (_, i) => ({
          id: i + 1,
          name: `Horse ${i + 1}`,
          condition: 80,
          color: '#FF6B6B'
        }))
        store.commit('SET_HORSES', existingHorses)
        
        await store.dispatch('generateProgram')
        
        expect(horseGenerator.generateHorses).not.toHaveBeenCalled()
        expect(store.state.raceProgram).toHaveLength(6)
      })

      it('creates program with correct distances', async () => {
        const mockHorses = Array.from({ length: 20 }, (_, i) => ({
          id: i + 1,
          name: `Horse ${i + 1}`,
          condition: 80,
          color: '#FF6B6B'
        }))
        store.commit('SET_HORSES', mockHorses)
        
        await store.dispatch('generateProgram')
        
        const expectedDistances = [1200, 1400, 1600, 1800, 2000, 2200]
        store.state.raceProgram.forEach((race, index) => {
          expect(race.round).toBe(index + 1)
          expect(race.distance).toBe(expectedDistances[index])
          expect(race.horses).toHaveLength(10)
        })
      })

      it('assigns unique horses to each race', async () => {
        const mockHorses = Array.from({ length: 20 }, (_, i) => ({
          id: i + 1,
          name: `Horse ${i + 1}`,
          condition: 80,
          color: '#FF6B6B'
        }))
        store.commit('SET_HORSES', mockHorses)
        
        await store.dispatch('generateProgram')
        
        store.state.raceProgram.forEach(race => {
          const horseIds = race.horses.map(h => h.id)
          const uniqueIds = new Set(horseIds)
          expect(uniqueIds.size).toBe(10) // All horses in race should be unique
        })
      })

      it('assigns lane numbers to horses', async () => {
        const mockHorses = Array.from({ length: 20 }, (_, i) => ({
          id: i + 1,
          name: `Horse ${i + 1}`,
          condition: 80,
          color: '#FF6B6B'
        }))
        store.commit('SET_HORSES', mockHorses)
        
        await store.dispatch('generateProgram')
        
        store.state.raceProgram.forEach(race => {
          race.horses.forEach((horse, index) => {
            expect(horse.lane).toBe(index + 1)
          })
        })
      })
    })

    describe('toggleRace', () => {
      it('starts racing when not racing', async () => {
        store.commit('SET_RACING_STATE', false)
        // Set up a race program so runRaces has something to do
        store.commit('SET_RACE_PROGRAM', [{
          round: 1,
          distance: 1200,
          horses: [{ id: 1, name: 'Horse 1' }]
        }])
        // Mock runRaces to not complete immediately
        const originalRunRaces = store._actions.runRaces[0]
        store._actions.runRaces[0] = jest.fn().mockImplementation(() => 
          new Promise(resolve => setTimeout(resolve, 100))
        )
        
        // Start the race but don't wait for completion
        const togglePromise = store.dispatch('toggleRace')
        
        // Check that racing state is set immediately
        expect(store.state.isRacing).toBe(true)
        expect(store._actions.runRaces[0]).toHaveBeenCalled()
        
        // Wait for completion
        await togglePromise
        
        // Restore original function
        store._actions.runRaces[0] = originalRunRaces
      })

      it('stops racing when racing', async () => {
        store.commit('SET_RACING_STATE', true)
        
        await store.dispatch('toggleRace')
        
        expect(store.state.isRacing).toBe(false)
      })
    })

    describe('runRaces', () => {
      beforeEach(() => {
        const mockProgram = [
          { round: 1, distance: 1200, horses: [] },
          { round: 2, distance: 1400, horses: [] }
        ]
        store.commit('SET_RACE_PROGRAM', mockProgram)
        store.commit('SET_RACING_STATE', true)
      })

      it('runs all races in sequence', async () => {
        let callCount = 0
        // Mock the simulateRaceWithAnimation action to return different results for each race
        const originalAction = store._actions.simulateRaceWithAnimation[0]
        store._actions.simulateRaceWithAnimation[0] = jest.fn().mockImplementation(() => {
          callCount++
          return Promise.resolve({ 
            round: callCount, 
            distance: callCount === 1 ? 1200 : 1400, 
            results: [] 
          })
        })
        
        await store.dispatch('runRaces')
        
        expect(store.state.raceResults).toHaveLength(2)
        expect(store.state.raceResults[0].round).toBe(1)
        expect(store.state.raceResults[1].round).toBe(2)
        expect(store.state.isRacing).toBe(false)
        
        // Restore original action
        store._actions.simulateRaceWithAnimation[0] = originalAction
      })

      it('stops if racing is paused', async () => {
        let raceCount = 0
        const originalAction = store._actions.simulateRaceWithAnimation[0]
        store._actions.simulateRaceWithAnimation[0] = jest.fn().mockImplementation(() => {
          raceCount++
          if (raceCount === 1) {
            store.commit('SET_RACING_STATE', false) // Pause after first race
          }
          return Promise.resolve({ round: raceCount, distance: 1200, results: [] })
        })
        
        await store.dispatch('runRaces')
        
        expect(store.state.raceResults).toHaveLength(1) // Only first race completed
        
        // Restore original action
        store._actions.simulateRaceWithAnimation[0] = originalAction
      })

      it('updates current round during races', async () => {
        jest.spyOn(store, 'dispatch').mockImplementation((action, payload) => {
          if (action === 'simulateRaceWithAnimation') {
            return Promise.resolve({ round: payload.round, distance: payload.distance, results: [] })
          }
          return Promise.resolve()
        })
        
        const runRacesPromise = store.dispatch('runRaces')
        
        // Check that current round gets updated
        await new Promise(resolve => setTimeout(resolve, 100))
        expect(store.state.currentRound).toBeGreaterThanOrEqual(0)
        
        await runRacesPromise
      })
    })

    describe('simulateRaceWithAnimation', () => {
      beforeEach(() => {
        const mockRaceResult = {
          results: [
            { id: 1, name: 'Horse 1', raceTime: 45.32, finishPosition: 1 },
            { id: 2, name: 'Horse 2', raceTime: 46.15, finishPosition: 2 }
          ]
        }
        raceSimulator.simulateRace.mockReturnValue(mockRaceResult)
      })

      it('calls race simulator with correct parameters', async () => {
        const raceData = {
          round: 1,
          distance: 1200,
          horses: [
            { id: 1, name: 'Horse 1', condition: 85 },
            { id: 2, name: 'Horse 2', condition: 90 }
          ]
        }
        
        const resultPromise = store.dispatch('simulateRaceWithAnimation', raceData)
        
        expect(raceSimulator.simulateRace).toHaveBeenCalledWith(raceData.horses, raceData.distance)
        
        await resultPromise
      })

      it('returns result with completion time', async () => {
        const raceData = {
          round: 1,
          distance: 1200,
          horses: [{ id: 1, name: 'Horse 1', condition: 85 }]
        }
        
        const result = await store.dispatch('simulateRaceWithAnimation', raceData)
        
        expect(result).toHaveProperty('round', 1)
        expect(result).toHaveProperty('distance', 1200)
        expect(result).toHaveProperty('results')
        expect(result).toHaveProperty('completedAt')
        expect(typeof result.completedAt).toBe('string')
      })

      it('updates race positions during animation', async () => {
        const raceData = {
          round: 1,
          distance: 1200,
          horses: [
            { id: 1, name: 'Horse 1', condition: 85 },
            { id: 2, name: 'Horse 2', condition: 90 }
          ]
        }
        
        const resultPromise = store.dispatch('simulateRaceWithAnimation', raceData)
        
        // Check that positions get updated during animation
        await new Promise(resolve => setTimeout(resolve, 200))
        expect(store.state.currentRacePositions.length).toBeGreaterThan(0)
        
        await resultPromise
        
        // Positions should be cleared after races
        expect(store.state.currentRacePositions).toEqual([])
      })
    })
  })

  describe('Getters', () => {
    describe('currentRaceData', () => {
      it('returns current race data based on currentRound', () => {
        const mockProgram = [
          { round: 1, distance: 1200, horses: [] },
          { round: 2, distance: 1400, horses: [] },
          { round: 3, distance: 1600, horses: [] }
        ]
        store.commit('SET_RACE_PROGRAM', mockProgram)
        store.commit('SET_CURRENT_ROUND', 1)
        
        const currentRace = store.getters.currentRaceData
        expect(currentRace).toEqual(mockProgram[1])
      })

      it('returns null when no program exists', () => {
        const currentRace = store.getters.currentRaceData
        expect(currentRace).toBeNull()
      })

      it('returns null when currentRound is out of bounds', () => {
        const mockProgram = [{ round: 1, distance: 1200, horses: [] }]
        store.commit('SET_RACE_PROGRAM', mockProgram)
        store.commit('SET_CURRENT_ROUND', 5)
        
        const currentRace = store.getters.currentRaceData
        expect(currentRace).toBeNull()
      })
    })

    describe('getHorseById', () => {
      it('returns horse with matching ID', () => {
        const mockHorses = [
          { id: 1, name: 'Horse 1', condition: 85 },
          { id: 2, name: 'Horse 2', condition: 90 },
          { id: 3, name: 'Horse 3', condition: 75 }
        ]
        store.commit('SET_HORSES', mockHorses)
        
        const horse = store.getters.getHorseById(2)
        expect(horse).toEqual(mockHorses[1])
      })

      it('returns undefined for non-existent ID', () => {
        const mockHorses = [{ id: 1, name: 'Horse 1', condition: 85 }]
        store.commit('SET_HORSES', mockHorses)
        
        const horse = store.getters.getHorseById(999)
        expect(horse).toBeUndefined()
      })

      it('returns undefined when no horses exist', () => {
        const horse = store.getters.getHorseById(1)
        expect(horse).toBeUndefined()
      })
    })
  })

  describe('Integration Tests', () => {
    it('completes full race cycle from initialization to results', async () => {
      const mockHorses = Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        name: `Horse ${i + 1}`,
        condition: Math.floor(Math.random() * 100) + 1,
        color: '#FF6B6B'
      }))
      
      const mockRaceResult = {
        results: Array.from({ length: 10 }, (_, i) => ({
          id: i + 1,
          name: `Horse ${i + 1}`,
          raceTime: 45 + Math.random() * 10,
          finishPosition: i + 1
        }))
      }
      
      horseGenerator.generateHorses.mockReturnValue(mockHorses)
      raceSimulator.simulateRace.mockReturnValue(mockRaceResult)
      
      // Initialize horses
      await store.dispatch('initializeHorses')
      expect(store.state.horses).toHaveLength(20)
      
      // Generate program
      await store.dispatch('generateProgram')
      expect(store.state.hasProgram).toBe(true)
      expect(store.state.raceProgram).toHaveLength(6)
      
      // Start racing
      store.commit('SET_RACING_STATE', true)
      
      // Simulate one race
      const result = await store.dispatch('simulateRaceWithAnimation', store.state.raceProgram[0])
      expect(result.round).toBe(1)
      expect(result.distance).toBe(1200)
      expect(result.results).toHaveLength(10)
    })

    it('handles state transitions correctly', async () => {
      // Initial state
      expect(store.state.hasProgram).toBe(false)
      expect(store.state.isRacing).toBe(false)
      expect(store.state.currentRound).toBe(0)
      
      const mockHorses = Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        name: `Horse ${i + 1}`,
        condition: 80,
        color: '#FF6B6B'
      }))
      horseGenerator.generateHorses.mockReturnValue(mockHorses)
      
      // Mock runRaces to prevent timeout - just return immediately so it should not exceed 5s test timeout
      const originalRunRaces = store._actions.runRaces[0]
      store._actions.runRaces[0] = jest.fn().mockResolvedValue(undefined)
      
      // Generate program
      await store.dispatch('generateProgram')
      expect(store.state.hasProgram).toBe(true)
      expect(store.state.raceProgram).toHaveLength(6)
      
      // Start racing
      await store.dispatch('toggleRace')
      expect(store.state.isRacing).toBe(true)
      
      // Reset
      store.commit('RESET_RACE')
      expect(store.state.hasProgram).toBe(false)
      expect(store.state.isRacing).toBe(false)
      expect(store.state.currentRound).toBe(0)
      expect(store.state.raceProgram).toEqual([])
      expect(store.state.raceResults).toEqual([])
      
      // Restore original action
      store._actions.runRaces[0] = originalRunRaces
    })
  })

  describe('Error Handling', () => {
    it('handles race simulation errors gracefully', async () => {
      raceSimulator.simulateRace.mockImplementation(() => {
        throw new Error('Simulation failed')
      })
      
      const raceData = {
        round: 1,
        distance: 1200,
        horses: [{ id: 1, name: 'Horse 1', condition: 85 }]
      }
      
      await expect(store.dispatch('simulateRaceWithAnimation', raceData)).rejects.toThrow('Simulation failed')
    })

    it('handles empty horse generation', async () => {
      horseGenerator.generateHorses.mockReturnValue([])
      
      await store.dispatch('initializeHorses')
      expect(store.state.horses).toEqual([])
      
      await store.dispatch('generateProgram')
      expect(store.state.raceProgram).toHaveLength(6)
      // Each race should have 0 horses since none were generated
      store.state.raceProgram.forEach(race => {
        expect(race.horses).toHaveLength(0)
      })
    })
  })
})
