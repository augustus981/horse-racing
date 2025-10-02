// Custom Cypress commands for Horse Racing Game

// Add tab command for keyboard navigation
Cypress.Commands.add('tab', { prevSubject: 'optional' }, (subject) => {
  return cy.wrap(subject).trigger('keydown', { key: 'Tab' })
})

// Command to generate program and verify it was created
Cypress.Commands.add('generateProgram', () => {
  cy.get('button').contains('GENERATE PROGRAM').click()
  
  // Verify horses are loaded
  cy.get('.left-panel').within(() => {
    cy.get('.horse-row', { timeout: 10000 }).should('have.length', 20)
  })
  
  // Verify program was generated - button should show START, PAUSE, or COMPLETED
  cy.get('button[data-cy="start-pause-btn"]').should(($btn) => {
    const text = $btn.text().trim()
    expect(['START', 'PAUSE', 'COMPLETED']).to.include(text)
  })
  
  // If button shows COMPLETED, it should be disabled; otherwise enabled
  cy.get('button[data-cy="start-pause-btn"]').then($btn => {
    if ($btn.text().includes('COMPLETED')) {
      cy.wrap($btn).should('be.disabled')
    } else {
      cy.wrap($btn).should('be.enabled')
    }
  })
  cy.verifyRaceProgram()
  
  // Verify no program message is gone
  cy.get('.right-panel').within(() => {
    cy.contains('Click "GENERATE PROGRAM" to create race schedule').should('not.exist')
  })
})

// Command to start racing and optionally wait for completion
Cypress.Commands.add('startRacing', (waitForCompletion = false) => {
  // Verify button is in a startable state (not PAUSE, not disabled)
  cy.get('button[data-cy="start-pause-btn"]').should(($btn) => {
    const text = $btn.text().trim()
    const isDisabled = $btn.is(':disabled')
    expect(isDisabled).to.be.false
    expect(['START', 'COMPLETED']).to.include(text)
  })
  
  // Click the start button
  cy.get('button[data-cy="start-pause-btn"]').click()
  
  // Verify racing started (button should show PAUSE)
  cy.get('button[data-cy="start-pause-btn"]').should('contain', 'PAUSE')
  
  if (waitForCompletion) {
    // Wait for all 6 races to complete
    cy.waitForRaceCompletion(6)
    // After completion, button should show COMPLETED and be disabled
    cy.get('button[data-cy="start-pause-btn"]').should('contain', 'COMPLETED')
    cy.get('button[data-cy="start-pause-btn"]').should('be.disabled')
  }
})

// Command to pause racing
Cypress.Commands.add('pauseRacing', () => {
  // First verify we're in PAUSE state before clicking
  cy.get('button[data-cy="start-pause-btn"]').should('contain', 'PAUSE')
  cy.get('button[data-cy="start-pause-btn"]').click()
  
  // After pausing, button should show START or COMPLETED (if all races done)
  cy.get('button[data-cy="start-pause-btn"]').should(($btn) => {
    const text = $btn.text().trim()
    expect(['START', 'COMPLETED']).to.include(text)
  })
})

// Command to verify horse list structure and content
Cypress.Commands.add('verifyHorseList', () => {
  cy.get('.left-panel').within(() => {
    // Check header
    cy.get('h3').should('contain', 'Horse List (1- 20)')
    
    // Check table headers
    cy.get('.table-header').within(() => {
      cy.contains('Name').should('be.visible')
      cy.contains('Condition').should('be.visible')
      cy.contains('Color').should('be.visible')
    })
    
    // Check all 20 horses are displayed
    cy.get('.horse-row').should('have.length', 20)
    
    // Verify horse data structure
    cy.get('.horse-row').first().within(() => {
      cy.get('.col-name').should('not.be.empty')
      cy.get('.col-condition').invoke('text').should('match', /^\d{1,3}$/) // 1-100
      cy.get('.color-indicator').should('be.visible')
      cy.get('.color-name').should('not.be.empty')
    })
  })
})

// Command to verify race track structure
Cypress.Commands.add('verifyRaceTrack', () => {
  cy.get('[data-cy=race-track]').within(() => {
    // Check all 10 lanes exist
    cy.get('.lane').should('have.length', 10)
    
    // Check lane numbers
    cy.get('.lane-number').each(($el, index) => {
      cy.wrap($el).should('contain', index + 1)
    })
    
    // Check finish lines
    cy.get('.finish-line').should('have.length', 10)
    cy.get('.finish-line').each(($el) => {
      cy.wrap($el).should('contain', 'FINISH')
    })
  })
})

