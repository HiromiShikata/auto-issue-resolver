import { IssueRepository } from './adapter-interfaces/IssueRepository';
import { User } from '../entities/User';
import { ResolveIssueUseCase } from './ResolveIssueUseCase';
import { DateRepository } from './adapter-interfaces/DateRepository';

export class MonitorIssueUseCase {
  maximumWaitingMinutes = 30;
  constructor(
    private readonly issueRepository: Pick<
      IssueRepository,
      'getIssue' | 'postComment' | 'changeAssignee' | 'getIssueIdsByAssignee'
    >,
    private readonly dateRepository: Pick<
      DateRepository,
      'now' | 'afterMinutesFromNow'
    >,
    private readonly resolveIssueUseCase: ResolveIssueUseCase,
  ) {}

  run = async (
    botUserName: User['name'],
    tryCount: number,
    monitorHours: number,
  ) => {
    const finishedAt = this.dateRepository.afterMinutesFromNow(
      monitorHours * 60,
    );
    let waitingSecond = 30;
    for (
      let now = this.dateRepository.now();
      now.getTime() < finishedAt.getTime();
      now = this.dateRepository.now()
    ) {
      const issueIds =
        await this.issueRepository.getIssueIdsByAssignee(botUserName);
      for (const issueId of issueIds) {
        if (issueId === 'HiromiShikata/umino-corporait-operation#6775') {
          continue;
        }
        await this.resolveIssueUseCase.run(botUserName, issueId, tryCount);
      }
      if (issueIds.length === 0) {
        console.log(`waiting ${waitingSecond} seconds...`);
        await new Promise((resolve) =>
          setTimeout(resolve, waitingSecond * 1000),
        );
        waitingSecond = waitingSecond * 2;
        if (waitingSecond > this.maximumWaitingMinutes * 60) {
          waitingSecond = this.maximumWaitingMinutes * 60;
        }
      } else {
        waitingSecond = 30;
      }
      await new Promise((resolve) => setTimeout(resolve, waitingSecond * 1000));
    }
  };
}
