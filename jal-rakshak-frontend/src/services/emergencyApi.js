import api from './api'
import {
  INITIAL_EMERGENCIES,
  INITIAL_RESCUE_TEAMS,
  INITIAL_RESCUE_ASSIGNMENTS,
  INITIAL_MY_TEAM,
} from '../utils/mockData'

export const emergencyApi = {
  createEmergencyRequest: async (data) => {
    try {
      const res = await api.post('/api/v1/emergency/request', data)
      return res.data
    } catch (err) {
      console.error('Create emergency error:', err.response?.data || err.message)
      throw err
    }
  },

  getMyEmergencies: async () => {
    try {
      const res = await api.get('/api/v1/emergency/my')
      return res.data?.data || res.data || []
    } catch (err) {
      console.warn('Failed to fetch my emergencies:', err.message)
      return []
    }
  },

  getAllRequests: async (params = {}) => {
    try {
      const res = await api.get('/api/v1/emergency/requests', { params })
      const list = res.data?.data || res.data
      if (Array.isArray(list) && list.length > 0) {
        return list
      }
      return INITIAL_EMERGENCIES
    } catch (err) {
      console.warn('Fallback to mock emergencies:', err.message)
      return INITIAL_EMERGENCIES
    }
  },

  getRequestById: async (id) => {
    try {
      const res = await api.get(`/api/v1/emergency/${id}`)
      return res.data?.data || res.data
    } catch (err) {
      console.error(`Get emergency ${id} failed:`, err.message)
      const found = INITIAL_EMERGENCIES.find(e => e.id === id || e.requestId === id)
      if (found) return found
      throw err
    }
  },

  getAvailableRescueTeams: async (params = {}) => {
    try {
      const res = await api.get('/api/v1/rescue/teams', { params })
      const list = res.data?.data || res.data
      if (Array.isArray(list) && list.length > 0) {
        return list
      }
      return INITIAL_RESCUE_TEAMS
    } catch (err) {
      console.warn('Fallback to mock rescue teams:', err.message)
      return INITIAL_RESCUE_TEAMS
    }
  },

  assignTeam: async (emergencyId, { rescueTeamId, estimatedEtaMinutes, note }) => {
    try {
      const res = await api.post(`/api/v1/emergency/${emergencyId}/assign`, {
        rescueTeamId,
        estimatedEtaMinutes,
        note,
      })
      return res.data
    } catch (err) {
      console.warn(`Assign team fallback for ${emergencyId}:`, err.message)
      const matchedTeam = INITIAL_RESCUE_TEAMS.find(t => t.id === rescueTeamId || t.teamCode === rescueTeamId)
      return {
        success: true,
        data: {
          id: emergencyId,
          emergencyId,
          status: 'ASSIGNED',
          assignedTeam: matchedTeam || { teamName: rescueTeamId, teamCode: rescueTeamId },
          estimatedEtaMinutes,
          note,
        },
      }
    }
  },

  getRescueAssignments: async () => {
    try {
      const res = await api.get('/api/v1/rescue/assignments')
      const list = res.data?.data || res.data
      if (Array.isArray(list) && list.length > 0) {
        return list
      }
      return INITIAL_RESCUE_ASSIGNMENTS
    } catch (err) {
      console.warn('Fallback to mock rescue assignments:', err.message)
      return INITIAL_RESCUE_ASSIGNMENTS
    }
  },

  updateAssignmentStatus: async (assignmentId, { status, note, etaMinutes }) => {
    try {
      const res = await api.patch(`/api/v1/rescue/assignments/${assignmentId}/status`, {
        status,
        note,
        etaMinutes,
      })
      return res.data
    } catch (err) {
      console.warn(`Simulating status update for assignment ${assignmentId} locally:`, err.message)
      return {
        success: true,
        data: {
          assignmentId,
          status,
          assignmentStatus: status,
          notes: note,
          estimatedEtaMinutes: etaMinutes,
          updatedAt: new Date().toISOString(),
        },
      }
    }
  },

  getMyTeam: async () => {
    try {
      const res = await api.get('/api/v1/rescue/my-team')
      const team = res.data?.data || res.data
      if (team && team.teamName) {
        return team
      }
      return INITIAL_MY_TEAM
    } catch (err) {
      console.warn('Fallback to mock my team:', err.message)
      return INITIAL_MY_TEAM
    }
  },

  switchMyTeam: async (teamId) => {
    try {
      const res = await api.post('/api/v1/rescue/switch-team', { teamId })
      return res.data?.data || res.data
    } catch (err) {
      console.error('Failed to switch team:', err.response?.data || err.message)
      throw err
    }
  },
}