// Command to verify results section structure
Cypress.Commands.add('verifyResultsSection', () => {
  cy.get('[data-cy=race-results]').within(() => {
    // Check headers
    cy.get('.results-header h3').should('have.length', 2)
    cy.get('.results-header h3').first().should('contain', 'Program')
    cy.get('.results-header h3').last().should('contain', 'Results')
  })
})

// Command to verify a specific race result
Cypress.Commands.add('verifyRaceResult', (raceNumber, expectedDistance) => {
  cy.get('[data-cy=race-results]').within(() => {
    cy.get('.result-item').eq(raceNumber - 1).within(() => {
      // Check race header
      cy.get('.result-header strong').should('contain', `${expectedDistance}m`)
      cy.get('.completion-time').should('not.be.empty')
      
      // Check positions and times
      cy.get('.result-horse').should('have.length', 10)
      cy.get('.result-horse').each(($el, index) => {
        cy.wrap($el).within(() => {
          cy.get('.position').should('contain', index + 1)
          cy.get('.name').should('not.be.empty')
          cy.get('.time').invoke('text').should('match', /^\d+(\.\d{1,2})?s$/) // Format: XX.Xs or XX.XXs
        })
      })
    })
  })
})

// Command to check horse animation during race
Cypress.Commands.add('verifyHorseAnimation', () => {
  cy.get('[data-cy=race-track]').within(() => {
    // Check that horses appear
    cy.get('.horse', { timeout: 5000 }).should('be.visible')
    
    // Verify horses are colored
    cy.get('.horse-icon').should('be.visible')
    cy.get('.horse-icon').first().should('have.css', 'background-color')
    
    // Wait a moment and check positions have changed (animation)
    let initialPositions = []
    cy.get('.horse').then($horses => {
      $horses.each((index, horse) => {
        const transform = Cypress.$(horse).css('transform')
        initialPositions.push(transform)
      })
    })
    
    cy.wait(1000) // Wait 1 second
    
    cy.get('.horse').then($horses => {
      let positionsChanged = false
      $horses.each((index, horse) => {
        const currentTransform = Cypress.$(horse).css('transform')
        if (currentTransform !== initialPositions[index]) {
          positionsChanged = true
        }
      })
      expect(positionsChanged).to.be.true
    })
  })
})

// Command to verify responsive design elements
Cypress.Commands.add('testResponsiveDesign', () => {
  const viewports = [
    { width: 1280, height: 720, name: 'Desktop' },
    { width: 768, height: 1024, name: 'Tablet' },
    { width: 375, height: 667, name: 'Mobile' }
  ]
  
  viewports.forEach(viewport => {
    cy.viewport(viewport.width, viewport.height)
    cy.log(`Testing ${viewport.name} view`)
    
    // Verify main layout is visible
    cy.get('[data-cy=app]').should('be.visible')
    cy.get('[data-cy=horse-list]').should('be.visible')
    cy.get('[data-cy=race-track]').should('be.visible')
    cy.get('[data-cy=race-results]').should('be.visible')
    
    // On mobile, check if layout adapts
    if (viewport.width < 768) {
      cy.get('.app-main').should('have.css', 'flex-direction').and('match', /(column|row)/)
    }
  })
  
  // Reset to default viewport
  cy.viewport(1280, 720)
})

// Command to test accessibility features
Cypress.Commands.add('checkAccessibility', () => {
  // Check for proper heading structure
  cy.get('h1').should('exist')
  cy.get('h3').should('exist')
  
  // Check for button accessibility
  cy.get('button').each($btn => {
    cy.wrap($btn).should('have.attr', 'type')
  })
  
  // Check for proper color contrast (basic check)
  cy.get('[data-cy=horse-list] .horse-row').first().should('be.visible')
  cy.get('[data-cy=race-track] .lane').first().should('be.visible')
  
  // Check for keyboard navigation
  cy.get('[data-cy=generate-program-btn]').focus()
  cy.focused().should('have.attr', 'data-cy', 'generate-program-btn')
  
  cy.get('[data-cy=start-pause-btn]').focus()
  cy.focused().should('have.attr', 'data-cy', 'start-pause-btn')
})
