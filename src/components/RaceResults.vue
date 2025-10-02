<template>
  <div class="race-results">
    <div class="results-header">
      <div class="header-section">
        <h3>Program</h3>
        <div class="summary" v-if="hasProgram">
          {{ raceProgram.length }} races scheduled
        </div>
      </div>
      <div class="header-section">
        <h3>Results</h3>
        <div class="summary" v-if="raceResults.length > 0">
          {{ raceResults.length }} of {{ raceProgram.length }} completed
        </div>
      </div>
    </div>
    
    <div class="results-content">
      <!-- Program Section -->
      <div class="program-section">
        <div v-if="!hasProgram" class="no-program">
          <p>Click "GENERATE PROGRAM" to create race schedule</p>
        </div>
        
        <div v-else class="program-list">
          <div 
            v-for="(race, index) in raceProgram" 
            :key="index"
            class="program-item"
            :class="{ 
              'current': index === currentRound && isRacing,
              'completed': index < raceResults.length 
            }"
          >
            <div class="program-header">
              <strong>{{ race.round }}{{ getOrdinalSuffix(race.round) }} Lap - {{ race.distance }}m</strong>
            </div>
            <div class="program-horses">
              <div 
                v-for="(horse, hIndex) in race.horses" 
                :key="horse.id"
                class="program-horse"
              >
                <span class="position">{{ hIndex + 1 }}</span>
                <span class="name">{{ horse.name }}</span>
                <span class="condition">{{ horse.condition }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Results Section -->
      <div class="results-section">
        <div v-if="raceResults.length === 0" class="no-results">
          <p>Race results will appear here</p>
        </div>
        
        <div v-else class="results-list">
          <div 
            v-for="(result, index) in raceResults" 
            :key="index"
            class="result-item"
          >
            <div class="result-header">
              <strong>{{ result.round }}{{ getOrdinalSuffix(result.round) }} Lap - {{ result.distance }}m</strong>
              <span class="completion-time">{{ result.completedAt }}</span>
            </div>
            <div class="result-positions">
              <div 
                v-for="(horse, position) in result.results" 
                :key="horse.id"
                class="result-horse"
                :class="{ 
                  'winner': position === 0,
                  'podium': position < 3 
                }"
              >
                <span class="position">{{ position + 1 }}</span>
                <span class="name">{{ horse.name }}</span>
                <span class="time">{{ horse.raceTime }}s</span>
                <!-- <span class="prize" v-if="position < 3">
                  {{ getPrizeText(position) }}
                </span> -->
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'RaceResults',
  computed: {
    ...mapState([
      'raceProgram', 
      'raceResults', 
      'currentRound', 
      'isRacing', 
      'hasProgram'
    ])
  },
  methods: {
    getOrdinalSuffix(number) {
      const j = number % 10
      const k = number % 100
      if (j === 1 && k !== 11) return 'st'
      if (j === 2 && k !== 12) return 'nd'
      if (j === 3 && k !== 13) return 'rd'
      return 'th'
    },
    
    getPrizeText(position) {
      const prizes = ['🥇 WIN', '🥈 PLACE', '🥉 SHOW']
      return prizes[position] || ''
    }
  }
}
</script>

<style scoped>
.race-results {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.results-header {
  display: flex;
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  color: white;
  border-radius: 8px 8px 0 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-section {
  flex: 1;
  padding: 12px;
  text-align: center;
  border-right: 1px solid rgba(255, 255, 255, 0.3);
}

.header-section:last-child {
  border-right: none;
}

.header-section h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: bold;
}

.summary {
  font-size: 12px;
  opacity: 0.9;
  font-weight: normal;
}

.results-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.program-section,
.results-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-right: 1px solid #dee2e6;
}

.results-section {
  border-right: none;
}

.program-list,
.results-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.program-item,
.result-item {
  margin-bottom: 15px;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #dee2e6;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.program-item:hover,
.result-item:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

.program-item.current {
  border-left-color: #ffc107;
  background-color: #fff3cd;
}

.program-item.completed {
  border-left-color: #28a745;
  background-color: #d4edda;
}

.result-item {
  border-left-color: #007bff;
  background-color: #e7f3ff;
}

.program-header,
.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
}

.completion-time {
  font-size: 12px;
  color: #666;
  font-weight: normal;
}

.program-horses,
.result-positions {
  font-size: 12px;
}

.program-horse,
.result-horse {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.program-horse:last-child,
.result-horse:last-child {
  border-bottom: none;
}

.position {
  width: 25px;
  font-weight: bold;
  color: #007bff;
  text-align: center;
}

.name {
  flex: 1;
  margin: 0 8px;
  font-weight: 500;
}

.condition {
  width: 40px;
  text-align: right;
  font-size: 11px;
  color: #666;
  font-weight: bold;
}

.time {
  width: 60px;
  text-align: right;
  font-weight: bold;
  color: #28a745;
}

.prize {
  width: 80px;
  text-align: right;
  font-size: 10px;
  font-weight: bold;
  color: #ff6b35;
}

/* Winner and podium styling */
.result-horse.winner {
  background-color: #fff3cd;
  border-left: 3px solid #ffc107;
  font-weight: bold;
}

.result-horse.winner .position {
  color: #ffc107;
}

.result-horse.podium {
  background-color: #f8f9fa;
  border-left: 2px solid #6c757d;
}

.result-horse.podium .position {
  color: #6c757d;
}

.more-horses {
  text-align: center;
  font-style: italic;
  color: #666;
  margin-top: 5px;
}

.no-program,
.no-results {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-style: italic;
  padding: 20px;
  text-align: center;
}

/* Scrollbar styling */
.program-list::-webkit-scrollbar,
.results-list::-webkit-scrollbar {
  width: 6px;
}

.program-list::-webkit-scrollbar-track,
.results-list::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.program-list::-webkit-scrollbar-thumb,
.results-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.program-list::-webkit-scrollbar-thumb:hover,
.results-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .results-content {
    flex-direction: column;
  }
  
  .program-section,
  .results-section {
    border-right: none;
    border-bottom: 1px solid #dee2e6;
  }
  
  .results-section {
    border-bottom: none;
  }
}
</style>
