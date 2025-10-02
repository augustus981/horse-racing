import Vue from 'vue'
import Vuex from 'vuex'
import { generateHorses } from '@/utils/horseGenerator'
import { simulateRace } from '@/utils/raceSimulator'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    horses: [],
    raceProgram: [],
    raceResults: [],
    currentRound: 0,
    isRacing: false,
    hasProgram: false,
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

  actions: {
    generateProgram({ commit, state }) {
      const horses = generateHorses(20) // Generate 20 horses total
      commit('SET_HORSES', horses)
      
      const program = []
      const distances = state.raceDistances
      
      // Create 6 races, each selecting 10 horses randomly from the 20 available
      for (let i = 0; i < 6; i++) {
        // Shuffle horses and select first 10 for this race
        const shuffledHorses = [...horses].sort(() => Math.random() - 0.5)
        const raceHorses = shuffledHorses.slice(0, 10)
        
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
          await dispatch('runRaces')
        }
      }
    },

    async runRaces({ commit, state, dispatch }) {
      commit('SET_RACE_IN_PROGRESS', true)
      try {
        for (let i = state.currentRound; i < state.raceProgram.length; i++) {
          if (!state.isRacing) break
          commit('SET_CURRENT_ROUND', i)
          const raceData = state.raceProgram[i]
          const result = await dispatch('simulateRaceWithAnimation', raceData)
          commit('ADD_RACE_RESULT', result)
          if (i < state.raceProgram.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1500)) // Reduced since we have 1s pause at finish
          }
        }
      } finally {
        commit('SET_RACE_IN_PROGRESS', false)
        commit('SET_RACING_STATE', false)
        
        // If all races are completed, ensure we're at the final round
        if (state.raceResults.length >= state.raceProgram.length) {
          commit('SET_CURRENT_ROUND', state.raceProgram.length)
        }
      }
    },

    async simulateRaceWithAnimation({ commit, state }, raceData) {
      const { horses, distance, round } = raceData
      
      return new Promise((resolve) => {
        const result = simulateRace(horses, distance)
        const animationDuration = 5000 // 5 seconds per race
        const updateInterval = 100 // Update every 100ms
        const totalUpdates = animationDuration / updateInterval
        
        // Initialize horse speeds and positions
        const horseStates = horses.map((horse, index) => {
          const finalPosition = result.results.findIndex(r => r.id === horse.id) + 1
          const baseSpeed = distance / animationDuration * updateInterval
          const speedVariation = 0.8 + (Math.random() * 0.4)
          const actualSpeed = baseSpeed * speedVariation
          
          return {
            ...horse,
            position: 0,
            speed: actualSpeed,
            finalPosition,
            lane: index + 1
          }
        })
        
        let currentUpdate = 0
        
        const animationTimer = setInterval(() => {
          // If not racing, just skip this update
          if (!state.isRacing) {
            return
          }
          
          currentUpdate++
          const progress = currentUpdate / totalUpdates
          
          // Update positions - horses always move forward
          const positions = horseStates.map(horse => {
            let newPosition = horse.position + horse.speed
            
            // Add some realistic racing variation
            const speedVariation = 0.95 + (Math.random() * 0.1)
            horse.speed = horse.speed * speedVariation
            
            // Ensure horses don't exceed finish line until near the end
            if (progress < 0.9) {
              newPosition = Math.min(newPosition, distance * (progress + 0.1))
            }
            
            // Final sprint to finish line based on final position
            if (progress > 0.8) {
              const finishBonus = (1 / horse.finalPosition) * 0.1
              newPosition += (distance * finishBonus)
            }
            
            // Ensure horse reaches finish line but doesn't go beyond
            horse.position = Math.max(horse.position, Math.min(distance, newPosition))
            
            return {
              ...horse,
              position: horse.position
            }
          })
          
          commit('SET_CURRENT_RACE_POSITIONS', positions)
          
          // Check if all horses have reached the finish line
          const allHorsesFinished = positions.every(horse => horse.position >= distance)
          
          // End race when all horses finish OR time limit reached (whichever comes first)
          if (allHorsesFinished || currentUpdate >= totalUpdates) {
            // If not all horses finished, ensure they all reach the finish line
            if (!allHorsesFinished) {
              const finalPositions = positions.map(horse => ({
                ...horse,
                position: distance
              }))
              commit('SET_CURRENT_RACE_POSITIONS', finalPositions)
            }
            
            // Wait a moment to show horses at finish line
            setTimeout(() => {
              clearInterval(animationTimer)
              commit('SET_ANIMATION_TIMER', null)
              commit('SET_CURRENT_RACE_POSITIONS', [])
              resolve({
                round,
                distance,
                results: result.results,
                completedAt: new Date().toLocaleTimeString()
              })
            }, 1000) // 1 second pause at finish line
          }
        }, updateInterval)
        
        commit('SET_ANIMATION_TIMER', animationTimer)
      })
    }
  },

  getters: {
    currentRaceData: (state) => {
      return state.raceProgram[state.currentRound] || null
    },
    
    allRacesCompleted: (state) => {
      return state.raceProgram.length > 0 && state.raceResults.length >= state.raceProgram.length
    }
  }
})