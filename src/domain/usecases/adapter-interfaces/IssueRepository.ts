import { Issue } from '../../entities/Issue';

export interface IssueRepository {
  getIssue(issueId: Issue['id']): Promise<Issue | null>;

  changeAssignee(
    issueId: Issue['id'],
    assignee: Issue['assignees'],
  ): Promise<void>;

  postComment(
    issueId: Issue['id'],
    comment: Issue['comments'][0]['content'],
  ): Promise<void>;
}
