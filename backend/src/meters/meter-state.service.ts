import { Injectable, BadRequestException } from '@nestjs/common';

// Maps Sprint C states to existing MeterStatus enum values
const STATE_MAP: Record<string, string> = {
  NEW: 'available',
  CONFIGURED: 'assigned',
  READY: 'active',
  ACTIVE: 'active',
  SUSPENDED: 'offline',
  TERMINATED: 'terminated',
  REMOVED: 'retired',
};

// Valid state transitions
const VALID_TRANSITIONS: Record<string, string[]> = {
  available: ['assigned'],           // NEW → CONFIGURED (assign unit+tariff+customer)
  assigned: ['active', 'terminated'], // CONFIGURED → READY/ACTIVE or TERMINATED
  active: ['offline', 'terminated'],  // ACTIVE → SUSPENDED or TERMINATED
  offline: ['active', 'terminated'],  // SUSPENDED → ACTIVE or TERMINATED
  terminated: ['retired'],            // TERMINATED → REMOVED
  retired: [],                         // REMOVED → end state
};

@Injectable()
export class MeterStateService {
  validateTransition(currentStatus: string, newStatus: string): { valid: boolean; reason?: string } {
    const current = currentStatus.toLowerCase();
    const next = newStatus.toLowerCase();

    if (current === next) return { valid: true };

    const allowed = VALID_TRANSITIONS[current];
    if (!allowed) return { valid: false, reason: `Unknown current status: ${currentStatus}` };
    if (!allowed.includes(next)) {
      return {
        valid: false,
        reason: `Cannot transition from ${currentStatus} to ${newStatus}. Allowed: ${allowed.map(s => Object.entries(STATE_MAP).find(([,v]) => v === s)?.[0] || s).join(' → ')}`,
      };
    }
    return { valid: true };
  }

  canActivate(meter: { status: string; projectId: string; installationDate?: Date | null; hasUnitAssignment?: boolean; hasCustomerAssignment?: boolean; hasTariff?: boolean }): { canActivate: boolean; reasons: string[] } {
    const reasons: string[] = [];
    if (!meter.installationDate) reasons.push('Missing installation date');
    if (!meter.hasUnitAssignment) reasons.push('Missing unit assignment');
    if (!meter.hasCustomerAssignment) reasons.push('Missing customer assignment');
    if (!meter.hasTariff) reasons.push('Missing tariff assignment');
    return { canActivate: reasons.length === 0, reasons };
  }
}
