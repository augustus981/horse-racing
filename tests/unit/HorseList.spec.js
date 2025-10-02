import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import HorseList from '@/components/HorseList.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

describe('HorseList.vue', () => {
  let store
  let actions
  let state
  let getters

  beforeEach(() => {
    state = {
      horses: [
        { id: 1, name: 'Test Horse', condition: 85, color: '#FF6B6B' },
        { id: 2, name: 'Another Horse', condition: 92, color: '#4ECDC4' },
        { id: 3, name: 'Racing Star', condition: 75, color: '#45B7D1' }
      ],
      currentRacePositions: []
    }
    
    actions = {
      initializeHorses: jest.fn()
    }

    getters = {
      currentRaceData: () => null
    }
    
    store = new Vuex.Store({
      state,
      actions,
      getters
    })
  })

  describe('Component Rendering', () => {
    it('renders horse list header correctly', () => {
      const wrapper = shallowMount(HorseList, { store, localVue })
      expect(wrapper.find('.horse-list-header h3').text()).toBe('Horse List (1- 20)')
    })

    it('renders table headers correctly', () => {
      const wrapper = shallowMount(HorseList, { store, localVue })
      const headers = wrapper.findAll('.table-header .col-name, .table-header .col-condition, .table-header .col-color')
      expect(headers.at(0).text()).toBe('Name')
      expect(headers.at(1).text()).toBe('Condition')
      expect(headers.at(2).text()).toBe('Color')
    })

    it('displays correct number of horses from store', () => {
      const wrapper = shallowMount(HorseList, { store, localVue })
      const horseRows = wrapper.findAll('.horse-row')
      expect(horseRows.length).toBe(3)
    })

    it('displays horse information correctly', () => {
      const wrapper = shallowMount(HorseList, { store, localVue })
      const firstRow = wrapper.findAll('.horse-row').at(0)
      
      expect(firstRow.find('.col-name').text()).toBe('Test Horse')
      expect(firstRow.find('.col-condition').text()).toBe('85')
      expect(firstRow.find('.color-indicator').element.style.backgroundColor).toBe('rgb(255, 107, 107)')
    })

    it('renders color indicators with correct colors', () => {
      const wrapper = shallowMount(HorseList, { store, localVue })
      const colorIndicators = wrapper.findAll('.color-indicator')
      
      expect(colorIndicators.at(0).element.style.backgroundColor).toBe('rgb(255, 107, 107)') // #FF6B6B
      expect(colorIndicators.at(1).element.style.backgroundColor).toBe('rgb(78, 205, 196)') // #4ECDC4
    })
  })

  describe('Horse Racing Status', () => {
    it('highlights racing horses when currentRaceData exists', () => {
      getters.currentRaceData = () => ({
        horses: [
          { id: 1, name: 'Test Horse', lane: 1 },
          { id: 3, name: 'Racing Star', lane: 2 }
        ]
      })
      
      store = new Vuex.Store({ state, actions, getters })
      const wrapper = shallowMount(HorseList, { store, localVue })
      
      const racingRows = wrapper.findAll('.horse-row.racing')
      expect(racingRows.length).toBe(2)
    })

    it('does not highlight horses when no race is active', () => {
      const wrapper = shallowMount(HorseList, { store, localVue })
      const racingRows = wrapper.findAll('.horse-row.racing')
      expect(racingRows.length).toBe(0)
    })

    it('correctly identifies racing horses by ID', () => {
      getters.currentRaceData = () => ({
        horses: [{ id: 2, name: 'Another Horse', lane: 1 }]
      })
      
      store = new Vuex.Store({ state, actions, getters })
      const wrapper = shallowMount(HorseList, { store, localVue })
      
      expect(wrapper.vm.isHorseRacing(1)).toBe(false)
      expect(wrapper.vm.isHorseRacing(2)).toBe(true)
      expect(wrapper.vm.isHorseRacing(3)).toBe(false)
    })
  })

  describe('Color Name Mapping', () => {
    it('returns correct color names for all predefined colors', () => {
      const wrapper = shallowMount(HorseList, { store, localVue })
      
      expect(wrapper.vm.getColorName('#FF6B6B')).toBe('Red')
      expect(wrapper.vm.getColorName('#4ECDC4')).toBe('Teal')
      expect(wrapper.vm.getColorName('#45B7D1')).toBe('Blue')
      expect(wrapper.vm.getColorName('#96CEB4')).toBe('Green')
      expect(wrapper.vm.getColorName('#FECA57')).toBe('Yellow')
      expect(wrapper.vm.getColorName('#FF9FF3')).toBe('Pink')
    })

    it('returns "Unknown" for undefined colors', () => {
      const wrapper = shallowMount(HorseList, { store, localVue })
      expect(wrapper.vm.getColorName('#UNKNOWN')).toBe('Unknown')
      expect(wrapper.vm.getColorName('')).toBe('Unknown')
      expect(wrapper.vm.getColorName(null)).toBe('Unknown')
    })
  })

  describe('Component Lifecycle', () => {
    it('calls initializeHorses action on mount', () => {
      shallowMount(HorseList, { store, localVue })
      expect(actions.initializeHorses).toHaveBeenCalledTimes(1)
    })

    it('handles empty horse list gracefully', () => {
      state.horses = []
      store = new Vuex.Store({ state, actions, getters })
      
      const wrapper = shallowMount(HorseList, { store, localVue })
      const horseRows = wrapper.findAll('.horse-row')
      expect(horseRows.length).toBe(0)
    })
  })

  describe('Edge Cases', () => {
    it('handles horses with extreme condition values', () => {
      state.horses = [
        { id: 1, name: 'Weak Horse', condition: 1, color: '#FF6B6B' },
        { id: 2, name: 'Strong Horse', condition: 100, color: '#4ECDC4' }
      ]
      store = new Vuex.Store({ state, actions, getters })
      
      const wrapper = shallowMount(HorseList, { store, localVue })
      const conditions = wrapper.findAll('.horse-row .col-condition')
      expect(conditions.at(0).text()).toBe('1')
      expect(conditions.at(1).text()).toBe('100')
    })

    it('handles horses with very long names', () => {
      state.horses = [
        { id: 1, name: 'This Is A Very Long Horse Name That Should Display Properly', condition: 85, color: '#FF6B6B' }
      ]
      store = new Vuex.Store({ state, actions, getters })
      
      const wrapper = shallowMount(HorseList, { store, localVue })
      const nameCell = wrapper.find('.horse-row .col-name')
      expect(nameCell.text()).toBe('This Is A Very Long Horse Name That Should Display Properly')
    })

    it('handles missing horse properties gracefully', () => {
      state.horses = [
        { id: 1, name: '', condition: null, color: undefined }
      ]
      store = new Vuex.Store({ state, actions, getters })
      
      const wrapper = shallowMount(HorseList, { store, localVue })
      expect(wrapper.findAll('.horse-row').length).toBe(1)
    })
  })

  describe('Responsive Behavior', () => {
    it('renders scrollable table body for many horses', () => {
      // Create 25 horses to test scrolling
      state.horses = Array.from({ length: 25 }, (_, i) => ({
        id: i + 1,
        name: `Horse ${i + 1}`,
        condition: Math.floor(Math.random() * 100) + 1,
        color: '#FF6B6B'
      }))
      store = new Vuex.Store({ state, actions, getters })
      
      const wrapper = shallowMount(HorseList, { store, localVue })
      const tableBody = wrapper.find('.table-body')
      expect(tableBody.exists()).toBe(true)
      expect(wrapper.findAll('.horse-row').length).toBe(25)
    })
  })
})