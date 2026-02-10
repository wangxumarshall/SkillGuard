export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export type VirusType =
  | 'PROMPT_VIRUS'    // Prompt Injection, Jailbreak, ASCII Smuggling
  | 'SKILL_VIRUS'     // Malicious Skills, ClawHub Poisoning, Remote Loaders
  | 'MCP_VIRUS'       // MCP Config Tampering, Data Poisoning
  | 'LLM_SYSTEM_VIRUS'// Training Data Poisoning, Model Backdoors
  | 'UNKNOWN';

export type ThreatLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'SAFE';

export interface ThreatSignature {
  id: string;
  name: string;
  type: VirusType;
  pattern: RegExp;
  description: string;
  remediationSuggestion: string;
}

export interface ScanFinding {
  type: VirusType;
  signatureId?: string; // If matched by signature
  severity: ThreatLevel;
  description: string;
  location?: { line: number, column: number };
  snippet?: string;
  remediation?: string;
}

// Deprecated ScanResult to keep compatibility if needed,
// but we should migrate to ScanReport fully.
// Mapping ScanResult to the new structure for backward compatibility if code still refers to it.
export interface ScanResult {
  id: string;
  filename: string;
  timestamp: Date;
  status: string; // 'Clean' | 'Infected' | 'Suspicious' | 'Unknown'
  threatLevel: number;
  details: string;
  vulnerabilities: string[];
  signatureMatches: any[];
}

export interface ScanReport {
  id: string;
  timestamp: Date;
  targetName: string; // Filename or "Prompt Input"
  targetType: 'FILE' | 'TEXT';
  overallStatus: 'INFECTED' | 'SUSPICIOUS' | 'CLEAN' | 'UNKNOWN'; // Normalized
  maxSeverity: ThreatLevel;
  findings: ScanFinding[];
  aiAnalysisSummary?: string;
}

export interface AppState {
  currentView: AppView;
  scanHistory: ScanReport[];
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  SCANNER = 'SCANNER', // Unified Scanner
  IMAGE_ANALYSIS = 'IMAGE_ANALYSIS',
  CHAT = 'CHAT',
  LOGS = 'LOGS'
}
