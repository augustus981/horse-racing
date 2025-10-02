// E2E Tests: Full Integration Testing
// Tests complete user workflows and complex scenarios

describe('Horse Racing Game - Integration Testing', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.waitForAppToLoad()
  })

  context('Complete Game Workflow', () => {
    it('should complete a full game session from start to finish', () => {
      // 1. Initial state verification
      cy.checkGameInitialState()
      
      // 2. Generate race program
      cy.generateProgram()
      cy.verifyRaceProgram()
      
      // 3. Start and complete all races
      cy.startRacing(true)
      
      // 4. Verify all results are present
      cy.get('.right-panel .result-item').should('have.length', 6)
      
      const expectedDistances = [1200, 1400, 1600, 1800, 2000, 2200]
      expectedDistances.forEach((distance, index) => {
        cy.verifyRaceResult(index + 1, distance)
      })
      
      // 5. Verify final state
      cy.get('button').contains('COMPLETED').should('be.disabled')
      cy.get('button').contains('GENERATE PROGRAM').should('be.enabled')
    })

    it('should handle multiple complete game sessions', () => {
      // Play multiple complete games
      for (let game = 1; game <= 3; game++) {
        cy.log(`Starting game session ${game}`)
        
        // Generate and run complete race
        cy.generateProgram()
        cy.startRacing(true)
        
        // Verify completion
        cy.get('.right-panel .result-item').should('have.length', 6)
        
        // Reset for next game by generating new program
        cy.get('button').contains('GENERATE PROGRAM').click()
      }
    })

    it('should maintain data consistency throughout complete workflow', () => {
      // Track horses throughout the process
      let initialHorses = []
      
      cy.generateProgram()
      
      // Wait a moment for horses to be fully loaded
      cy.wait(500)
      
      cy.get('.left-panel .horse-row').each($row => {
        cy.wrap($row).within(() => {
          cy.get('.col-name').then($name => {
            initialHorses.push($name.text())
          })
        })
      })
      
      // Verify same horses appear in program
      cy.get('.right-panel .program-item').each($item => {
        cy.wrap($item).within(() => {
          cy.get('.program-horse .name').each($name => {
            const horseName = $name.text()
            expect(initialHorses).to.include(horseName)
          })
        })
      })
      
      // Complete races and verify same horses in results
      cy.startRacing(true)
      
      cy.get('.right-panel .result-item').each($item => {
        cy.wrap($item).within(() => {
          cy.get('.result-horse .name').each($name => {
            const horseName = $name.text()
            expect(initialHorses).to.include(horseName)
          })
        })
      })
    })
  })

  context('Interrupted Workflow Recovery', () => {
    it('should handle program generation interruption', () => {
      // Start generating program
      cy.get('button').contains('GENERATE PROGRAM').click()
      
      // Immediately try to click again (should be disabled)
      cy.get('button').contains('GENERATE PROGRAM').click({ force: true })
      
      // Should still have valid program
      cy.verifyRaceProgram()
      cy.get('button').should('be.enabled')
    })

    it('should handle racing interruption and recovery', () => {
      cy.generateProgram()
      cy.startRacing()
      
      // Pause mid-race
      cy.get('.race-track-header h3').should('contain', 'Racing in progress')
      cy.pauseRacing()
      
      // Resume racing
      cy.startRacing()
      
      // Should continue properly
      cy.get('.race-track-header h3').should('contain', 'Racing in progress')
      
      // Complete first race
      cy.waitForRaceCompletion(1)
      cy.verifyRaceResult(1, 1200)
    })

    it('should handle multiple pause/resume cycles', () => {
      cy.generateProgram()
      cy.startRacing()
      
      // Multiple pause/resume cycles
      for (let i = 0; i < 3; i++) {
        cy.get('.race-track-header h3').should('contain', 'Racing in progress')
        cy.pauseRacing()
        cy.wait(500)
        cy.startRacing()
        cy.wait(1000)
      }
      
      // Should still complete races normally
      cy.waitForRaceCompletion(1)
      cy.verifyRaceResult(1, 1200)
    })

    it('should recover from page reload during racing', () => {
      cy.generateProgram()
      cy.startRacing()
      
      // Wait for race to start
      cy.get('.race-track-header h3').should('contain', 'Racing in progress')
      
      // Reload page
      cy.reload()
      cy.waitForAppToLoad()
      
      // Should return to initial state
      cy.checkGameInitialState()
    })

  })

  context('Complex User Interactions', () => {
    it('should handle rapid clicking during race generation', () => {
      // Rapid clicking on generate button
      cy.get('button').contains('GENERATE PROGRAM').click()
      cy.get('button').contains('GENERATE PROGRAM').click({ force: true })
      cy.get('button').contains('GENERATE PROGRAM').click({ force: true })
      cy.get('button').contains('GENERATE PROGRAM').click({ force: true })
      cy.get('button').contains('GENERATE PROGRAM').click({ force: true })
      
      // Should still generate valid program
      cy.verifyRaceProgram()
    })

    it('should handle simultaneous interactions during racing', () => {
      cy.generateProgram()
      cy.startRacing()
      
      // Try various interactions during racing
      cy.get('.left-panel .horse-row').first().click()
      cy.get('.center-panel').click()
      cy.get('.right-panel').click()
      
      // Racing should continue normally
      cy.get('.race-track-header h3').should('contain', 'Racing in progress')
    })

    it('should handle keyboard interactions throughout workflow', () => {
      // Use keyboard to navigate and interact
      cy.get('button').contains('GENERATE PROGRAM').focus()
      cy.focused().type('{enter}') // Trigger generate program
      
      cy.verifyRaceProgram()
      
      // Focus start button and activate it
      cy.get('button').contains('START').focus()
      cy.focused().type('{enter}') // Start racing
      
      cy.get('.race-track-header h3').should('contain', 'Racing in progress')
    })

    it('should maintain state during window focus changes', () => {
      cy.generateProgram()
      cy.startRacing()
      
      // Simulate focus changes
      cy.window().trigger('blur')
      cy.wait(1000)
      cy.window().trigger('focus')
      
      // Should maintain racing state
      cy.get('button').should('contain', 'PAUSE')
    })

    it('should handle viewport changes during active racing', () => {
      cy.generateProgram()
      cy.startRacing()
      
      // Change viewport while racing - race info might not be visible on mobile
      cy.viewport(375, 667)
      cy.get('.center-panel').should('exist') // Race track should exist
      
      cy.viewport(1280, 720)
      cy.get('.race-track-header h3').should('contain', 'Racing in progress')
    })
  })

  context('Data Integrity and Consistency', () => {
    it('should maintain race result integrity', () => {
      cy.generateProgram()
      cy.startRacing()
      
      // Wait for multiple races to complete
      cy.waitForRaceCompletion(3)
      
      // Verify each result is complete and valid
      cy.get('.right-panel .result-item').each($item => {
        cy.wrap($item).within(() => {
          // Each result should have all required data
          cy.get('.result-header strong').should('not.be.empty')
          cy.get('.completion-time').should('not.be.empty')
          cy.get('.result-horse').should('have.length', 10)
          
          // Each horse result should be valid
          cy.get('.result-horse').each($horse => {
            cy.wrap($horse).within(() => {
              cy.get('.position').invoke('text').should('match', /^([1-9]|10)$/)
              cy.get('.name').should('not.be.empty')
              cy.get('.time').invoke('text').should('match', /^\d+(\.\d{1,2})?s$/)
            })
          })
        })
      })
    })

    it('should maintain program-result correspondence', () => {
      cy.generateProgram()
      
      // Store program data
      const programData = []
      cy.get('.right-panel .program-item').each(($item, index) => {
        cy.wrap($item).within(() => {
          cy.get('.program-header strong').then($header => {
            programData[index] = $header.text()
          })
        })
      })
      
      cy.startRacing(true)
      
      // Verify results match program
      cy.get('.right-panel .result-item').each(($item, index) => {
        cy.wrap($item).within(() => {
          cy.get('.result-header strong').should('contain', 
            programData[index]?.split(' - ')[1] || '') // Extract distance
        })
      })
    })

    it('should handle state persistence across different interactions', () => {
      // Create complex state
      cy.generateProgram()
      cy.startRacing()
      cy.waitForRaceCompletion(2)
      cy.pauseRacing()
      
      // Interact with different parts of UI
      cy.get('.left-panel').click()
      cy.get('.center-panel').click()
      cy.get('.right-panel').click()
      
      // Resume and verify state is maintained
      cy.startRacing()
      cy.get('.right-panel .result-item').should('have.length', 2)
    })
  })

  context('Performance Under Load', () => {
    it('should handle extended racing sessions efficiently', () => {
      // Run multiple complete race sessions
      for (let session = 1; session <= 3; session++) {
        cy.log(`Running extended session ${session}`)
        
        cy.generateProgram()
        cy.startRacing(true)
        
        // Verify all 6 races completed
        cy.get('.right-panel .result-item').should('have.length', 6)
        
        // System should remain responsive
        cy.get('#app').should('be.visible')
      }
    })

    it('should maintain performance with rapid user actions', () => {
      const startTime = Date.now()
      
      // Perform many rapid actions on available buttons
      for (let i = 0; i < 10; i++) {
        cy.get('button').contains(/GENERATE PROGRAM|START|PAUSE/).then($btn => {
          if (!$btn.is(':disabled')) {
            cy.wrap($btn).click({ force: true })
          }
        })
        cy.wait(100)
      }
      
      const endTime = Date.now()
      const totalTime = endTime - startTime
      
      // Should complete within reasonable time
      expect(totalTime).to.be.lessThan(5000)
      
      // Should still have valid program
      cy.verifyRaceProgram()
    })

    it('should handle memory efficiently during long sessions', () => {
      // Simulate memory-intensive operations
      for (let i = 0; i < 5; i++) {
        cy.generateProgram()
        cy.startRacing()
        cy.pauseRacing()
        // Generate new program for next iteration
        cy.get('button').contains('GENERATE PROGRAM').click()
      }
      
      // Should still be functional - check core functionality
      cy.get('#app').should('be.visible')
      cy.get('h1').should('contain', 'Horse Racing')
      cy.get('.horse-row').should('have.length', 20)
      cy.get('button').contains('GENERATE PROGRAM').should('be.visible')
      cy.get('button').contains('START').should('be.enabled') // Should be enabled after program generation
    })

    it('should maintain animation smoothness under load', () => {
      cy.generateProgram()
      cy.startRacing()
    
      // Add load by interacting during animation
      for (let i = 0; i < 10; i++) {
        cy.get('.left-panel').click()
        cy.wait(100)
      }
      
      // Animation should continue smoothly
      cy.get('.center-panel .horse').should('be.visible')
    })
  })

  context('Edge Cases and Boundary Conditions', () => {
    it('should handle maximum number of races correctly', () => {
      cy.generateProgram()
      cy.startRacing(true)
      
      // Should have exactly 6 results, no more
      cy.get('.right-panel .result-item').should('have.length', 6)
      
      // Should not continue racing after 6 races
      cy.get('button').should('contain', 'COMPLETED')
      cy.get('.race-track-header h3').should('not.contain', 'Racing in progress')
    })

    it('should handle minimum and maximum race times', () => {
      cy.generateProgram()
      cy.startRacing()
      cy.waitForRaceCompletion(1)
      
      cy.get('.right-panel .result-item').first().within(() => {
        cy.get('.result-horse .time').each($time => {
          const timeText = $time.text()
          const timeValue = parseFloat(timeText.replace('s', ''))
          
          // Race times should be reasonable
          expect(timeValue).to.be.greaterThan(0)
          expect(timeValue).to.be.lessThan(1000) // Very generous upper bound
        })
      })
    })

    it('should handle horse condition boundary values', () => {
      // Ensure horses are loaded first
      cy.waitForAppToLoad()
      cy.generateProgram()
      
      // Wait a moment for horses to be fully loaded
      cy.wait(500)
      
      cy.get('.left-panel .horse-row').should('have.length', 20)
      
      // Wait for condition values to be populated
      cy.get('.left-panel .horse-row .col-condition').first().should('not.be.empty')
      
      // Verify condition values are within bounds (exclude header)
      cy.get('.left-panel .horse-row .col-condition').should('have.length', 20).each($condition => {
        cy.wrap($condition).invoke('text').then(text => {
          console.log('condition text:', text)
          const cleanText = text.trim()
          
          // Skip empty conditions (shouldn't happen but safety check)
          if (!cleanText) {
            throw new Error('Empty condition value found')
          }
          
          const value = parseInt(cleanText)
          
          // Add validation for NaN
          if (isNaN(value)) {
            throw new Error(`Invalid condition value: "${cleanText}"`)
          }
          
          expect(value).to.be.at.least(1)
          expect(value).to.be.at.most(100)
        })
      })
    })

    it('should handle race completion edge cases', () => {
      cy.generateProgram()
      cy.startRacing()
      
      // Wait for race to almost complete, then pause/resume
      cy.wait(4000) // Near end of 5-second race
      cy.pauseRacing()
      cy.wait(500)
      cy.startRacing()
      
      // Should still complete properly
      cy.waitForRaceCompletion(1)
      cy.verifyRaceResult(1, 1200)
    })
  })

  context('Cross-Browser Compatibility Simulation', () => {
    it('should handle different event timing patterns', () => {
      // Simulate different browser event handling
      cy.generateProgram()
      
      // Fast clicks (simulating different browsers)
      cy.get('button').contains('START').click()
      cy.wait(10)
      cy.get('button').contains('PAUSE').click()
      
      // Should handle gracefully - button should be in valid state
      cy.get('button').then($btn => {
        const text = $btn.text()
        expect(text).to.satisfy(text => text.includes('START') || text.includes('PAUSE'))
      })
    })

    it('should handle different animation frame rates', () => {
      cy.generateProgram()
      cy.startRacing()
      
      // Simulate varying frame rates by changing update frequency
      cy.get('.center-panel .horse').should('be.visible')
      
      // Should maintain animation regardless of timing
      cy.wait(2000)
      cy.get('.center-panel .horse').should('be.visible')
    })
  })
})
