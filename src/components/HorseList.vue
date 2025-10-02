<template>
  <div class="horse-list">
    <div class="horse-list-header">
      <h3>Horse List (1- 20)</h3>
    </div>
    
    <div class="horse-table">
      <div class="table-header">
        <div class="col-name">Name</div>
        <div class="col-condition">Condition</div>
        <div class="col-color">Color</div>
      </div>
      
      <div class="table-body">
        <div 
          v-for="horse in horses" 
          :key="horse.id"
          class="horse-row"
          :class="{ 'racing': isHorseRacing(horse.id) }"
        >
          <div class="col-name">{{ horse.name }}</div>
          <div class="col-condition">{{ horse.condition }}</div>
          <div class="col-color">
            <div 
              class="color-indicator"
              :style="{ backgroundColor: horse.color }"
            ></div>
            <span class="color-name">{{ getColorName(horse.color) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default {
  name: 'HorseList',
  computed: {
    ...mapState(['horses', 'currentRacePositions']),
    ...mapGetters(['currentRaceData'])
  },
  methods: {
    isHorseRacing(horseId) {
      if (!this.currentRaceData) return false
      return this.currentRaceData.horses.some(h => h.id === horseId)
    },
    
    getColorName(color) {
      const colorMap = {
        '#FF6B6B': 'Red',
        '#4ECDC4': 'Teal', 
        '#45B7D1': 'Blue',
        '#96CEB4': 'Green',
        '#FECA57': 'Yellow',
        '#FF9FF3': 'Pink',
        '#54A0FF': 'Light Blue',
        '#5F27CD': 'Purple',
        '#00D2D3': 'Cyan',
        '#FF9F43': 'Orange',
        '#10AC84': 'Emerald',
        '#EE5A24': 'Red Orange',
        '#0abde3': 'Sky Blue',
        '#feca57': 'Gold',
        '#ff6348': 'Coral',
        '#1dd1a1': 'Mint',
        '#ff3838': 'Bright Red',
        '#2f3542': 'Dark Gray',
        '#40407a': 'Navy',
        '#706fd3': 'Lavender'
      }
      return colorMap[color] || 'Unknown'
    }
  },
  
  mounted() {
    this.$store.dispatch('initializeHorses')
  }
}
</script>

<style scoped>
.horse-list {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.horse-list-header {
  background-color: #ffd700;
  padding: 12px;
  border-radius: 8px 8px 0 0;
}

.horse-list-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
  text-align: center;
}

.horse-table {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.table-header {
  display: flex;
  background-color: #f8f9fa;
  font-weight: bold;
  padding: 8px 12px;
  border-bottom: 2px solid #dee2e6;
}

.table-body {
  flex: 1;
  overflow-y: auto;
}

.horse-row {
  display: flex;
  padding: 8px 12px;
  border-bottom: 1px solid #dee2e6;
  transition: background-color 0.3s ease;
}

.horse-row:hover {
  background-color: #f8f9fa;
}

.horse-row.racing {
  background-color: #e7f3ff;
  font-weight: bold;
}

.col-name {
  flex: 2;
  padding-right: 8px;
}

.col-condition {
  flex: 1;
  text-align: center;
  padding-right: 8px;
}

.col-color {
  flex: 1.5;
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-indicator {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid #333;
  flex-shrink: 0;
}

.color-name {
  font-size: 12px;
  color: #666;
}

/* Scrollbar styling */
.table-body::-webkit-scrollbar {
  width: 6px;
}

.table-body::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.table-body::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.table-body::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
