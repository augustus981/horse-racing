import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import RaceTrack from '@/components/RaceTrack.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

describe('RaceTrack.vue', () => {
  let store
  let state
  let getters

  beforeEach(() => {
    state = {
      currentRacePositions: [],
      isRacing: false
    }
    
    getters = {
      currentRaceData: () => null
    }
    
    store = new Vuex.Store({
      state,
      getters
    })
  })

  describe('Component Rendering', () => {
    it('renders race track header with default text', () => {
      const wrapper = shallowMount(RaceTrack, { store, localVue })
      expect(wrapper.find('.race-track-header h3').text()).toBe('Race Track')
    })

    it('renders all 10 lanes', () => {
      const wrapper = shallowMount(RaceTrack, { store, localVue })
      const lanes = wrapper.findAll('.lane')
      expect(lanes.length).toBe(10)
    })

    it('displays correct lane numbers', () => {
      const wrapper = shallowMount(RaceTrack, { store, localVue })
      const laneNumbers = wrapper.findAll('.lane-number')
      
      for (let i = 0; i < 10; i++) {
        expect(laneNumbers.at(i).text()).toBe(String(i + 1))
      }
    })

    it('renders finish line for each lane', () => {
      const wrapper = shallowMount(RaceTrack, { store, localVue })
      const finishLines = wrapper.findAll('.finish-line')
      expect(finishLines.length).toBe(10)
      finishLines.wrappers.forEach(finishLine => {
        expect(finishLine.text()).toBe('FINISH')
      })
    })
  })

  describe('Race Data Display', () => {
    it('displays race information when currentRaceData exists', () => {
      getters.currentRaceData = () => ({
        round: 1,
        distance: 1200,
        horses: [
          { id: 1, name: 'Horse 1', lane: 1, color: '#FF6B6B' },
          { id: 2, name: 'Horse 2', lane: 2, color: '#4ECDC4' }
        ]
      })
      
      store = new Vuex.Store({ state, getters })
      const wrapper = shallowMount(RaceTrack, { store, localVue })
      
      const headerText = wrapper.find('.race-track-header h3').text()
      expect(headerText).toContain('1st Lap - 1200m')
      expect(headerText).toContain('Paused') // Since isRacing is false by default
    })

    it('displays correct ordinal suffixes for rounds', () => {
      const wrapper = shallowMount(RaceTrack, { store, localVue })
      
      expect(wrapper.vm.getOrdinalSuffix(1)).toBe('st')
      expect(wrapper.vm.getOrdinalSuffix(2)).toBe('nd')
      expect(wrapper.vm.getOrdinalSuffix(3)).toBe('rd')
      expect(wrapper.vm.getOrdinalSuffix(4)).toBe('th')
      expect(wrapper.vm.getOrdinalSuffix(11)).toBe('th')
      expect(wrapper.vm.getOrdinalSuffix(21)).toBe('st')
      expect(wrapper.vm.getOrdinalSuffix(22)).toBe('nd')
    })

    it('shows racing status when racing is active', () => {
      state.isRacing = true
      getters.currentRaceData = () => ({
        round: 1,
        distance: 1200,
        horses: [
          { id: 1, name: 'Horse 1', lane: 1 },
          { id: 2, name: 'Horse 2', lane: 2 }
        ]
      })
      
      store = new Vuex.Store({ state, getters })
      const wrapper = shallowMount(RaceTrack, { store, localVue })
      
      const header = wrapper.find('.race-track-header h3')
      expect(header.text()).toContain('1st Lap - 1200m')
      expect(header.text()).toContain('Racing in progress')
    })

    it('shows paused status when not racing', () => {
      state.isRacing = false
      getters.currentRaceData = () => ({
        round: 1,
        distance: 1200,
        horses: [
          { id: 1, name: 'Horse 1', lane: 1 },
          { id: 2, name: 'Horse 2', lane: 2 }
        ]
      })
      
      store = new Vuex.Store({ state, getters })
      const wrapper = shallowMount(RaceTrack, { store, localVue })
      
      const header = wrapper.find('.race-track-header h3')
      expect(header.text()).toContain('1st Lap - 1200m')
      expect(header.text()).toContain('Paused')
    })

    it('does not show racing status when no race data exists', () => {
      state.isRacing = false
      getters.currentRaceData = () => null
      
      store = new Vuex.Store({ state, getters })
      const wrapper = shallowMount(RaceTrack, { store, localVue })
      
      const header = wrapper.find('.race-track-header h3')
      expect(header.text()).toBe('Race Track')
      expect(header.text()).not.toContain('Racing in progress')
      expect(header.text()).not.toContain('Paused')
    })
  })

  describe('Lane Activity', () => {
    it('marks lanes as active when horses are assigned', () => {
      getters.currentRaceData = () => ({
        horses: [
          { id: 1, name: 'Horse 1', lane: 1 },
          { id: 3, name: 'Horse 3', lane: 3 },
          { id: 5, name: 'Horse 5', lane: 5 }
        ]
      })
      
      store = new Vuex.Store({ state, getters })
      const wrapper = shallowMount(RaceTrack, { store, localVue })
      
      expect(wrapper.vm.isLaneActive(1)).toBe(true)
      expect(wrapper.vm.isLaneActive(2)).toBe(false)
      expect(wrapper.vm.isLaneActive(3)).toBe(true)
      expect(wrapper.vm.isLaneActive(4)).toBe(false)
      expect(wrapper.vm.isLaneActive(5)).toBe(true)
    })

    it('returns false for lane activity when no race data exists', () => {
      const wrapper = shallowMount(RaceTrack, { store, localVue })
      
      for (let i = 1; i <= 10; i++) {
        expect(wrapper.vm.isLaneActive(i)).toBe(false)
      }
    })
  })

  describe('Horse Positioning', () => {
    it('finds correct horse in lane from race data', () => {
      getters.currentRaceData = () => ({
        horses: [
          { id: 1, name: 'Horse 1', lane: 1, color: '#FF6B6B' },
          { id: 2, name: 'Horse 2', lane: 3, color: '#4ECDC4' }
        ]
      })
      
      store = new Vuex.Store({ state, getters })
      const wrapper = shallowMount(RaceTrack, { store, localVue })
      
      const horse1 = wrapper.vm.getHorseInLane(1)
      const horse2 = wrapper.vm.getHorseInLane(3)
      const noHorse = wrapper.vm.getHorseInLane(2)
      
      expect(horse1.name).toBe('Horse 1')
      expect(horse2.name).toBe('Horse 2')
      expect(noHorse).toBeUndefined()
    })

    it('finds horse from current race positions during animation', () => {
      state.currentRacePositions = [
        { id: 1, name: 'Horse 1', lane: 1, position: 500, color: '#FF6B6B' },
        { id: 2, name: 'Horse 2', lane: 2, position: 300, color: '#4ECDC4' }
      ]
      getters.currentRaceData = () => ({ 
        distance: 1200,
        horses: [
          { id: 1, name: 'Horse 1', lane: 1, color: '#FF6B6B' },
          { id: 2, name: 'Horse 2', lane: 2, color: '#4ECDC4' }
        ]
      })
      
      store = new Vuex.Store({ state, getters })
      const wrapper = shallowMount(RaceTrack, { store, localVue })
      
      const horse1 = wrapper.vm.getHorseInLane(1)
      expect(horse1.position).toBe(500)
      expect(horse1.name).toBe('Horse 1')
    })

    it('calculates horse position styles correctly', () => {
      state.currentRacePositions = [
        { id: 1, name: 'Horse 1', lane: 1, position: 600, color: '#FF6B6B' }
      ]
      getters.currentRaceData = () => ({ distance: 1200 })
      state.isRacing = true
      
      store = new Vuex.Store({ state, getters })
      const wrapper = shallowMount(RaceTrack, { store, localVue })
      
      // Mock the track container width
      wrapper.vm.$refs.trackContainer = { offsetWidth: 800 }
      
      const style = wrapper.vm.getHorseStyle(1)
      expect(style.transition).toBe('transform 0.1s linear')
      expect(style.transform).toContain('translateX(')
    })

    it('handles horse positioning when not racing', () => {
      getters.currentRaceData = () => ({
        horses: [{ id: 1, name: 'Horse 1', lane: 1, color: '#FF6B6B' }]
      })
      
      store = new Vuex.Store({ state, getters })
      const wrapper = shallowMount(RaceTrack, { store, localVue })
      
      const style = wrapper.vm.getHorseStyle(1)
      expect(style.transition).toBe('none')
      expect(style.transform).toBe('translateX(0px)')
    })
  })

  describe('Horse Visualization', () => {
    it('renders horse icons with correct colors', () => {
      getters.currentRaceData = () => ({
        horses: [
          { id: 1, name: 'Horse 1', lane: 1, color: '#FF6B6B' },
          { id: 2, name: 'Horse 2', lane: 2, color: '#4ECDC4' }
        ]
      })
      
      store = new Vuex.Store({ state, getters })
      const wrapper = shallowMount(RaceTrack, { store, localVue })
      
      const horseIcons = wrapper.findAll('.horse-icon')
      expect(horseIcons.length).toBe(2)
      expect(horseIcons.at(0).element.style.backgroundColor).toBe('rgb(255, 107, 107)')
      expect(horseIcons.at(1).element.style.backgroundColor).toBe('rgb(78, 205, 196)')
    })

    it('does not render horses in empty lanes', () => {
      getters.currentRaceData = () => ({
        horses: [{ id: 1, name: 'Horse 1', lane: 1, color: '#FF6B6B' }]
      })
      
      store = new Vuex.Store({ state, getters })
      const wrapper = shallowMount(RaceTrack, { store, localVue })
      
      const horses = wrapper.findAll('.horse')
      expect(horses.length).toBe(1)
    })
  })

  describe('Edge Cases', () => {
    it('handles missing track container reference', () => {
      state.currentRacePositions = [
        { id: 1, name: 'Horse 1', lane: 1, position: 600, color: '#FF6B6B' }
      ]
      getters.currentRaceData = () => ({ 
        distance: 1200,
        horses: [
          { id: 1, name: 'Horse 1', lane: 1, color: '#FF6B6B' }
        ]
      })
      
      store = new Vuex.Store({ state, getters })
      const wrapper = shallowMount(RaceTrack, { store, localVue })
      
      // Don't mock trackContainer to test fallback
      const style = wrapper.vm.getHorseStyle(1)
      expect(style.transform).toContain('translateX(')
    })

    it('handles horses without defined positions', () => {
      getters.currentRaceData = () => ({
        horses: [{ id: 1, name: 'Horse 1', lane: 1, color: '#FF6B6B' }]
      })
      
      store = new Vuex.Store({ state, getters })
      const wrapper = shallowMount(RaceTrack, { store, localVue })
      
      const style = wrapper.vm.getHorseStyle(1)
      expect(style.transform).toBe('translateX(0px)')
    })

    it('handles maximum number of horses (10)', () => {
      getters.currentRaceData = () => ({
        horses: Array.from({ length: 10 }, (_, i) => ({
          id: i + 1,
          name: `Horse ${i + 1}`,
          lane: i + 1,
          color: '#FF6B6B'
        }))
      })
      
      store = new Vuex.Store({ state, getters })
      const wrapper = shallowMount(RaceTrack, { store, localVue })
      
      const horses = wrapper.findAll('.horse')
      expect(horses.length).toBe(10)
      
      for (let i = 1; i <= 10; i++) {
        expect(wrapper.vm.isLaneActive(i)).toBe(true)
      }
    })

    it('handles race with different distances', () => {
      const distances = [1200, 1400, 1600, 1800, 2000, 2200]
      
      distances.forEach(distance => {
        getters.currentRaceData = () => ({
          round: 1,
          distance,
          horses: [{ id: 1, name: 'Horse 1', lane: 1 }]
        })
        
        store = new Vuex.Store({ state, getters })
        const wrapper = shallowMount(RaceTrack, { store, localVue })
        
        const headerText = wrapper.find('.race-track-header h3').text()
        expect(headerText).toContain(`1st Lap - ${distance}m`)
        expect(headerText).toContain('Paused') // Since isRacing is false by default
      })
    })
  })

  describe('Performance', () => {
    it('efficiently handles rapid position updates during racing', () => {
      state.isRacing = true
      state.currentRacePositions = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        name: `Horse ${i + 1}`,
        lane: i + 1,
        position: Math.random() * 1200,
        color: '#FF6B6B'
      }))
      getters.currentRaceData = () => ({ 
        distance: 1200,
        horses: Array.from({ length: 10 }, (_, i) => ({
          id: i + 1,
          name: `Horse ${i + 1}`,
          lane: i + 1,
          color: '#FF6B6B'
        }))
      })
      
      store = new Vuex.Store({ state, getters })
      const wrapper = shallowMount(RaceTrack, { store, localVue })
      
      // Simulate multiple rapid updates
      for (let i = 0; i < 50; i++) {
        state.currentRacePositions.forEach(horse => {
          horse.position = Math.min(1200, horse.position + Math.random() * 10)
        })
        wrapper.vm.$forceUpdate()
      }
      
      expect(wrapper.findAll('.horse').length).toBe(10)
    })
  })
})
