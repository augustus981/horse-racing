import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import RaceResults from '@/components/RaceResults.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

describe('RaceResults.vue', () => {
  let store
  let state

  beforeEach(() => {
    state = {
      raceProgram: [],
      raceResults: [],
      currentRound: 0,
      isRacing: false,
      hasProgram: false
    }
    
    store = new Vuex.Store({ state })
  })

  describe('Component Structure', () => {
    it('renders program and results headers', () => {
      const wrapper = shallowMount(RaceResults, { store, localVue })
      const headers = wrapper.findAll('.results-header h3')
      
      expect(headers.length).toBe(2)
      expect(headers.at(0).text()).toBe('Program')
      expect(headers.at(1).text()).toBe('Results')
    })

    it('displays no program message when hasProgram is false', () => {
      const wrapper = shallowMount(RaceResults, { store, localVue })
      const noProgram = wrapper.find('.no-program')
      
      expect(noProgram.exists()).toBe(true)
      expect(noProgram.text()).toContain('Click "GENERATE PROGRAM" to create race schedule')
    })

    it('displays no results message when no results exist', () => {
      const wrapper = shallowMount(RaceResults, { store, localVue })
      const noResults = wrapper.find('.no-results')
      
      expect(noResults.exists()).toBe(true)
      expect(noResults.text()).toContain('Race results will appear here')
    })
  })

  describe('Program Display', () => {
    beforeEach(() => {
      state.hasProgram = true
      state.raceProgram = [
        {
          round: 1,
          distance: 1200,
          horses: [
            { id: 1, name: 'Horse 1', lane: 1 },
            { id: 2, name: 'Horse 2', lane: 2 },
            { id: 3, name: 'Horse 3', lane: 3 },
            { id: 4, name: 'Horse 4', lane: 4 },
            { id: 5, name: 'Horse 5', lane: 5 },
            { id: 6, name: 'Horse 6', lane: 6 }
          ]
        },
        {
          round: 2,
          distance: 1400,
          horses: [
            { id: 7, name: 'Horse 7', lane: 1 },
            { id: 8, name: 'Horse 8', lane: 2 }
          ]
        }
      ]
      store = new Vuex.Store({ state })
    })

    it('displays all race programs', () => {
      const wrapper = shallowMount(RaceResults, { store, localVue })
      const programItems = wrapper.findAll('.program-item')
      
      expect(programItems.length).toBe(2)
    })

    it('shows correct program headers with ordinal suffixes', () => {
      const wrapper = shallowMount(RaceResults, { store, localVue })
      const programHeaders = wrapper.findAll('.program-header strong')
      
      expect(programHeaders.at(0).text()).toBe('1st Lap - 1200m')
      expect(programHeaders.at(1).text()).toBe('2nd Lap - 1400m')
    })

    it('displays all horses in each program', () => {
      const wrapper = shallowMount(RaceResults, { store, localVue })
      const firstProgramHorses = wrapper.findAll('.program-item').at(0).findAll('.program-horse')
      
      expect(firstProgramHorses.length).toBe(6) // First race has 6 horses in test data
      expect(firstProgramHorses.at(0).text()).toContain('1')
      expect(firstProgramHorses.at(0).text()).toContain('Horse 1')
    })

    it('shows all horses without truncation', () => {
      const wrapper = shallowMount(RaceResults, { store, localVue })
      const moreHorses = wrapper.find('.more-horses')
      
      expect(moreHorses.exists()).toBe(false) // No more-horses indicator since we show all
    })

    it('does not show "+X more" when 5 or fewer horses', () => {
      const wrapper = shallowMount(RaceResults, { store, localVue })
      const programItems = wrapper.findAll('.program-item')
      const secondProgramMoreHorses = programItems.at(1).find('.more-horses')
      
      expect(secondProgramMoreHorses.exists()).toBe(false)
    })

    it('marks current program as current during racing', () => {
      state.isRacing = true
      state.currentRound = 1
      store = new Vuex.Store({ state })
      
      const wrapper = shallowMount(RaceResults, { store, localVue })
      const programItems = wrapper.findAll('.program-item')
      
      expect(programItems.at(0).classes()).not.toContain('current')
      expect(programItems.at(1).classes()).toContain('current')
    })

    it('marks completed programs correctly', () => {
      state.raceResults = [
        { round: 1, distance: 1200, results: [] }
      ]
      store = new Vuex.Store({ state })
      
      const wrapper = shallowMount(RaceResults, { store, localVue })
      const programItems = wrapper.findAll('.program-item')
      
      expect(programItems.at(0).classes()).toContain('completed')
      expect(programItems.at(1).classes()).not.toContain('completed')
    })
  })

  describe('Results Display', () => {
    beforeEach(() => {
      state.raceResults = [
        {
          round: 1,
          distance: 1200,
          completedAt: '3:15:30 PM',
          results: [
            { id: 1, name: 'Winner Horse', raceTime: 45.32, finishPosition: 1 },
            { id: 2, name: 'Second Horse', raceTime: 45.87, finishPosition: 2 },
            { id: 3, name: 'Third Horse', raceTime: 46.12, finishPosition: 3 }
          ]
        },
        {
          round: 2,
          distance: 1400,
          completedAt: '3:18:45 PM',
          results: [
            { id: 4, name: 'Fast Horse', raceTime: 52.15, finishPosition: 1 },
            { id: 5, name: 'Quick Horse', raceTime: 52.78, finishPosition: 2 }
          ]
        }
      ]
      store = new Vuex.Store({ state })
    })

    it('displays all race results', () => {
      const wrapper = shallowMount(RaceResults, { store, localVue })
      const resultItems = wrapper.findAll('.result-item')
      
      expect(resultItems.length).toBe(2)
    })

    it('shows correct result headers with completion times', () => {
      const wrapper = shallowMount(RaceResults, { store, localVue })
      const resultHeaders = wrapper.findAll('.result-header')
      
      const firstHeader = resultHeaders.at(0)
      expect(firstHeader.find('strong').text()).toBe('1st Lap - 1200m')
      expect(firstHeader.find('.completion-time').text()).toBe('3:15:30 PM')
    })

    it('displays horse positions, names, and times correctly', () => {
      const wrapper = shallowMount(RaceResults, { store, localVue })
      const firstResult = wrapper.findAll('.result-item').at(0)
      const horses = firstResult.findAll('.result-horse')
      
      expect(horses.length).toBe(3)
      
      const firstPlace = horses.at(0)
      expect(firstPlace.find('.position').text()).toBe('1')
      expect(firstPlace.find('.name').text()).toBe('Winner Horse')
      expect(firstPlace.find('.time').text()).toBe('45.32s')
    })

    it('displays all horses in results', () => {
      // Create result with 15 horses
      state.raceResults = [{
        round: 1,
        distance: 1200,
        completedAt: '3:15:30 PM',
        results: Array.from({ length: 15 }, (_, i) => ({
          id: i + 1,
          name: `Horse ${i + 1}`,
          raceTime: 45 + i,
          finishPosition: i + 1
        }))
      }]
      store = new Vuex.Store({ state })
      
      const wrapper = shallowMount(RaceResults, { store, localVue })
      const horses = wrapper.findAll('.result-horse')
      
      expect(horses.length).toBe(15) // Now shows all horses
    })
  })

  describe('Ordinal Suffix Helper', () => {
    let wrapper

    beforeEach(() => {
      wrapper = shallowMount(RaceResults, { store, localVue })
    })

    it('returns correct suffixes for various numbers', () => {
      expect(wrapper.vm.getOrdinalSuffix(1)).toBe('st')
      expect(wrapper.vm.getOrdinalSuffix(2)).toBe('nd')
      expect(wrapper.vm.getOrdinalSuffix(3)).toBe('rd')
      expect(wrapper.vm.getOrdinalSuffix(4)).toBe('th')
      expect(wrapper.vm.getOrdinalSuffix(5)).toBe('th')
      expect(wrapper.vm.getOrdinalSuffix(10)).toBe('th')
    })

    it('handles special cases (11, 12, 13)', () => {
      expect(wrapper.vm.getOrdinalSuffix(11)).toBe('th')
      expect(wrapper.vm.getOrdinalSuffix(12)).toBe('th')
      expect(wrapper.vm.getOrdinalSuffix(13)).toBe('th')
    })

    it('handles numbers in twenties correctly', () => {
      expect(wrapper.vm.getOrdinalSuffix(21)).toBe('st')
      expect(wrapper.vm.getOrdinalSuffix(22)).toBe('nd')
      expect(wrapper.vm.getOrdinalSuffix(23)).toBe('rd')
      expect(wrapper.vm.getOrdinalSuffix(24)).toBe('th')
    })

    it('handles large numbers', () => {
      expect(wrapper.vm.getOrdinalSuffix(101)).toBe('st')
      expect(wrapper.vm.getOrdinalSuffix(1002)).toBe('nd')
      expect(wrapper.vm.getOrdinalSuffix(10003)).toBe('rd')
    })
  })

  describe('State Transitions', () => {
    it('transitions from no program to program display', async () => {
      const wrapper = shallowMount(RaceResults, { store, localVue })
      
      // Initially no program
      expect(wrapper.find('.no-program').exists()).toBe(true)
      expect(wrapper.find('.program-list').exists()).toBe(false)
      
      // Add program
      state.hasProgram = true
      state.raceProgram = [{
        round: 1,
        distance: 1200,
        horses: [{ id: 1, name: 'Horse 1', lane: 1 }]
      }]
      
      await wrapper.vm.$nextTick()
      
      expect(wrapper.find('.no-program').exists()).toBe(false)
      expect(wrapper.find('.program-list').exists()).toBe(true)
    })

    it('transitions from no results to results display', async () => {
      const wrapper = shallowMount(RaceResults, { store, localVue })
      
      // Initially no results
      expect(wrapper.find('.no-results').exists()).toBe(true)
      expect(wrapper.find('.results-list').exists()).toBe(false)
      
      // Add results
      state.raceResults = [{
        round: 1,
        distance: 1200,
        completedAt: '3:15:30 PM',
        results: [{ id: 1, name: 'Horse 1', raceTime: 45.32, finishPosition: 1 }]
      }]
      
      await wrapper.vm.$nextTick()
      
      expect(wrapper.find('.no-results').exists()).toBe(false)
      expect(wrapper.find('.results-list').exists()).toBe(true)
    })

    it('handles racing state changes correctly', async () => {
      state.hasProgram = true
      state.raceProgram = [
        { round: 1, distance: 1200, horses: [] },
        { round: 2, distance: 1400, horses: [] }
      ]
      state.currentRound = 1
      store = new Vuex.Store({ state })
      
      const wrapper = shallowMount(RaceResults, { store, localVue })
      
      // Start racing
      state.isRacing = true
      await wrapper.vm.$nextTick()
      
      const programItems = wrapper.findAll('.program-item')
      expect(programItems.at(1).classes()).toContain('current')
      
      // Stop racing
      state.isRacing = false
      await wrapper.vm.$nextTick()
      
      expect(programItems.at(1).classes()).not.toContain('current')
    })
  })

  describe('Edge Cases', () => {
    it('handles empty race program gracefully', () => {
      state.hasProgram = true
      state.raceProgram = []
      store = new Vuex.Store({ state })
      
      const wrapper = shallowMount(RaceResults, { store, localVue })
      const programItems = wrapper.findAll('.program-item')
      
      expect(programItems.length).toBe(0)
    })

    it('handles race results with no horses', () => {
      state.raceResults = [{
        round: 1,
        distance: 1200,
        completedAt: '3:15:30 PM',
        results: []
      }]
      store = new Vuex.Store({ state })
      
      const wrapper = shallowMount(RaceResults, { store, localVue })
      const horses = wrapper.findAll('.result-horse')
      
      expect(horses.length).toBe(0)
    })

    it('handles programs with exactly 5 horses', () => {
      state.hasProgram = true
      state.raceProgram = [{
        round: 1,
        distance: 1200,
        horses: Array.from({ length: 5 }, (_, i) => ({
          id: i + 1,
          name: `Horse ${i + 1}`,
          lane: i + 1
        }))
      }]
      store = new Vuex.Store({ state })
      
      const wrapper = shallowMount(RaceResults, { store, localVue })
      const programHorses = wrapper.findAll('.program-horse')
      const moreHorses = wrapper.find('.more-horses')
      
      expect(programHorses.length).toBe(5)
      expect(moreHorses.exists()).toBe(false)
    })

    it('handles missing completion time gracefully', () => {
      state.raceResults = [{
        round: 1,
        distance: 1200,
        results: [{ id: 1, name: 'Horse 1', raceTime: 45.32, finishPosition: 1 }]
      }]
      store = new Vuex.Store({ state })
      
      const wrapper = shallowMount(RaceResults, { store, localVue })
      const completionTime = wrapper.find('.completion-time')
      
      expect(completionTime.text()).toBe('')
    })
  })

  describe('Full Race Cycle', () => {
    it('displays complete 6-round race program and results', () => {
      const distances = [1200, 1400, 1600, 1800, 2000, 2200]
      
      state.hasProgram = true
      state.raceProgram = distances.map((distance, index) => ({
        round: index + 1,
        distance,
        horses: Array.from({ length: 10 }, (_, i) => ({
          id: i + 1,
          name: `Horse ${i + 1}`,
          lane: i + 1
        }))
      }))
      
      state.raceResults = distances.slice(0, 3).map((distance, index) => ({
        round: index + 1,
        distance,
        completedAt: `3:${15 + index * 3}:30 PM`,
        results: Array.from({ length: 10 }, (_, i) => ({
          id: i + 1,
          name: `Horse ${i + 1}`,
          raceTime: 45 + Math.random() * 10,
          finishPosition: i + 1
        }))
      }))
      
      store = new Vuex.Store({ state })
      const wrapper = shallowMount(RaceResults, { store, localVue })
      
      expect(wrapper.findAll('.program-item').length).toBe(6)
      expect(wrapper.findAll('.result-item').length).toBe(3)
      expect(wrapper.findAll('.program-item.completed').length).toBe(3)
    })
  })
})
