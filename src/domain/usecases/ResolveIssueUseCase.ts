import { IssueRepository } from './adapter-interfaces/IssueRepository';
import { IssueResolver } from './adapter-interfaces/IssueResolver';
import { BashExecutor } from './adapter-interfaces/BashExecutor';
import { Issue } from '../entities/Issue';
import { resolverThoughtIssueComment } from './templates/ResolverIssueComment';
import { User } from '../entities/User';
import { extructInformationForResolverFromCommentArea } from './templates/InformationForResolverTemplate';
import { Tool } from '../entities/Tool';

export class ResolveIssueUseCase {
  constructor(
    private readonly issueResolver: Pick<IssueResolver, 'think'>,
    private readonly issueRepository: Pick<
      IssueRepository,
      'getIssue' | 'postComment' | 'changeAssignee'
    >,
    private readonly bashExecutor: Pick<BashExecutor, 'execute'>,
  ) {}

  run = async (
    botUserName: User['name'],
    issueId: Issue['id'],
    tryCount: number,
  ) => {
    const issueWithoutInformationForResolver =
      await this.issueRepository.getIssue(issueId);
    if (!issueWithoutInformationForResolver) {
      throw new Error(`Issue not found. id: ${issueId}`);
    }
    const issue: Issue = {
      ...issueWithoutInformationForResolver,
      comments: issueWithoutInformationForResolver.comments.map(
        (comment): Issue['comments'][0] => ({
          ...comment,
          informationForResolver: extructInformationForResolverFromCommentArea(
            comment.content,
          ),
        }),
      ),
    };
    const tools = this.createTools();

    let toolResponse = '';
    for (let i = 0; i < tryCount; i++) {
      const response = await this.issueResolver.think(
        issue,
        botUserName,
        tools,
        toolResponse,
      );
      const botComment = resolverThoughtIssueComment(response);
      await this.issueRepository.postComment(issueId, botComment);
      issue.comments.push({
        userName: botUserName,
        content: botComment,
        informationForResolver: JSON.stringify(response),
      });
      if (response.toolName === 'Final Answer') {
        await this.issueRepository.changeAssignee(issueId, [issue.creator]);
        return;
      }
      const tool = tools.find((tool) => tool.name === response.toolName);
      if (!tool) {
        throw new Error(`Tool not found. name: ${response.toolName}`);
      }
      toolResponse = await tool.executor(response.toolInput);

      await this.issueRepository.postComment(issueId, toolResponse);
      issue.comments.push({
        userName: botUserName,
        content: toolResponse,
        informationForResolver: `\`\`\`json
${JSON.stringify(toolResponse)}
\`\`\``,
      });
    }
  };
  createTools = (): Tool[] => {
    return [
      {
        name: 'Bash Executor',
        description: `This tool executes bash command and returns the result.
You can use bash command like tree, cat, ls, head, tail, awk, etc.
When executing bash commands, please ensure that the output does not exceed 4000 characters. Always filter the output using tools like head, tail, grep, awk, etc. If the output exceeds this limit, it will result in an error.
`,
        executor: async (arg: string): Promise<string> => {
          const res = await this.bashExecutor.execute(arg);
          const result = JSON.stringify(res);
          if (result.length > 4000) {
            return `Error: Too many character length error occurred! Please try again with filter query like awk, grep,..etc. length: ${
              result.length
            }. first 300 characters:${result.slice(0, 300)}`;
          }
          return result;
        },
      },
    ];
  };
}
