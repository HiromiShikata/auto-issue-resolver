import { execSync } from 'child_process';

describe('commander program', () => {
  it('should success', () => {
    const output = execSync(
      'npx ts-node ./src/adapter/entry-points/cli/index.ts umino-bot HiromiShikata/auto-issue-resolver#18 -t 10',
    ).toString();

    expect(output.trim()).toEqual(JSON.stringify({}));
  });
  it('should show help', () => {
    const output = execSync(
      'npx ts-node ./src/adapter/entry-points/cli/index.ts -h',
    ).toString();

    expect(output.trim()).toEqual(
      `Usage: Auto Issue Resolver [options] <botUserName> <issueId>

Arguments:
  botUserName                 bot user name of github
  issueId                     owner/repo#issue_number

Options:
  -t, --try-count <tryCount>  try count
  -h, --help                  display help for command
`.trim(),
    );
  });
});
