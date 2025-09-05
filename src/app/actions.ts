'use server';

import { summarizeTaskUpdates } from '@/ai/flows/summarize-task-updates';
import type { SummarizeTaskUpdatesInput } from '@/ai/schemas';

export async function getSummary(input: SummarizeTaskUpdatesInput): Promise<string> {
    try {
        const summary = await summarizeTaskUpdates(input);
        return summary;
    } catch (error) {
        console.error('Error getting summary:', error);
        return 'Zusammenfassung konnte nicht erstellt werden.';
    }
}
