import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { SummarizeTaskUpdatesInputSchema } from '@/ai/schemas';

const summarizePrompt = ai.definePrompt({
    name: 'summarizeTaskUpdatesPrompt',
    input: { schema: SummarizeTaskUpdatesInputSchema },
    prompt: `
        You are a helpful assistant. Your purpose is to summarize the updates on a task.
        Based on the task title, description, and a list of recent activities, provide a concise summary.
        Do not repeat the title. Start directly with the summary.
        Use bullet points for the key updates.
        The summary should be in German.

        Task Title: {{{taskTitle}}}
        Task Description: {{{taskDescription}}}
        
        Recent Activities:
        {{#each activities}}
        - {{{this}}}
        {{/each}}
    `,
});


export const summarizeTaskUpdates = ai.defineFlow(
  {
    name: 'summarizeTaskUpdates',
    inputSchema: SummarizeTaskUpdatesInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    const llmResponse = await summarizePrompt(input);
    return llmResponse.text;
  }
);
