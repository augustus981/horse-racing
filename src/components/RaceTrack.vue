<template>
  <div class="race-track">
    <div class="race-track-header">
      <h3 v-if="currentRaceData">
        {{ currentRaceData.round }}{{ getOrdinalSuffix(currentRaceData.round) }} Lap - {{ currentRaceData.distance }}m

        <span v-if="isRacing">Racing in progress</span>
        <span v-else>Paused</span>
      </h3>
      <h3 v-else>Race Track</h3>
      
    </div>
    
    <div class="track-container" ref="trackContainer">
      <div class="track">
        <div 
          v-for="lane in 10" 
          :key="lane"
          class="lane"
          :class="{ 'active': isLaneActive(lane) }"
        >
          <div class="lane-number">{{ lane }}</div>
          <div class="lane-track">
            <div 
              v-if="getHorseInLane(lane)"
              class="horse"
              :style="getHorseStyle(lane)"
            >
              <div 
                class="horse-icon"
                :style="{ backgroundColor: getHorseInLane(lane).color }"
              >
                🐎
              </div>
            </div>
          </div>
          <div class="finish-line">FINISH</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default {
  name: 'RaceTrack',
  computed: {
    ...mapState(['currentRacePositions', 'isRacing']),
    ...mapGetters(['currentRaceData'])
  },
  
  methods: {
    isLaneActive(laneNumber) {
      if (!this.currentRaceData?.horses) return false
      return this.currentRaceData.horses.some(horse => horse.lane === laneNumber)
    },
    
    getHorseInLane(laneNumber) {
      if (!this.currentRacePositions.length) {
        return this.currentRaceData?.horses.find(horse => horse.lane === laneNumber)
      }
      return this.currentRacePositions.find(horse => horse.lane === laneNumber)
    },
    
    getHorseStyle(laneNumber) {
      const horse = this.getHorseInLane(laneNumber)
      if (!horse) return {}
      
      let position = 0
      if (this.currentRacePositions.length && horse.position !== undefined && this.currentRaceData?.distance) {
        const trackWidth = this.$refs.trackContainer?.offsetWidth || 800
        const availableWidth = trackWidth - 100 // Account for lane number and finish line
        position = (horse.position / this.currentRaceData.distance) * availableWidth
      }
      
      return {
        transform: `translateX(${position}px)`,
        transition: this.isRacing ? 'transform 0.1s linear' : 'none'
      }
    },
    
    getOrdinalSuffix(number) {
      const j = number % 10
      const k = number % 100
      if (j === 1 && k !== 11) return 'st'
      if (j === 2 && k !== 12) return 'nd'
      if (j === 3 && k !== 13) return 'rd'
      return 'th'
    }
  }
}
</script>

<style scoped>
.race-track {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.race-track-header {
  background-color: #6c7b7f;
  color: white;
  padding: 12px;
  border-radius: 8px 8px 0 0;
  text-align: center;
}

.race-track-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
}

.race-status {
  margin-top: 8px;
  padding: 4px 12px;
  background-color: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  display: inline-block;
}

.race-status p {
  margin: 0;
  color: #ffffff;
  font-size: 12px;
  font-weight: 400;
  opacity: 0.9;
}

.track-container {
  flex: 1;
  overflow: hidden;
  background: linear-gradient(90deg, #4a6741 0%, #5d8a4f  50%, #4a6741 100%);
  position: relative;
}

.track {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 10px 0;
}

.lane {
  flex: 1;
  display: flex;
  align-items: center;
  border-bottom: 2px dashed rgba(255, 255, 255, 0.3);
  position: relative;
  min-height: 40px;
}

.lane:last-child {
  border-bottom: none;
}

.lane.active {
  background-color: rgba(255, 255, 255, 0.1);
}

.lane-number {
  width: 30px;
  text-align: center;
  font-weight: bold;
  color: white;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  margin: 0 5px;
  padding: 2px;
  font-size: 14px;
}

.lane-track {
  flex: 1;
  position: relative;
  height: 100%;
  margin: 0 5px;
}

.horse {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
}

.horse-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  position: relative;
}

.finish-line {
  width: 60px;
  text-align: center;
  font-weight: bold;
  color: #ff0000;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
  margin: 0 5px;
  padding: 2px;
  font-size: 12px;
  border: 2px solid #ff0000;
}


/* Responsive adjustments */
@media (max-width: 768px) {
  .horse-icon {
    width: 24px;
    height: 24px;
    font-size: 16px;
  }
  
  .lane-number, .finish-line {
    font-size: 10px;
    padding: 1px;
  }
  
  .lane {
    min-height: 30px;
  }
}
</style>
