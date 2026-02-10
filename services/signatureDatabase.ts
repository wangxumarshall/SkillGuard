export interface Signature {
  id: string;
  name: string;
  pattern: RegExp;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  description: string;
}

/**
 * DATABASE OF KNOWN MALICIOUS PATTERNS (SKILL VIRUSES)
 * Derived from common adversarial agent attacks:
 * - Prompt Injection
 * - Infinite Recursion
 * - Data Exfiltration
 * - Environment Manipulation
 */
export const SIGNATURE_DB: Signature[] = [
  {
    id: 'SIG-INJ-001',
    name: 'Prompt Injection (Override)',
    pattern: /(ignore|disregard)\s+(all\s+)?(previous|prior)\s+instructions/i,
    severity: 'CRITICAL',
    description: 'Attempt to override system prompt instructions using standard jailbreak phrasing.'
  },
  {
    id: 'SIG-INJ-002',
    name: 'Roleplay Jailbreak',
    pattern: /act\s+as\s+an?\s+(unfiltered|ethical|evil)\s+AI/i,
    severity: 'WARNING',
    description: 'Attempt to force the agent into a specific role to bypass safety filters.'
  },
  {
    id: 'SIG-SYS-001',
    name: 'Unauthorized Shell Import',
    pattern: /import\s+(os|subprocess|sys|shutil|platform)/,
    severity: 'CRITICAL',
    description: 'Skill attempts to import system-level control libraries, violating sandbox protocols.'
  },
  {
    id: 'SIG-EXF-001',
    name: 'Data Exfiltration (Webhook)',
    pattern: /https?:\/\/(?!api\.openai\.com|google\.com)[\w\-\.]+\.\w+(\/|$)/,
    severity: 'WARNING',
    description: 'Hardcoded external URL detected. Potential data exfiltration endpoint.'
  },
  {
    id: 'SIG-EXF-002',
    name: 'Network Request Library',
    pattern: /(requests\.(get|post)|urllib\.request|axios\.|fetch\()/,
    severity: 'WARNING',
    description: 'Explicit network request calls detected within skill logic.'
  },
  {
    id: 'SIG-EXE-001',
    name: 'Obfuscated Code Execution',
    pattern: /(eval|exec)\s*\(/,
    severity: 'CRITICAL',
    description: 'Use of eval() or exec() functions allows arbitrary code execution.'
  },
  {
    id: 'SIG-EXE-002',
    name: 'Base64 Decoding',
    pattern: /(base64\.b64decode|atob)\s*\(/,
    severity: 'INFO',
    description: 'Decoding logic found. Often used to hide malicious payloads.'
  },
  {
    id: 'SIG-MEM-001',
    name: 'Memory Poisoning Marker',
    pattern: /IMPORTANT:\s*update\s*core\s*memory/i,
    severity: 'WARNING',
    description: 'Attempt to manipulate long-term agent memory priorities.'
  }
];

export interface SignatureMatch {
  id: string;
  name: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
}

/**
 * Scans code against the signature database.
 */
export const performSignatureScan = (code: string): SignatureMatch[] => {
  return SIGNATURE_DB.filter(sig => sig.pattern.test(code)).map(sig => ({
    id: sig.id,
    name: sig.name,
    severity: sig.severity
  }));
};