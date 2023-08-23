import { IssueRepository } from './adapter-interfaces/IssueRepository';
import { IssueResolver } from './adapter-interfaces/IssueResolver';
import { BashExecutor } from './adapter-interfaces/BashExecutor';
import { Issue } from '../entities/Issue';
import { bashResultIssueComment } from './templates/BashResultIssueCommentTemplate';
import { resolverThoughtIssueComment } from './templates/ResolverIssueComment';
import { User } from '../entities/User';

export class ResolveIssueUseCase {
  constructor(
    private readonly issueResolver: IssueResolver,
    private readonly issueRepository: IssueRepository,
    private readonly bashExecutor: BashExecutor,
  ) {}

  run = async (
    botUserName: User['name'],
    issueId: Issue['id'],
    tryCount: number,
  ) => {
    const issue = await this.issueRepository.getIssue(issueId);
    if (!issue) {
      throw new Error(`Issue not found. id: ${issueId}`);
    }
    for (let i = 0; i < tryCount; i++) {
      const response = await this.issueResolver.think(issue);
      const botComment = resolverThoughtIssueComment(response);
      await this.issueRepository.postComment(issueId, botComment);
      issue.comments.push({
        userName: botUserName,
        content: botComment,
      });
      if (!response.bashCommandToInvestigate) {
        await this.issueRepository.changeAssignee(issueId, [issue.creator]);
        return;
      }
      const bashResult = await this.bashExecutor.execute(
        response.bashCommandToInvestigate,
      );
      const commandResultComment = bashResultIssueComment(bashResult);
      await this.issueRepository.postComment(issueId, commandResultComment);
      issue.comments.push({
        userName: botUserName,
        content: commandResultComment,
      });
    }
  };
}
