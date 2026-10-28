/**
 * Domain Adapters Index — PS-074 Ganjam Disaster Intelligence
 * Unifies all data sources and defines extension points for future intelligence modules.
 */

export * from './weatherAdapter'
export * from './citizenAdapter'
export * from './shelterAdapter'
export * from './emergencyAdapter'
export * from './riskAdapter'

// Extension points for subsequent phases (stubs for Phase 1 shell)
export * from './floodAdapter'

export * from './satelliteAdapter'

export * from './cycloneAdapter'

export * from './vulnerabilityAdapter'

export * from './allocationAdapter'

export const damageAdapter = {
  classifyDamageVision: async () => {
    // Implemented in Phase 5/6 via multimodal vision pipeline
    return null
  },
}

