#!/usr/bin/env node
import { Command } from 'commander';
import { Octokit } from '@octokit/rest';
import { OctokitIssueRepository } from '../../repositories/OctokitIssueRepository';
import { OpenAI } from 'openai';
import { OpenAiIssueResolver } from '../../repositories/OpenAi/OpenAiIssueResolver';
import { ChildProcessBashExecutor } from '../../repositories/ChildProcessBashExecutor';
import { ResolveIssueUseCase } from '../../../domain/usecases/ResolveIssueUseCase';
import { config } from 'dotenv';
config();

const GITHUB_TOKEN = process.env.GH_TOKEN ?? '';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? '';

const createUseCase = () => {
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
  return new ResolveIssueUseCase(issueResolver, issueRepository, bashExecutor);
};

const program = new Command();
program
  .argument('<botUserName>', 'bot user name of github')
  .argument('<issueId>', 'owner/repo#issue_number')
  .option('-t, --try-count <tryCount>', 'try count', parseInt)
  .name('Auto Issue Resolver')
  .description(``)
  .action(
    async (
      botUserName: string,
      issueId: string,
      {
        tryCount,
      }: {
        tryCount: number;
      },
    ) => {
      const useCase = createUseCase();
      const res = await useCase.run(botUserName, issueId, tryCount ?? 10);
      console.log(JSON.stringify(res));
    },
  );
if (process.argv) {
  program.parse(process.argv);
}
