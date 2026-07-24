export interface ConsumptionConfigDto {
  id: number;
  creditsPerHour: number;
  checkIntervalMinutes: number;
  maxSessionMinutes: number;
  isEnabled: boolean;
  gracePeriodMinutes: number;
  initialFreeHours: number;
  enforceAccessBlock: boolean;
  updatedAt: string;
}

export interface UpdateConsumptionConfigDto {
  creditsPerHour: number;
  checkIntervalMinutes: number;
  maxSessionMinutes: number;
  isEnabled: boolean;
  gracePeriodMinutes: number;
  initialFreeHours: number;
  enforceAccessBlock: boolean;
}

export interface UserSessionDto {
  id: number;
  userId: string;
  sessionStartUtc: string;
  sessionEndUtc?: string;
  minutesConsumed: number;
  creditsConsumed: number;
  isActive: boolean;
  lastHeartbeatUtc?: string;
  deviceInfo?: string;
  elapsedMinutes: number;
  estimatedCreditsConsumed: number;
  timeRemainingDisplay?: string;
}

export interface StartSessionDto {
  deviceInfo?: string;
}

export interface SessionHeartbeatResponseDto {
  success: boolean;
  isConsuming: boolean;
  isBlocked: boolean;
  creditsConsumed: number;
  minutesElapsed: number;
  remainingCreditBalance?: number;
  message?: string;
}

export interface ConsumptionStatsDto {
  activeSessionsCount: number;
  totalSessionsToday: number;
  totalSessionsThisMonth: number;
  totalCreditsConsumedToday: number;
  totalCreditsConsumedThisMonth: number;
  totalMinutesLoggedToday: number;
  totalMinutesLoggedThisMonth: number;
  rate: number;
  isEnabled: boolean;
}