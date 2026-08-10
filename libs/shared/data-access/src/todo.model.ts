/** Shared todo types for React / Vue MFEs (Promise-based repositories). */

export interface Todo {
  id: string;
  userId: string;
  task: string;
  completed: boolean;
  createdAt?: string;
  /** Present when API / seed includes tags (used by analytics chart). */
  tags?: string[];
}

/** Payload to create a todo — repository assigns id / defaults. */
export interface CreateTodoDto {
  task: string;
  userId: string;
}
