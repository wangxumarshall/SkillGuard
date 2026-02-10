import { ScanFinding, VirusType } from '../../../types';

/**
 * Sanitizes content by removing or neutralizing detected threats.
 */
export const remediateContent = (content: string, findings: ScanFinding[]): string => {
  let processedContent = content;

  // Sort findings by location (reverse) to avoid index shifting when modifying strings
  // Note: Since we don't have exact character indices in ScanFinding (only line/col),
  // we will perform line-based remediation or simple string replacement.

  // Strategy: Replace matches with [REMOVED: Reason]

  for (const finding of findings) {
    if (!finding.snippet) continue;

    const replacement = `[REMOVED_THREAT: ${finding.type}]`;

    // Use a global replacement for the snippet if found
    // We escape special regex characters in the snippet to ensure safe replacement
    const escapedSnippet = finding.snippet.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedSnippet, 'g');

    processedContent = processedContent.replace(regex, replacement);
  }

  return processedContent;
};
