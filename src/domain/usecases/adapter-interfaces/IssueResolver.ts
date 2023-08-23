import { Issue } from '../../entities/Issue';
export type IssueResolverThought = {
  whyCantContinueWithBashCommandEn: string | null;
  whyCantContinueWithBashCommandJa: string | null;
  bashCommandToInvestigate: string | null;
  analyzeCurrentSituationEn: string;
  analyzeCurrentSituationJa: string;
  thoughtEn: string;
  thoughtJa: string;
};

export interface IssueResolver {
  think(issue: Issue): Promise<IssueResolverThought>;
}
