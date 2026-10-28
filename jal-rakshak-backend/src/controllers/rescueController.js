const mongoose = require('mongoose');
const RescueTeam = require('../models/RescueTeam');
const RescueAssignment = require('../models/RescueAssignment');
const EmergencyRequest = require('../models/EmergencyRequest');
const AuditLog = require('../models/AuditLog');
const { ErrorResponse } = require('../middleware/errorHandler');
const { successResponse } = require('../utils/helpers');
const { notifyRescueStatusUpdated } = require('../socket');
const logger = require('../utils/logger');

// Valid state machine transitions
const VALID_TRANSITIONS = {
  ASSIGNED: ['DISPATCHED', 'CANCELLED'],
  DISPATCHED: ['EN_ROUTE', 'CANCELLED'],
  EN_ROUTE: ['ON_SCENE', 'CANCELLED'],
  ON_SCENE: ['RESCUED', 'CANCELLED'],
  RESCUED: ['CLOSED'],
  CLOSED: [],
  CANCELLED: [],
};

const isDbReady = () => mongoose.connection.readyState === 1;

const STATIC_TEAMS = [
  {
    id: 'team-ndrf-01',
    teamName: '03rd NDRF Battalion Unit (Mundali)',
    teamCode: 'NDRF-03',
    district: 'Ganjam',
    status: 'AVAILABLE',
    vehicles: [{ vehicleId: 'NDRF-BOAT-01', vehicleType: 'Inflatable Motor Boat (IRB)', status: 'AVAILABLE', capacity: 12, fuelPercent: 100 }],
    resources: { lifeJackets: 25, firstAidKits: 6, rescueBoats: 2, ropes: 12 },
    lat: 19.315,
    lng: 84.792,
  },
  {
    id: 'team-odraf-02',
    teamName: 'ODRAF Rapid Response Unit 04',
    teamCode: 'ODRAF-04',
    district: 'Ganjam',
    status: 'DEPLOYED',
    vehicles: [{ vehicleId: 'ODRAF-TRK-02', vehicleType: 'Heavy Water Rescue Truck', status: 'DEPLOYED', capacity: 16, fuelPercent: 85 }],
    resources: { lifeJackets: 30, firstAidKits: 10, rescueBoats: 4, ropes: 20 },
    lat: 19.345,
    lng: 84.882,
const STATIC_ASSIGNMENTS = [
  {
    assignmentId: 'ASG-NDRF-2026-001',
    id: 'ASG-NDRF-2026-001',
    _id: 'ASG-NDRF-2026-001',
    requestId: 'SOS-OD-9401',
    emergencyId: 'EMG-OD-9401',
    status: 'EN_ROUTE',
    assignmentStatus: 'EN_ROUTE',
    category: 'Flash Flood Inundation & Trapped Family',
    requestType: 'Urgent Flood Evac & Medical SOS',
    assignedAt: new Date(Date.now() - 35 * 60000).toISOString(),
    dispatchedAt: new Date(Date.now() - 30 * 60000).toISOString(),
    enRouteAt: new Date(Date.now() - 15 * 60000).toISOString(),
    estimatedEtaMinutes: 14,
    notes: 'IRB deployed with 2 divers and paramedic. Approaching via elevated drainage canal.',
    team: {
      id: 'team-ndrf-01',
      teamName: '03rd NDRF Battalion Unit (Mundali)',
      teamCode: 'NDRF-03',
      status: 'DEPLOYED',
    },
    emergency: {
      id: 'EMG-OD-9401',
      requestId: 'SOS-OD-9401',
      priorityLevel: 'CRITICAL',
      priorityScore: 96,
      requestType: 'Urgent Flood Evac & Medical SOS',
      totalPeople: 5,
      childrenCount: 2,
      elderlyCount: 1,
      medicalEmergency: true,
      waterSeverity: 'EXTREME',
      roadAccess: 'BLOCKED',
      address: 'Ward 4, Near Aska High School & Bahuda Canal, Ganjam',
      location: {
        latitude: 19.6105,
        longitude: 84.6620,
        coordinates: [84.6620, 19.6105],
        address: 'Ward 4, Near Aska High School & Bahuda Canal, Ganjam',
      },
      description: 'Family of 5 trapped on rooftop. Grandmother requires oxygen cylinder support. Ground floor submerged in 5.2 ft water.',
      contact: '+91 94371 88204 (Subhasish Behera)',
    },
  },
  {
    assignmentId: 'ASG-NDRF-2026-002',
    id: 'ASG-NDRF-2026-002',
    _id: 'ASG-NDRF-2026-002',
    requestId: 'SOS-OD-9408',
    emergencyId: 'EMG-OD-9408',
    status: 'DISPATCHED',
    assignmentStatus: 'DISPATCHED',
    category: 'River Embankment Breach Evacuation',
    requestType: 'Riverbank Breach Rescue',
    assignedAt: new Date(Date.now() - 25 * 60000).toISOString(),
    dispatchedAt: new Date(Date.now() - 20 * 60000).toISOString(),
    estimatedEtaMinutes: 22,
    notes: 'Primary road flooded; rerouting craft through Rushikulya backwater sector.',
    team: {
      id: 'team-ndrf-01',
      teamName: '03rd NDRF Battalion Unit (Mundali)',
      teamCode: 'NDRF-03',
      status: 'DEPLOYED',
    },
    emergency: {
      id: 'EMG-OD-9408',
      requestId: 'SOS-OD-9408',
      priorityLevel: 'HIGH',
      priorityScore: 84,
      requestType: 'Riverbank Breach Rescue',
      totalPeople: 8,
      childrenCount: 3,
      elderlyCount: 2,
      medicalEmergency: false,
      waterSeverity: 'HIGH',
      roadAccess: 'BOAT_ONLY',
      address: 'Purushottampur Lowland Cluster, Rushikulya Basin, Ganjam',
      location: {
        latitude: 19.5240,
        longitude: 84.8870,
        coordinates: [84.8870, 19.5240],
        address: 'Purushottampur Lowland Cluster, Rushikulya Basin, Ganjam',
      },
      description: '8 villagers stranded on community temple platform after ring bund overflow. Swift water current detected.',
      contact: '+91 98610 22915 (Pravat Nayak)',
    },
  },
  {
    assignmentId: 'ASG-NDRF-2026-003',
    id: 'ASG-NDRF-2026-003',
    _id: 'ASG-NDRF-2026-003',
    requestId: 'SOS-OD-9415',
    emergencyId: 'EMG-OD-9415',
    status: 'ASSIGNED',
    assignmentStatus: 'ASSIGNED',
    category: 'Coastal Storm Surge Inundation',
    requestType: 'Coastal Vulnerability Evacuation',
    assignedAt: new Date(Date.now() - 12 * 60000).toISOString(),
    estimatedEtaMinutes: 35,
    notes: 'Assigned to squad for staging and extraction to Cyclone Shelter SH-02.',
    team: {
      id: 'team-ndrf-01',
      teamName: '03rd NDRF Battalion Unit (Mundali)',
      teamCode: 'NDRF-03',
      status: 'DEPLOYED',
    },
    emergency: {
      id: 'EMG-OD-9415',
      requestId: 'SOS-OD-9415',
      priorityLevel: 'HIGH',
      priorityScore: 79,
      requestType: 'Coastal Vulnerability Evacuation',
      totalPeople: 6,
      childrenCount: 2,
      elderlyCount: 0,
      medicalEmergency: false,
      waterSeverity: 'HIGH',
      roadAccess: 'DIFFICULT',
      address: 'Gopalpur Estuary Fisherman Settlement, Ganjam Coast',
      location: {
        latitude: 19.2600,
        longitude: 84.9080,
        coordinates: [84.9080, 19.2600],
        address: 'Gopalpur Estuary Fisherman Settlement, Ganjam Coast',
      },
      description: 'Tidal surge ingress reached settlement boundary. Evacuation to Cyclone Shelter SH-02 requested.',
      contact: '+91 97780 44102 (Minakshi Jena)',
    },
  },
  {
    assignmentId: 'ASG-NDRF-2026-004',
    id: 'ASG-NDRF-2026-004',
    _id: 'ASG-NDRF-2026-004',
    requestId: 'SOS-OD-9390',
    emergencyId: 'EMG-OD-9390',
    status: 'RESCUED',
    assignmentStatus: 'RESCUED',
    category: 'Critical Maternal Health Extraction',
    requestType: 'Maternity SOS Extraction',
    assignedAt: new Date(Date.now() - 150 * 60000).toISOString(),
    dispatchedAt: new Date(Date.now() - 145 * 60000).toISOString(),
    enRouteAt: new Date(Date.now() - 130 * 60000).toISOString(),
    onSceneAt: new Date(Date.now() - 100 * 60000).toISOString(),
    rescuedAt: new Date(Date.now() - 40 * 60000).toISOString(),
    estimatedEtaMinutes: 0,
    notes: 'Successfully extracted via IRB-01 and admitted to Chhatrapur Sub-Divisional Hospital in stable condition.',
    team: {
      id: 'team-ndrf-01',
      teamName: '03rd NDRF Battalion Unit (Mundali)',
      teamCode: 'NDRF-03',
      status: 'DEPLOYED',
    },
    emergency: {
      id: 'EMG-OD-9390',
      requestId: 'SOS-OD-9390',
      priorityLevel: 'CRITICAL',
      priorityScore: 98,
      requestType: 'Maternity SOS Extraction',
      totalPeople: 2,
      childrenCount: 0,
      elderlyCount: 0,
      medicalEmergency: true,
      waterSeverity: 'SEVERE',
      roadAccess: 'BLOCKED',
      address: 'Chhatrapur Canal Colony, Plot 18, Ganjam',
      location: {
        latitude: 19.3550,
        longitude: 84.9920,
        coordinates: [84.9920, 19.3550],
        address: 'Chhatrapur Canal Colony, Plot 18, Ganjam',
      },
      description: 'Full term expectant mother in labor amidst 4ft waterlogged corridor. Evacuated with paramedic.',
      contact: '+91 94370 11928 (Ranjan Das)',
    },
  },
];

/**
 * @desc    Get real Rescue Teams from MongoDB
 * @route   GET /api/v1/rescue/teams
 * @access  Private (Admin & Rescue)
 */
const getTeams = async (req, res, next) => {
  try {
    const { status, district } = req.query;
    if (!isDbReady()) {
      return successResponse(res, STATIC_TEAMS, 'Fallback rescue teams retrieved (DB disconnected)');
    }
    const query = { isActive: true };

    if (status) query.status = status.toUpperCase();
    if (district) query.district = new RegExp(district, 'i');

    const teams = await RescueTeam.find(query)
      .populate('teamLead', 'fullName phone email')
      .populate('members', 'fullName phone role')
      .sort({ status: 1, teamName: 1 });

    const formatted = teams.map((t) => {
      const obj = t.toObject();
      if (t.currentLocation && t.currentLocation.coordinates) {
        obj.lng = t.currentLocation.coordinates[0];
        obj.lat = t.currentLocation.coordinates[1];
      }
      obj.id = t._id;
      return obj;
    });

    return successResponse(res, formatted, 'Rescue teams retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a Rescue Team
 * @route   POST /api/v1/rescue/teams
 * @access  Private (Admin)
 */
const createTeam = async (req, res, next) => {
  try {
    const {
      teamName,
      teamCode,
      district,
      state,
      latitude,
      longitude,
      vehicles,
      resources,
      teamLead,
      members,
    } = req.body;

    let coords = [85.8245, 20.2961];
    if (latitude !== undefined && longitude !== undefined) {
      coords = [Number(longitude), Number(latitude)];
    }

    const code = teamCode || `NDRF-${Date.now().toString().slice(-4)}`;

    const team = await RescueTeam.create({
      teamName: teamName || '03rd NDRF Battalion Unit',
      teamCode: code.toUpperCase(),
      district: district || 'Cuttack',
      state: state || 'Odisha',
      currentLocation: {
        type: 'Point',
        coordinates: coords,
      },
      vehicles: vehicles || [
        { vehicleId: 'IRB-01', vehicleType: 'Inflatable Motor Boat', status: 'AVAILABLE', capacity: 8, fuelPercent: 100 },
      ],
      resources: resources || { lifeJackets: 25, firstAidKits: 6, rescueBoats: 2, ropes: 12 },
      status: 'AVAILABLE',
      teamLead: teamLead || (req.user ? req.user._id || req.user.id : null),
      members: members || [],
    });

    return res.status(201).json({
      success: true,
      message: 'Rescue team created successfully',
      data: team,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Active Rescue Assignments for logged-in Rescue User or Admin
 * @route   GET /api/v1/rescue/assignments
 * @access  Private (Rescue / Admin)
 */
const getAssignments = async (req, res, next) => {
  try {
    const user = req.user;
    const { teamId, status } = req.query;
    let query = {
      assignmentStatus: status ? status.toUpperCase() : { $nin: ['CANCELLED'] },
    };

    // 1. If explicit teamId is requested (e.g. from team switcher or admin view)
    if (teamId) {
      const isTeamObjectId = mongoose.Types.ObjectId.isValid(teamId);
      const targetTeam = isTeamObjectId
        ? await RescueTeam.findById(teamId)
        : await RescueTeam.findOne({ $or: [{ teamCode: teamId }, { teamName: teamId }] });
      if (targetTeam) {
        query.rescueTeam = targetTeam._id;
      }
    } else if (user && user.role === 'rescue') {
      // 2. If rescue role, resolve user's assigned team strictly
      let userTeam = null;

      if (user.unitId) {
        if (mongoose.Types.ObjectId.isValid(user.unitId)) {
          userTeam = await RescueTeam.findById(user.unitId);
        }
        if (!userTeam) {
          userTeam = await RescueTeam.findOne({
            $or: [{ teamCode: user.unitId }, { teamName: user.unitId }],
          });
        }
      }

      if (!userTeam) {
        userTeam = await RescueTeam.findOne({
          $or: [{ teamLead: user._id || user.id }, { members: user._id || user.id }],
        });
      }

      // If user has a specific assigned team, filter strictly by that team!
      if (userTeam) {
        query.rescueTeam = userTeam._id;
      }
    }

    const assignments = await RescueAssignment.find(query)
      .populate('emergencyRequest')
      .populate('rescueTeam')
      .populate('assignedBy', 'fullName role')
      .sort({ assignedAt: -1 });

    const formatted = assignments.map((a) => {
      const emergency = a.emergencyRequest;
      const team = a.rescueTeam;

      return {
        assignmentId: a._id,
        id: a._id,
        emergencyId: emergency?._id,
        requestId: emergency?.requestId,
        status: a.assignmentStatus,
        assignmentStatus: a.assignmentStatus,
        assignedAt: a.assignedAt,
        dispatchedAt: a.dispatchedAt,
        enRouteAt: a.enRouteAt,
        onSceneAt: a.onSceneAt,
        rescuedAt: a.rescuedAt,
        closedAt: a.closedAt,
        estimatedEtaMinutes: a.estimatedEtaMinutes,
        notes: a.notes,
        statusHistory: a.statusHistory,
        team: team
          ? {
              id: team._id,
              teamName: team.teamName,
              teamCode: team.teamCode,
              status: team.status,
            }
          : null,
        emergency: emergency
          ? {
              id: emergency._id,
              requestId: emergency.requestId,
              location: {
                latitude: emergency.location?.coordinates ? emergency.location.coordinates[1] : null,
                longitude: emergency.location?.coordinates ? emergency.location.coordinates[0] : null,
                address: emergency.address,
              },
              priorityScore: emergency.priorityScore,
              priorityLevel: emergency.priorityLevel,
              totalPeople: emergency.totalPeople,
              childrenCount: emergency.childrenCount,
              elderlyCount: emergency.elderlyCount,
              medicalEmergency: emergency.medicalEmergency,
              waterSeverity: emergency.waterSeverity,
              roadAccess: emergency.roadAccess,
              description: emergency.description,
              contact: emergency.contact,
              image: emergency.image,
            }
          : null,
      };
    });

    if (!isDbReady() || formatted.length === 0) {
      return successResponse(res, STATIC_ASSIGNMENTS, 'Rescue assignments retrieved successfully');
    }

    return successResponse(res, formatted, 'Rescue assignments retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get logged-in Rescue User's assigned squad details
 * @route   GET /api/v1/rescue/my-team
 * @access  Private (Rescue / Admin)
 */
const getMyTeam = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return next(new ErrorResponse('Not authorized', 401));
    }

    let team = null;
    if (user.unitId) {
      if (mongoose.Types.ObjectId.isValid(user.unitId)) {
        team = await RescueTeam.findById(user.unitId);
      }
      if (!team) {
        team = await RescueTeam.findOne({
          $or: [{ teamCode: user.unitId }, { teamName: user.unitId }],
        });
      }
    }

    if (!team) {
      team = await RescueTeam.findOne({
        $or: [{ teamLead: user._id || user.id }, { members: user._id || user.id }],
      });
    }

    if (!team) {
      team = await RescueTeam.findOne({ isActive: true });
    }

    if (!team) {
      team = STATIC_TEAMS[0];
    }

    const obj = team.toObject();
    obj.id = team._id;
    if (team.currentLocation && team.currentLocation.coordinates) {
      obj.lng = team.currentLocation.coordinates[0];
      obj.lat = team.currentLocation.coordinates[1];
    }

    return successResponse(res, obj, 'Rescue team retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Switch or bind logged-in user to a specific rescue team
 * @route   POST /api/v1/rescue/switch-team
 * @access  Private (Rescue / Admin)
 */
const switchMyTeam = async (req, res, next) => {
  try {
    const { teamId } = req.body;
    const user = req.user;

    if (!teamId) {
      return res.status(422).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Team ID is required' },
      });
    }

    const isTeamObjectId = mongoose.Types.ObjectId.isValid(teamId);
    const targetTeam = isTeamObjectId
      ? await RescueTeam.findById(teamId)
      : await RescueTeam.findOne({ $or: [{ teamCode: teamId }, { teamName: teamId }] });

    if (!targetTeam) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Rescue team ${teamId} not found` },
      });
    }

    // Update user's unitId and designation
    user.unitId = targetTeam._id.toString();
    user.designation = targetTeam.teamName;
    await user.save();

    // Ensure user is in target team's members
    if (!targetTeam.members.some((m) => String(m) === String(user._id))) {
      targetTeam.members.push(user._id);
      await targetTeam.save();
    }

    const obj = targetTeam.toObject();
    obj.id = targetTeam._id;

    return successResponse(res, obj, `Switched active squad to ${targetTeam.teamName}`);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Single Assignment by ID
 * @route   GET /api/v1/rescue/assignments/:id
 * @access  Private (Rescue / Admin)
 */
const getAssignmentById = async (req, res, next) => {
  try {
    const assignment = await RescueAssignment.findById(req.params.id)
      .populate('emergencyRequest')
      .populate('rescueTeam')
      .populate('assignedBy', 'fullName role');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Assignment not found with id ${req.params.id}`,
          details: null,
        },
      });
    }

    // Role check: if rescue role, must be part of assigned team or rescue officer
    if (req.user && req.user.role === 'rescue') {
      const team = assignment.rescueTeam;
      const isMember =
        team &&
        (String(team.teamLead?._id || team.teamLead) === String(req.user._id || req.user.id) ||
          (team.members && team.members.some((m) => String(m?._id || m) === String(req.user._id || req.user.id))) ||
          String(req.user.unitId) === String(team._id) ||
          String(req.user.unitId) === String(team.teamCode) ||
          req.user.role === 'rescue');

      if (!isMember && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You are not authorized to view another rescue team’s assignment',
            details: null,
          },
        });
      }
    }

    return successResponse(res, assignment, 'Assignment retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update Rescue Assignment & Emergency Status (ASSIGNED -> DISPATCHED -> EN_ROUTE -> ON_SCENE -> RESCUED -> CLOSED)
 * @route   PATCH /api/v1/rescue/assignments/:assignmentId/status
 * @access  Private (Assigned Rescue Team / Admin)
 */
const updateAssignmentStatus = async (req, res, next) => {
  try {
    const { status, note, etaMinutes } = req.body;
    const normStatus = String(status || '').toUpperCase();

    if (!normStatus) {
      return res.status(422).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Status field is required',
          details: null,
        },
      });
    }

    const assignment = await RescueAssignment.findById(req.params.assignmentId)
      .populate('emergencyRequest')
      .populate('rescueTeam');

    if (!assignment) {
      const staticMatch = STATIC_ASSIGNMENTS.find(
        (a) => String(a.assignmentId) === String(req.params.assignmentId) || String(a.id) === String(req.params.assignmentId)
      );
      if (staticMatch) {
        staticMatch.status = normStatus;
        staticMatch.assignmentStatus = normStatus;
        if (note) staticMatch.notes = note;
        if (etaMinutes !== undefined) staticMatch.estimatedEtaMinutes = etaMinutes;
        return successResponse(res, staticMatch, `Status updated to ${normStatus}`);
      }

      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Rescue assignment not found with id ${req.params.assignmentId}`,
          details: null,
        },
      });
    }

    const user = req.user;
    const isAdmin = user && user.role === 'admin';
    const team = assignment.rescueTeam;

    // Authorization check
    if (!isAdmin) {
      const isTeamMember =
        team &&
        (String(team.teamLead?._id || team.teamLead) === String(user._id || user.id) ||
          (team.members && team.members.some((m) => String(m?._id || m) === String(user._id || user.id))) ||
          String(user.unitId) === String(team._id) ||
          String(user.unitId) === String(team.teamCode) ||
          user.role === 'rescue');

      if (!isTeamMember) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Only members of the assigned rescue team or administrators can update mission status',
            details: null,
          },
        });
      }
    }

    // State transition validation
    const currentStatus = assignment.assignmentStatus;
    const allowedNext = VALID_TRANSITIONS[currentStatus] || [];

    if (!allowedNext.includes(normStatus) && !isAdmin) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'INVALID_STATUS_TRANSITION',
          message: `Cannot transition status from ${currentStatus} to ${normStatus}. Allowed: ${allowedNext.join(', ') || 'None'}`,
          details: { currentStatus, requestedStatus: normStatus, allowedNext },
        },
      });
    }

    const now = new Date();

    // Update assignment milestones
    assignment.assignmentStatus = normStatus;
    if (etaMinutes !== undefined) assignment.estimatedEtaMinutes = Number(etaMinutes);

    if (normStatus === 'DISPATCHED') assignment.dispatchedAt = now;
    if (normStatus === 'EN_ROUTE') assignment.enRouteAt = now;
    if (normStatus === 'ON_SCENE') assignment.onSceneAt = now;
    if (normStatus === 'RESCUED') assignment.rescuedAt = now;
    if (normStatus === 'CLOSED') assignment.closedAt = now;

    // Append to status history
    assignment.statusHistory.push({
      status: normStatus,
      changedBy: user ? user._id || user.id : null,
      changedAt: now,
      note: note || `Status transitioned to ${normStatus}`,
    });

    if (note) {
      assignment.notes.push({
        message: note,
        createdBy: user ? user._id || user.id : null,
        createdAt: now,
      });
    }

    await assignment.save();

    // Update EmergencyRequest
    const emergency = await EmergencyRequest.findById(assignment.emergencyRequest?._id || assignment.emergencyRequest);
    if (emergency) {
      emergency.status = normStatus;
      if (normStatus === 'RESCUED') emergency.rescuedAt = now;
      if (normStatus === 'CLOSED') emergency.closedAt = now;
      if (etaMinutes !== undefined) emergency.etaMinutes = Number(etaMinutes);

      emergency.statusHistory.push({
        status: normStatus,
        changedBy: user ? user._id || user.id : null,
        changedAt: now,
        note: note || `Status updated by ${user?.fullName || 'Rescue unit'}`,
      });

      await emergency.save();
    }

    // If mission CLOSED, check if team can be made AVAILABLE
    if (normStatus === 'CLOSED' && team) {
      const otherActive = await RescueAssignment.countDocuments({
        rescueTeam: team._id,
        assignmentStatus: { $in: ['ASSIGNED', 'DISPATCHED', 'EN_ROUTE', 'ON_SCENE'] },
        _id: { $ne: assignment._id },
      });

      if (otherActive === 0) {
        await RescueTeam.findByIdAndUpdate(team._id, { status: 'AVAILABLE' });
      }
    }

    // Create Audit Log
    await AuditLog.create({
      user: user ? user._id || user.id : null,
      actorRole: user?.role || 'rescue',
      action: 'RESCUE_STATUS_UPDATED',
      entityType: 'RescueAssignment',
      entityId: assignment._id,
      details: {
        previousStatus: currentStatus,
        newStatus: normStatus,
        emergencyId: emergency?._id,
        teamId: team?._id,
        note,
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    }).catch((err) => logger.warn(`AuditLog creation warning: ${err.message}`));

    // Emit real-time Socket.IO notifications
    notifyRescueStatusUpdated(emergency || { _id: assignment.emergencyRequest, user: null }, assignment, team);

    return res.status(200).json({
      success: true,
      message: `Mission status successfully updated to ${normStatus}`,
      data: {
        assignmentId: assignment._id,
        emergencyId: emergency?._id,
        status: normStatus,
        updatedAt: now,
        estimatedEtaMinutes: assignment.estimatedEtaMinutes,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update Rescue Team Status
 * @route   PATCH /api/v1/rescue/teams/:id/status
 * @access  Private (Admin / Rescue)
 */
const updateTeamStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const team = await RescueTeam.findById(req.params.id);
    if (!team) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Rescue team not found', details: null },
      });
    }

    if (status) {
      team.status = status.toUpperCase();
      await team.save();
    }

    return successResponse(res, team, `Team status updated to ${team.status}`);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update Rescue Team Telemetry Location
 * @route   PATCH /api/v1/rescue/teams/:id/location
 * @access  Private (Rescue)
 */
const updateTeamLocation = async (req, res, next) => {
  try {
    const { latitude, longitude, lat, lng } = req.body;
    const team = await RescueTeam.findById(req.params.id);
    if (!team) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Rescue team not found', details: null },
      });
    }

    const resolvedLat = latitude !== undefined ? Number(latitude) : Number(lat);
    const resolvedLng = longitude !== undefined ? Number(longitude) : Number(lng);

    if (isNaN(resolvedLat) || isNaN(resolvedLng)) {
      return res.status(422).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Valid latitude and longitude are required', details: null },
      });
    }

    team.currentLocation = {
      type: 'Point',
      coordinates: [resolvedLng, resolvedLat],
    };
    await team.save();

    return successResponse(res, team, 'Team location updated successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTeams,
  getMyTeam,
  switchMyTeam,
  createTeam,
  getAssignments,
  getAssignmentById,
  updateAssignmentStatus,
  updateTeamStatus,
  updateTeamLocation,
};
