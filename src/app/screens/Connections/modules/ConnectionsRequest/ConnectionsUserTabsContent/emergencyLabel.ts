import type { EmergencyAccessLabel } from '../../../../../../services/emergencyAccess';

/** i18n key for the state shown on a connection bubble ("Emergency Contact – {{state}}"). */
export const EMERGENCY_LABEL_KEYS: Record<EmergencyAccessLabel, string> = {
  not_requested: 'emergencyAccess.bubble.notRequested',
  requested: 'emergencyAccess.bubble.requested',
  pending: 'emergencyAccess.bubble.pending',
  granted: 'emergencyAccess.bubble.granted',
};
