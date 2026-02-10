export enum SecurityStatus {
  SECURE = 'SECURE',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
  SCANNING = 'SCANNING'
}

export interface ScanResult {
  id: string;
  filename: string;
  status: 'Clean' | 'Infected' | 'Suspicious';
  threatLevel: number; // 0-100
  details: string;
  timestamp: Date;
  vulnerabilities: string[];
  signatureMatches?: { id: string; name: string; severity: string }[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  SCANNER = 'SCANNER',
  IMAGE_ANALYSIS = 'IMAGE_ANALYSIS',
  CHAT = 'CHAT',
  LOGS = 'LOGS'
}