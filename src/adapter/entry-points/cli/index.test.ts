import { execSync } from 'child_process';

describe('commander program', () => {
  // describe('monitor', () => {
  //   it('should success', () => {
  //     const output = execSync(
  //       'npx ts-node ./src/adapter/entry-points/cli/index.ts bot-test-hiromishikata -t 10 -m 1',
  //     ).toString();
  //
  //     expect(output.trim()).toEqual(JSON.stringify({}));
  //   });
  // });
  // describe('resolve', () => {
  //   it('should success', () => {
  //     const output = execSync(
  //       'npx ts-node ./src/adapter/entry-points/cli/index.ts bot-test-hiromishikata -i HiromiShikata/auto-issue-resolver#18 -t 10',
  //     ).toString();
  //
  //     expect(output.trim()).toEqual(JSON.stringify({}));
  //   });
  // });
  describe('help', () => {
    it('should show help', () => {
      const output = execSync(
        'npx ts-node ./src/adapter/entry-points/cli/index.ts -h',
      ).toString();

      expect(output.trim())
        .toEqual(`Usage: Auto Issue Resolver [options] <botUserName>

Arguments:
  botUserName                         bot user name of github

Options:
  -t, --try-count <tryCount>          try count
  -m, --monitor-hours <monitorHours>  The number of hours the system will
                                      continuously monitor or observe for
                                      changes or updates.
  -i, --issue-id <issueId>            owner/repo#issue_number
  -h, --help                          display help for command`);
    });
  });
});
