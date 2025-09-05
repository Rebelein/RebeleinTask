import { z } from 'zod';

/**
 * @fileOverview Defines the Zod schemas and TypeScript types for AI flows.
 * This file does not contain server-side logic and can be safely imported into client components.
 */

export const SummarizeTaskUpdatesInputSchema = z.object({
  taskTitle: z.string().describe('The title of the task'),
  taskDescription: z.string().describe('The original description of the task'),
  activities: z.array(z.string()).describe('A list of activities that have happened on the task'),
});
export type SummarizeTaskUpdatesInput = z.infer<typeof SummarizeTaskUpdatesInputSchema>;
