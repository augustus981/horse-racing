# 🏇 Horse Racing Game

An interactive horse racing simulation game built with Vue 2 and Vuex, featuring animated races, real-time results, and comprehensive testing.

## ✨ Features

### Core Features
- **20 Unique Horses**: Each with unique names, colors, and condition scores (1-100)
- **6 Race Rounds**: Progressive distances from 1200m to 2200m
- **Real-time Animation**: Smooth 5-second race animations with finish line pause
- **Random Selection**: 10 horses randomly selected per race from the pool of 20
- **Sequential Racing**: Races run one after another with visual transitions
- **Pause/Resume**: Ability to pause and resume racing at any time
- **Results Tracking**: Comprehensive display of all race results with times
- **State Management**: Robust Vuex store with race state handling

### UI/UX Features
- **Professional Design**: Modern, gradient-based UI with card layouts
- **Responsive Layout**: Works on desktop, tablet, and mobile devices
- **Visual Feedback**: Racing status indicators and progress tracking
- **Winner Highlighting**: Podium positions (1st, 2nd, 3rd) clearly marked
- **Color-coded Horses**: Each horse has a unique color for easy tracking

## 🚀 Technology Stack

### Frontend
- **Vue.js 2.6.14**: Progressive JavaScript framework
- **Vuex 3.6.2**: Centralized state management
- **Vue CLI 5**: Build tooling and development server

### Testing
- **Jest**: Unit testing framework (147 tests)
- **Vue Test Utils**: Vue component testing utilities
- **Cypress 12.17.4**: End-to-end testing (25 integration tests)

### Development
- **ES6+ JavaScript**: Modern JavaScript features
- **ESLint**: Code linting and formatting
- **Babel**: JavaScript transpilation

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ (recommended: Node 24 with nvm)
- npm 10+

### Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run serve

# Open browser to http://localhost:8080
```

### Available Commands

```bash
# Development
npm run serve              # Start dev server with hot reload

# Production
npm run build              # Build for production
npm run lint               # Run ESLint

