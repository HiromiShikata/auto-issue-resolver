import { IssueRepository } from '../../domain/usecases/adapter-interfaces/IssueRepository';
import { Issue } from '../../domain/entities/Issue';
import { Octokit } from '@octokit/rest';

export class OctokitIssueRepository implements IssueRepository {
  constructor(private readonly octokit: Octokit) {}

  getIssue = async (issueId: Issue['id']): Promise<Issue | null> => {
    const issue = await this.octokit.issues.get(this.extractIssueId(issueId));

    const commentsResponse = await this.octokit.issues.listComments(
      this.extractIssueId(issueId),
    );
    const comments = commentsResponse.data.map((comment) => comment.body);

    const issueContent = [issue.data.body, ...comments].join('\n');
    return {
      id: issueId,
      creator: issue.data.user?.login ?? '',
      assignees: issue.data.assignees?.map((assignee) => assignee.login) ?? [],
      title: issue.data.title,
      content: issueContent,
      comments: commentsResponse.data.map((comment) => {
        return {
          userName: comment.user?.login ?? '',
          content: comment.body ?? '',
        };
      }),
    };
  };

  changeAssignee = async (
    issueId: Issue['id'],
    assignees: Issue['assignees'],
  ) => {
    await this.octokit.issues.update({
      ...this.extractIssueId(issueId),
      assignees,
    });
  };

  postComment = async (
    issueId: Issue['id'],
    comment: Issue['comments'][0]['content'],
  ): Promise<void> => {
    await this.octokit.issues.createComment({
      ...this.extractIssueId(issueId),
      body: comment,
    });
  };

  extractIssueId = (
    issueId: Issue['id'],
  ): {
    owner: string;
    repo: string;
    issue_number: number;
  } => {
    // issueId: owner/repo#issueNumber

    const [ownerRepo, issueNumber] = issueId.split('#');
    const [owner, repo] = ownerRepo.split('/');
    return {
      owner,
      repo,
      issue_number: Number(issueNumber),
    };
  };
}
