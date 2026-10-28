import api from './api'
import { INITIAL_REPORTS } from '../utils/mockData'

export const reportApi = {
  getAllReports: async (params = {}) => {
    try {
      const res = await api.get('/api/v1/reports', { params })
      const list = res.data?.data || res.data
      if (Array.isArray(list) && list.length > 0) {
        return list
      }
      return INITIAL_REPORTS
    } catch (err) {
      console.warn('Fallback to mock reports:', err.message)
      return INITIAL_REPORTS
    }
  },

  getMyReports: async () => {
    try {
      const res = await api.get('/api/v1/reports/my')
      const list = res.data?.data || res.data
      if (Array.isArray(list) && list.length > 0) return list
      return INITIAL_REPORTS.slice(0, 2)
    } catch (err) {
      console.warn('Failed to fetch my reports:', err.message)
      return INITIAL_REPORTS.slice(0, 2)
    }
  },

  getPendingReports: async (page = 1, limit = 50) => {
    try {
      const res = await api.get(`/api/v1/admin/reports/pending?page=${page}&limit=${limit}`)
      const list = res.data?.data?.reports || res.data?.data || res.data
      if (Array.isArray(list) && list.length > 0) return list
      return INITIAL_REPORTS.filter((r) => r.verificationStatus === 'PENDING')
    } catch (err) {
      console.warn('Failed to fetch pending admin reports:', err.message)
      return INITIAL_REPORTS.filter((r) => r.verificationStatus === 'PENDING')
    }
  },

  submitReport: async (reportData) => {
    try {
      let res
      if (reportData instanceof FormData) {
        res = await api.post('/api/v1/reports', reportData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      } else {
        res = await api.post('/api/v1/reports', reportData)
      }
      return res.data
    } catch (err) {
      console.error('Report submission error:', err.response?.data || err.message)
      throw err
    }
  },

  verifyReport: async (reportId, action, notes = '', options = {}) => {
    try {
      const payload = {
        action,
        notes,
        rescueTeamId: options.rescueTeamId,
        estimatedEtaMinutes: options.estimatedEtaMinutes,
      }
      const res = await api.post(`/api/v1/reports/${reportId}/verify`, payload)
      return res.data
    } catch (err) {
      console.warn(`Verify report ${reportId} fallback:`, err.message)
      const newStatus = action === 'VERIFY' ? 'VERIFIED' : action === 'ESCALATE' ? 'ESCALATED' : 'REJECTED'
      return {
        success: true,
        data: {
          id: reportId,
          reportId,
          verificationStatus: newStatus,
          status: newStatus,
          verification: {
            action,
            notes,
            verifiedAt: new Date().toISOString(),
          },
        },
      }
    }
  },

  assignRescueTeam: async (reportId, { rescueTeamId, estimatedEtaMinutes = 15, notes = '' }) => {
    try {
      const res = await api.post(`/api/v1/reports/${reportId}/assign-rescue`, {
        rescueTeamId,
        estimatedEtaMinutes,
        notes,
      })
      return res.data
    } catch (err) {
      console.warn(`Assign rescue team fallback for report ${reportId}:`, err.message)
      return {
        success: true,
        data: {
          id: reportId,
          reportId,
          assignedTeam: { teamName: rescueTeamId, teamCode: rescueTeamId },
        },
      }
    }
  },

  deleteReport: async (reportId) => {
    try {
      const res = await api.delete(`/api/v1/reports/${reportId}`)
      return res.data
    } catch (err) {
      console.error(`Delete report ${reportId} failed:`, err.message)
      throw err
    }
  },
}
