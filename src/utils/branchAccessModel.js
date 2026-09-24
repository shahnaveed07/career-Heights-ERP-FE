import { normalizeRole, SYSTEM_ROLES } from './permissionManager.js';

/**
 * Multi-Branch Access & Active Branch Model
 * 
 * Rules:
 * 1. User has assignedBranchIds (and optionally a primaryBranchId / branchId).
 * 2. Assigned Branches define clearance / membership; Active Branch defines the current operational focus.
 * 3. Exactly ONE branch is ACTIVE at any given time (or 'all' for authorized central leadership).
 * 4. 'all' is strictly restricted to SuperAdmin and HQ Admin.
 * 5. Branch Admins / Coordinators / Staff can ONLY switch between their explicitly assigned branches.
 * 6. Attempting to activate an unassigned branch must fail safely without state corruption.
 */

/**
 * Determines whether a user is authorized to view consolidated 'all' branches.
 */
export function canUserAccessAllBranches(user) {
  if (!user) return false;
  const canonicalRole = normalizeRole(user.role);
  if (canonicalRole === SYSTEM_ROLES.SUPER_ADMIN || canonicalRole === SYSTEM_ROLES.HQ_ADMIN) {
    return true;
  }
  const assigned = Array.isArray(user.assignedBranchIds) ? user.assignedBranchIds : [];
  return assigned.includes('all');
}

/**
 * Returns the normalized array of branch IDs that the user is assigned to.
 */
export function getUserAssignedBranchIds(user) {
  if (!user) return [];
  const assigned = Array.isArray(user.assignedBranchIds)
    ? [...user.assignedBranchIds]
    : user.branchId
    ? [user.branchId]
    : [];

  // Filter out the 'all' token to obtain actual concrete branch IDs
  return assigned.filter((id) => id && id !== 'all');
}

/**
 * Returns the primary/home branch ID for the user.
 */
export function getUserPrimaryBranchId(user) {
  if (!user) return 'b-hdw';
  return (
    user.primaryBranchId ||
    user.branchId ||
    getUserAssignedBranchIds(user)[0] ||
    'b-hdw'
  );
}

/**
 * Resolves the full list of Branch objects accessible to the user.
 */
export function getUserAccessibleBranchObjects(user, allBranches = []) {
  if (!user) return [];
  if (canUserAccessAllBranches(user)) {
    return allBranches;
  }
  const assignedIds = getUserAssignedBranchIds(user);
  return allBranches.filter((b) => assignedIds.includes(b.id));
}

/**
 * Validates whether the user is permitted to switch active branch focus to `targetBranchId`.
 * 
 * @param {object} user - The current authenticated user.
 * @param {string} targetBranchId - The requested branch ID or 'all'.
 * @param {Array} allBranches - List of all branches in the system.
 * @returns {boolean} True if authorized, false otherwise.
 */
export function canUserSelectBranch(user, targetBranchId, allBranches = []) {
  if (!user || !targetBranchId) return false;

  // 'all' clearance is restricted to central leadership
  if (targetBranchId === 'all') {
    return canUserAccessAllBranches(user);
  }

  // SuperAdmin and HQ Admin can select any registered branch
  if (canUserAccessAllBranches(user)) {
    if (allBranches.length === 0) return true;
    return allBranches.some((b) => b.id === targetBranchId);
  }

  // Standard multi-branch or single-branch users must be assigned to the requested branch
  const assignedIds = getUserAssignedBranchIds(user);
  return assignedIds.includes(targetBranchId);
}

/**
 * Evaluates a proposed branch switch, returning status and explanation.
 */
export function validateBranchSwitch(user, targetBranchId, allBranches = []) {
  if (!user) {
    return {
      allowed: false,
      reason: 'No authenticated user session found.',
      effectiveBranch: 'b-hdw',
    };
  }

  if (targetBranchId === 'all') {
    if (!canUserAccessAllBranches(user)) {
      const fallback = getUserPrimaryBranchId(user);
      return {
        allowed: false,
        reason: 'Consolidated All-Branches view is reserved for Central Leadership (SuperAdmin / HQ Admin).',
        effectiveBranch: fallback,
      };
    }
    return {
      allowed: true,
      reason: 'Consolidated institutional scope authorized.',
      effectiveBranch: 'all',
    };
  }

  const assigned = getUserAssignedBranchIds(user);
  const isSuperOrHq = canUserAccessAllBranches(user);

  if (!isSuperOrHq && !assigned.includes(targetBranchId)) {
    const branchName = allBranches.find((b) => b.id === targetBranchId)?.name || targetBranchId;
    const fallback = getUserPrimaryBranchId(user);
    return {
      allowed: false,
      reason: `Unauthorized campus focus: You are not assigned to ${branchName} Campus. Access denied to prevent cross-branch leakage.`,
      effectiveBranch: fallback,
    };
  }

  return {
    allowed: true,
    reason: 'Campus focus authorized.',
    effectiveBranch: targetBranchId,
  };
}

/**
 * Safely resolves an active branch ID for a user.
 * Guarantees that the returned branch is ALWAYS authorized.
 */
export function resolveInitialActiveBranch(user, candidateBranchId, allBranches = []) {
  if (!user) return 'b-hdw';

  if (candidateBranchId && canUserSelectBranch(user, candidateBranchId, allBranches)) {
    return candidateBranchId;
  }

  if (canUserAccessAllBranches(user)) {
    return 'all';
  }

  return getUserPrimaryBranchId(user);
}

export const canUserAccessBranch = canUserSelectBranch;
export const getUserAccessibleBranches = getUserAccessibleBranchObjects;


