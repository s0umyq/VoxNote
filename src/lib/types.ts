export type ActionItem = {
  task: string; owner: string | null; dueDate: string | null;
  priority: "low" | "medium" | "high"; sourceQuote?: string;
};
export type Decision = { decision: string; context?: string; participants?: string[] };
export type Complaint = { issue: string; severity: "low" | "medium" | "high"; owner?: string | null };
export type MeetingInsight = {
  title: string; summary: string; keyPoints: string[];
  decisions: Decision[]; actionItems: ActionItem[];
  complaints: Complaint[]; risks: string[]; followUps: string[];
};
