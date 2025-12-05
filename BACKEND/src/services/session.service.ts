import { randomBytes } from 'crypto';

export class SessionService {
  static generateSessionId(): string {
    return randomBytes(32).toString('hex');
  }

  static validateSessionId(sessionId: string): boolean {
    // Basic validation - you can add more complex logic if needed
    return typeof sessionId === 'string' && sessionId.length === 64;
  }
}