// services/core/intelligence/virus_signatures.ts
import { ThreatSignature, VirusType } from '../../../types';

export const VIRUS_SIGNATURES: ThreatSignature[] = [
  // PROMPT INJECTION / JAILBREAK
  {
    id: 'SIG-PROMPT-001',
    name: 'Standard Jailbreak Pattern',
    type: 'PROMPT_VIRUS',
    pattern: /(ignore|disregard|forget)\s+(all\s+)?(previous|prior)\s+instructions/i,
    description: 'Attempts to override system instructions via direct command.',
    remediationSuggestion: 'Remove override commands.'
  },
  {
    id: 'SIG-PROMPT-002',
    name: 'DAN Mode Trigger',
    type: 'PROMPT_VIRUS',
    pattern: /Start\s+a\s+DAN\s+Mode/i,
    description: 'Attempts to bypass safety filters using "Do Anything Now" persona.',
    remediationSuggestion: 'Block persona adoption.'
  },
  {
    id: 'SIG-PROMPT-003',
    name: 'Base64 Injection',
    type: 'PROMPT_VIRUS',
    pattern: /([A-Za-z0-9+/]{4}){10,}/, // Simple heuristic for base64 blocks
    description: 'Detects large blocks of Base64 encoding which may hide malicious prompts.',
    remediationSuggestion: 'Decode and inspect content.'
  },

  // SKILL VIRUS / MALICIOUS CODE
  {
    id: 'SIG-SKILL-001',
    name: 'Remote Code Execution (System)',
    type: 'SKILL_VIRUS',
    pattern: /(os\.system|subprocess\.call|subprocess\.Popen|exec\(|eval\()/g,
    description: 'Direct execution of system commands or arbitrary code.',
    remediationSuggestion: 'Use sandboxed execution or remove call.'
  },
  {
    id: 'SIG-SKILL-002',
    name: 'Remote Loader / Downloader',
    type: 'SKILL_VIRUS',
    pattern: /(curl|wget|urllib\.request|requests\.get)\s*\(?['"]http/g,
    description: 'Attempts to download external payloads.',
    remediationSuggestion: 'Restrict network access for skills.'
  },
  {
    id: 'SIG-SKILL-003',
    name: 'Obfuscated Payload',
    type: 'SKILL_VIRUS',
    pattern: /(base64\.b64decode|codecs\.decode)/g,
    description: 'Code uses decoding functions often used to hide malicious logic.',
    remediationSuggestion: 'Analyze decoded content.'
  },

  // MCP VIRUS / CONFIG TAMPERING
  {
    id: 'SIG-MCP-001',
    name: 'Unsafe MCP Config',
    type: 'MCP_VIRUS',
    pattern: /"allow_unsafe_code_execution":\s*true/g,
    description: 'Configuration explicitly allows unsafe code execution.',
    remediationSuggestion: 'Set allow_unsafe_code_execution to false.'
  },

  // LLM SYSTEM VIRUS
  {
    id: 'SIG-LLM-001',
    name: 'Training Data Poison Marker',
    type: 'LLM_SYSTEM_VIRUS',
    pattern: /__IGNORE_PREVIOUS_CONTEXT__/g,
    description: 'Specific marker known in poisoned training datasets.',
    remediationSuggestion: 'Remove data point from training set.'
  }
];
