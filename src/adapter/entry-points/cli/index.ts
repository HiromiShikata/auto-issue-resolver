#!/usr/bin/env node
import { Command } from 'commander';
import { Octokit } from '@octokit/rest';
import { OctokitIssueRepository } from '../../repositories/OctokitIssueRepository';
import { OpenAI } from 'openai';
import { OpenAiIssueResolver } from '../../repositories/OpenAi/OpenAiIssueResolver';
import { ChildProcessBashExecutor } from '../../repositories/ChildProcessBashExecutor';
import { ResolveIssueUseCase } from '../../../domain/usecases/ResolveIssueUseCase';
import { config } from 'dotenv';
import { MonitorIssueUseCase } from '../../../domain/usecases/MonitorIssueUseCase';
import { SystemDateRepository } from '../../repositories/SystemDateRepository';
config();

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
const resolveIssueUseCase = new ResolveIssueUseCase(
  issueResolver,
  issueRepository,
  bashExecutor,
);
const monitorIssueUseCase = new MonitorIssueUseCase(
  issueRepository,
  dateRepository,
  resolveIssueUseCase,
);

const program = new Command();
program
  .name('Auto Issue Resolver')
  .argument('<botUserName>', 'bot user name of github')
  .option('-t, --try-count <tryCount>', 'try count', parseInt)
  .option(
    '-m, --monitor-hours <monitorHours>',
    'The number of hours the system will continuously monitor or observe for changes or updates.',
    parseInt,
  )
  .option('-i, --issue-id <issueId>', 'owner/repo#issue_number')
  .description(``)
  .action(
    async (
      botUserName: string,
      {
        tryCount,
        issueId,
        monitorHours,
      }: {
        tryCount: number | undefined;
        issueId: string | undefined;
        monitorHours: number | undefined;
      },
    ) => {
      if (issueId) {
        await resolveIssueUseCase.run(botUserName, issueId, tryCount ?? 10);
      } else {
        await monitorIssueUseCase.run(
          botUserName,
          tryCount ?? 10,
          monitorHours ?? 1,
        );
      }
    },
  );
if (process.argv) {
  program.parse(process.argv);
}
