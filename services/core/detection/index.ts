// services/core/detection/index.ts
import { performStaticScan, performHeuristicScan } from './scanner';
import { ScanReport } from '../../../types';

export const scanContent = async (content: string, filename: string = "Input"): Promise<ScanReport> => {
    // 1. Static Scan
    const staticFindings = performStaticScan(content, filename === 'Input' ? 'TEXT' : 'FILE');

    // 2. AI Scan (Heuristic)
    const report = await performHeuristicScan(content, staticFindings, filename);

    return report;
};
