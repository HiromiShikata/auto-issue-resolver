import { IssueResolverThought } from '../adapter-interfaces/IssueResolver';

export const resolverThoughtIssueComment = (thought: IssueResolverThought) =>
  `## Thought
${thought.analyzeCurrentSituationEn}

${thought.thoughtEn}

${thought.whyCantContinueWithBashCommandEn ?? ''}

### Japanese
${thought.analyzeCurrentSituationJa}

${thought.thoughtJa}

${thought.whyCantContinueWithBashCommandJa ?? ''}

${
  !thought.bashCommandToInvestigate
    ? ``
    : `## Command to investigate
${thought.bashCommandToInvestigate}
`
}
    `;
