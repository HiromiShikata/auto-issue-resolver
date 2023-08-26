import { Issue } from '../../entities/Issue';
import { User } from '../../entities/User';
import { Tool } from '../../entities/Tool';
export type IssueResolverThought = {
  thought: string;
  toolName: string;
  toolInput: string;
};
export type Task = string;
export type CreateTaskResult = {
  analyze: string;
  taskList: Task[];
};
export type ReasoningResult = {
  thought: string;
  toolName: Tool['name'];
  input: string;
};

export interface IssueResolver {
  think(
    issue: Issue,
    botUserName: User['githubUserId'],
    tools: Tool[],
    toolResponse: string,
  ): Promise<IssueResolverThought>;
}
