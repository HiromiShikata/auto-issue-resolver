import { config } from 'dotenv';

config();

describe('OctokitIssueRepository', () => {
  // let repository: OctokitIssueRepository;
  // const GITHUB_TOKEN = process.env.GH_TOKEN;
  //
  // beforeAll(() => {
  //   const octokit = new Octokit({
  //     auth: GITHUB_TOKEN,
  //   });
  //   repository = new OctokitIssueRepository(octokit);
  // });

  it('should fetch issues assigned to a specific user', async () => {
    // const issues = await repository.getIssueIdsByAssignee('bot-test-hiromishikata');
    // expect(issues).toBeInstanceOf(Array);
  });
});
