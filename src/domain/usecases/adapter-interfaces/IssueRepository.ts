import { Issue } from '../../entities/Issue';
import { User } from '../../entities/User';

export type IssueWithoutInformationForResolver = Omit<Issue, 'comments'> & {
  comments: Omit<Issue['comments'][0], 'informationForResolver'>[];
};
export interface IssueRepository {
  getIssue(
    issueId: Issue['id'],
  ): Promise<IssueWithoutInformationForResolver | null>;
  getIssueIdsByAssignee(assignee: User['githubUserId']): Promise<Issue['id'][]>;
  changeAssignee(
    issueId: Issue['id'],
    assignee: Issue['assignees'],
  ): Promise<void>;

  postComment(
    issueId: Issue['id'],
    comment: Issue['comments'][0]['content'],
  ): Promise<void>;
}