# Testing
npm run test:unit          # Run all unit tests (147 tests)
npm run test:e2e           # Run E2E tests (25 tests)
npm run test:unit -- --watch   # Watch mode for unit tests
```

## 🎮 How to Play

### Starting a Race Session

1. **Generate Program** 
   - Click the "GENERATE PROGRAM" button
   - System generates 20 horses with random conditions
   - Creates 6-race program with random horse selections

2. **Start Racing**
   - Click "START" to begin racing
   - Watch horses race in real-time (5 seconds per race)
   - Races run sequentially with automatic transitions

3. **Control Racing**
   - Click "PAUSE" to pause at any time
   - Click "START" to resume from current position
   - Racing state is maintained during pause

4. **View Results**
   - **Left Panel**: All 20 horses with conditions and colors
   - **Center Panel**: Live race animation with 10 lanes
   - **Right Panel**: Program schedule and completed results

5. **Race Completion**
   - After all 6 races, button shows "COMPLETED"
   - Generate new program to start fresh session

## 📁 Project Structure

```
horse-racing/
├── src/
│   ├── components/
│   │   ├── HorseList.vue          # Horse roster display (20 horses)
│   │   ├── RaceTrack.vue          # Animated 10-lane race track
│   │   └── RaceResults.vue        # Program & results with styling
│   ├── store/
│   │   └── index.js               # Vuex store (state, mutations, actions, getters)
│   ├── utils/
│   │   ├── horseGenerator.js      # Horse generation with 20 unique names/colors
│   │   └── raceSimulator.js       # Race simulation algorithm
│   ├── App.vue                    # Main application layout
│   └── main.js                    # Application entry point
├── tests/
│   ├── unit/
│   │   ├── setup.js               # Jest configuration
│   │   ├── store.spec.js          # Vuex store tests (32 tests)
│   │   ├── HorseList.spec.js      # Component tests
│   │   ├── RaceTrack.spec.js      # Component tests
│   │   ├── RaceResults.spec.js    # Component tests
│   │   ├── horseGenerator.spec.js # Utility tests
│   │   └── raceSimulator.spec.js  # Simulation tests
│   └── e2e/
│       ├── integration-testing.cy.js  # Full workflow tests (25 tests)
│       └── support/
│           ├── commands.js        # Custom Cypress commands
│           └── e2e.js             # E2E configuration
├── public/
│   └── index.html                 # HTML template
├── cypress.config.js              # Cypress configuration
├── jest.config.js                 # Jest configuration
├── babel.config.js                # Babel configuration
└── package.json                   # Dependencies and scripts
```

## 🏗️ Architecture

### Component Overview

**App.vue** - Main Application
- Header with control buttons (GENERATE PROGRAM, START/PAUSE)
- Three-column layout (Horse List | Race Track | Results)
- Manages global state and user interactions

**HorseList.vue** - Horse Roster
- Displays all 20 horses in table format
- Shows name, condition (1-100), and color
- Highlights horses currently racing
- Color indicators with hex values

**RaceTrack.vue** - Racing Animation
- 10-lane track with lane numbers and finish lines
- Real-time horse position updates (100ms intervals)
- Racing status indicator (Racing/Paused)
- Progressive horse movement with speed variations
- 1-second pause at finish line before next race

**RaceResults.vue** - Program & Results
- **Program Section**: Shows scheduled races with all 10 horses
- **Results Section**: Displays completed races with times
- Professional card-style layout with gradients
- Winner/podium highlighting (🥇🥈🥉)
- Completion timestamps for each race

### State Management (Vuex)

**State**
```javascript
{
  horses: [],                    // 20 generated horses
  raceProgram: [],               // 6 races with horse selections
  raceResults: [],               // Completed race results
  currentRound: 0,               // Current race index (0-5)
  isRacing: false,               // Racing active state
  hasProgram: false,             // Program generated flag
  currentRacePositions: [],      // Live horse positions during race
  raceDistances: [1200, 1400, 1600, 1800, 2000, 2200],
  raceInProgress: false,         // Prevents multiple race instances
  currentAnimationTimer: null    // Animation interval reference
}
```

**Key Actions**
- `generateProgram()`: Creates 20 horses and 6-race schedule
- `toggleRace()`: Starts/pauses racing with state management
- `runRaces()`: Sequential race execution with transitions
- `simulateRaceWithAnimation()`: Handles individual race animation

**Getters**
- `currentRaceData`: Returns active race information
- `allRacesCompleted`: Checks if all 6 races are finished

## 🎯 Game Rules

### Race Program Generation
1. System generates 20 unique horses with random conditions (1-100)
2. Creates 6 races with increasing distances (1200m → 2200m)
3. Each race randomly selects 10 horses from the pool of 20
4. Same horse can appear in multiple races

### Racing Mechanics
1. Each race runs for 5 seconds with 100ms position updates
2. Horse speed based on condition and random variation
3. All horses reach finish line before race ends
4. 1-second visual pause at finish line
5. 1.5-second transition between races
6. Races can be paused/resumed at any time

### Results
1. Horses ranked by finish time (fastest to slowest)
2. Top 3 positions highlighted (Winner, Place, Show)
3. Race completion timestamp displayed
4. All 10 horses shown in final results

## 🧪 Testing

### Unit Tests (147 tests)
```bash
npm run test:unit
```

**Coverage:**
- ✅ Store actions, mutations, getters (32 tests)
- ✅ Component rendering and interactions (60+ tests)
- ✅ Horse generation logic (20+ tests)
- ✅ Race simulation algorithms (20+ tests)
- ✅ Helper utilities (15+ tests)

**Test Files:**
- `store.spec.js`: State management tests
- `HorseList.spec.js`: Horse list component tests
- `RaceTrack.spec.js`: Race track animation tests
- `RaceResults.spec.js`: Results display tests
- `horseGenerator.spec.js`: Horse generation tests
- `raceSimulator.spec.js`: Race simulation tests

### E2E Tests (25 tests)
```bash
npm run test:e2e
```

**Test Scenarios:**
- Complete game workflow (3 tests)
- Interrupted workflow recovery (4 tests)
- Complex user interactions (4 tests)
- Data integrity and consistency (4 tests)
- Performance under load (4 tests)
- Edge cases and boundaries (4 tests)
- Cross-browser compatibility (2 tests)

**Features Tested:**
- Program generation and validation
- Race execution with animation
- Pause/resume functionality
- State persistence
- Memory efficiency
- Viewport responsiveness
- Keyboard navigation

## 🎨 UI/UX Details

### Color Scheme
- **Header**: Warm brown/tan (#d4a574)
- **Buttons**: Blue gradient (primary), gray (secondary)
- **Results Header**: Blue gradient (#007bff → #0056b3)
- **Winner**: Gold highlight (#ffd700)
- **Podium**: Light yellow background (#fff9e6)

### Responsive Breakpoints
- **Desktop**: 1280px+ (three-column layout)
- **Tablet**: 768px-1279px (adjusted spacing)
- **Mobile**: <768px (stacked layout)

### Animations
- Smooth horse movement using CSS transforms
- Transition duration controlled by racing state
- Progressive speed variations for realism
- Pause-friendly animation system

## 🔧 Development Notes

### Key Implementation Details

**Race Animation**
- Uses `setInterval` with 100ms updates
- Skips position updates when paused (doesn't stop timer)
- Ensures all horses reach finish line
- Clears timer and positions after each race

**State Management**
- `raceInProgress` flag prevents multiple race instances
- `currentAnimationTimer` stored for proper cleanup
- Race program reset before new generation
- Button states: START → PAUSE → COMPLETED

**Test Reliability**
- Custom Cypress commands for common operations
- Flexible button state assertions
- Proper timeouts for async operations
- Defensive pre-condition checks

### Known Considerations

1. **Button States**: START, PAUSE, or COMPLETED depending on race state
2. **Race Timing**: 5s animation + 1s finish + 1.5s transition = ~7.5s per race
3. **Horse Pool**: Same 20 horses used across all races in a session
4. **Animation Pause**: Horses stop moving but maintain position
5. **Test Environment**: Cypress requires Node 18+ for stability

## 📈 Future Enhancement Ideas

- [ ] Save race history to localStorage
- [ ] Horse statistics and performance tracking
- [ ] Betting system with virtual currency
- [ ] Multiplayer support
- [ ] Horse upgrade/training mechanics
- [ ] Race replays
- [ ] Sound effects and background music
- [ ] Tournament mode
- [ ] Leaderboards
- [ ] Advanced race strategies

## 🤝 Contributing

This is a demonstration project. If you'd like to extend it:

1. Fork the repository
2. Create a feature branch
3. Add tests for new features
4. Ensure all tests pass
5. Submit a pull request

## 📝 License

MIT License - feel free to use this project for learning and development.

## 🎓 Learning Resources

This project demonstrates:
- Vue 2 component architecture
- Vuex state management patterns
- Animation with JavaScript intervals
- Comprehensive testing strategies
- Responsive design principles
- Modern JavaScript (ES6+)
- Project organization best practices

---

**Built with ❤️ using Vue.js 2 & Vuex**

*For questions or issues, please check the test files for implementation examples.*