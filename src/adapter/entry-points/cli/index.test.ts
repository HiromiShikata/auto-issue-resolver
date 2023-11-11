import { execSync } from 'child_process';
import {Octokit} from "@octokit/rest";
import {OctokitIssueRepository} from "../../repositories/OctokitIssueRepository";
import {OpenAI} from "openai";
import {OpenAiIssueResolver} from "../../repositories/OpenAi/OpenAiIssueResolver";
import {ChildProcessBashExecutor} from "../../repositories/ChildProcessBashExecutor";
import {SystemDateRepository} from "../../repositories/SystemDateRepository";
import {AxiosWebRepository} from "../../repositories/AxoisWebRepository/AxiosWebRepository";
import {LocalStorageRepository} from "../../repositories/LocalStorageRepository";
import {WeaviateStorageRepository} from "../../repositories/WeaviateStorageRepository";

describe('commander program', () => {
  // describe('monitor', () => {
  it('should success', () => {
    const output = execSync(
      'npx ts-node ./src/adapter/entry-points/cli/index.ts umino-bot -t 10 -m 1',
    ).toString();

    expect(output.trim()).toEqual(JSON.stringify({}));
  });
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

describe('test',()=>{
  it('should success',()=>{

    const GITHUB_TOKEN = process.env.GH_TOKEN ?? '';
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? '';
    const octokit = new Octokit({
      auth: GITHUB_TOKEN,
      userAgent: 'OpenAI GitHub bot',
    });
    const issueRepository = new OctokitIssueRepository(octokit);
    const openai: OpenAI = new OpenAI({
      apiKey: OPENAI_API_KEY,
    });
    const issueResolver = new OpenAiIssueResolver(openai);
    const bashExecutor = new ChildProcessBashExecutor();
    const dateRepository = new SystemDateRepository();
    const weaviateStorageRepository = new WeaviateStorageRepository();
    const webRepository = new AxiosWebRepository()
    const localStorageRepository = new LocalStorageRepository()
    const resWeb = webRepository.search('美容医療　再生医療')

// await    weaviateStorageRepository.save()

  })
})
