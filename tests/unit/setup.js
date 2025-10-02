// Jest setup file for Vue 2 tests
import { config } from '@vue/test-utils'

// Mock global console methods if needed
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}

// Configure Vue Test Utils for better testing
config.mocks = {
  $route: {
    path: '/',
    params: {}
  },
  $router: {
    push: jest.fn()
  }
}
