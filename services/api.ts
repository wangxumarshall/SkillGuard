export interface ScanResponse {
    is_malicious: boolean;
    risk_level: string;
    threat_type: string;
    reasoning: string;
}

export const scanPrompt = async (prompt: string): Promise<ScanResponse> => {
    try {
        const response = await fetch('/api/scan/prompt', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt }),
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error scanning prompt:", error);
        throw error;
    }
};

export const scanSkillText = async (content: string, filename: string = "unknown.txt"): Promise<ScanResponse> => {
    try {
        const response = await fetch('/api/scan/skill-text', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content, filename }),
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error scanning skill text:", error);
        throw error;
    }
};

export const scanSkillFile = async (file: File): Promise<ScanResponse> => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/scan/skill-file', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error scanning skill file:", error);
        throw error;
    }
};
