<template>
  <div id="app" data-cy="app">
    <header class="app-header">
      <h1>Horse Racing</h1>
      <div class="control-buttons">
        <button 
          class="btn btn-primary" 
          data-cy="generate-program-btn"
          @click="generateProgram"
          :disabled="isRacing"
        >
          GENERATE PROGRAM
        </button>
        <button 
          class="btn btn-secondary"
          data-cy="start-pause-btn" 
          @click="toggleRace"
          :disabled="!hasProgram || allRacesCompleted"
        >
          {{ isRacing ? 'PAUSE' : allRacesCompleted ? 'COMPLETED' : 'START' }}
        </button>
      </div>
    </header>

    <main class="app-main">
      <div class="left-panel">
        <HorseList data-cy="horse-list" />
      </div>
      
      <div class="center-panel">
        <RaceTrack data-cy="race-track" />
      </div>
      
      <div class="right-panel">
        <RaceResults data-cy="race-results" />
      </div>
    </main>
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex'
import HorseList from './components/HorseList.vue'
import RaceTrack from './components/RaceTrack.vue'
import RaceResults from './components/RaceResults.vue'

export default {
  name: 'App',
  components: {
    HorseList,
    RaceTrack,
    RaceResults
  },
  computed: {
    ...mapState(['isRacing', 'hasProgram']),
    ...mapGetters(['allRacesCompleted'])
  },
  methods: {
    ...mapActions(['generateProgram', 'toggleRace'])
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Arial', sans-serif;
  background-color: #f0f0f0;
}

#app {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background-color: #d4a574;
  padding: 10px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.app-header h1 {
  color: white;
  font-size: 24px;
  font-weight: bold;
}

.control-buttons {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #6c757d;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #5a6268;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #5a6268;
}

.app-main {
  flex: 1;
  display: flex;
  gap: 10px;
  padding: 10px;
  overflow: hidden;
}

.left-panel {
  width: 300px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.center-panel {
  flex: 1;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  min-width: 0;
}

.right-panel {
  width: 400px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
</style>
