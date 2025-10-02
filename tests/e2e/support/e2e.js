// Cypress E2E support file for Horse Racing Game

import './commands'

// Hide fetch/XHR requests in command log for cleaner output
Cypress.on('window:before:load', (win) => {
  cy.stub(win.console, 'log').as('consoleLog')
  cy.stub(win.console, 'warn').as('consoleWarn')
  cy.stub(win.console, 'error').as('consoleError')
})

// Global configuration
Cypress.Commands.add('waitForAppToLoad', () => {
  cy.get('#app', { timeout: 10000 }).should('be.visible')
  cy.get('.left-panel', { timeout: 5000 }).should('be.visible')
  cy.get('.center-panel', { timeout: 5000 }).should('be.visible')
  cy.get('.right-panel', { timeout: 5000 }).should('be.visible')
})

// Custom assertion for horse racing game
Cypress.Commands.add('checkGameInitialState', () => {
  // Check header is visible
  cy.get('h1').should('contain', 'Horse Racing')
  
  // Check control buttons
  cy.get('button').contains('GENERATE PROGRAM').should('be.visible').and('be.enabled')
  cy.get('button').contains('START').should('be.visible').and('be.disabled')
  
  // Check no program message
  cy.get('.right-panel').within(() => {
    cy.contains('Click "GENERATE PROGRAM" to create race schedule').should('be.visible')
  })
})

// Wait for race animations
Cypress.Commands.add('waitForRaceCompletion', (raceNumber = 1) => {
  if (raceNumber === 1) {
    // Wait for single race
    cy.get('.center-panel .horse', { timeout: 5000 }).should('be.visible')
    cy.wait(8000) // 5s race + 1s finish pause + 2s buffer
  } else {
    // Wait for multiple races - much longer timeout
    // Each race: 5s animation + 1s finish pause + 1.5s inter-race delay = 7.5s per race
    const totalWaitTime = raceNumber * 8000 // Add buffer for safety
    cy.wait(totalWaitTime)
  }
  
  // Wait for results to appear
  cy.get('.right-panel').within(() => {
    cy.get('.result-item', { timeout: 15000 }).should('have.length.at.least', raceNumber)
  })
  
  // Wait a bit more for race to fully complete
  cy.wait(1000)
})

// Check race program structure
Cypress.Commands.add('verifyRaceProgram', () => {
  const expectedDistances = [1200, 1400, 1600, 1800, 2000, 2200]
  
  cy.get('.right-panel').within(() => {
    cy.get('.program-item').should('have.length', 6)
    
    expectedDistances.forEach((distance, index) => {
      cy.get('.program-item').eq(index).within(() => {
        cy.get('.program-header strong').should('contain', `${distance}m`)
        cy.get('.program-horse').should('have.length', 10) // All 10 horses shown
      })
    })
  })
})
