import { IssueResolverThought } from '../adapter-interfaces/IssueResolver';

export const resolverThoughtIssueComment = (thought: IssueResolverThought) =>
  `<details>
  <summary>Thought</summary>
  <pre>
${thought.thought}
  </pre>
</details>

${
  thought.toolName === 'Final Answer'
    ? thought.toolInput
    : `
${thought.toolName}

\`\`\`
${thought.toolInput}
\`\`\`

`
}
`;

// `## Thought
// ${thought.analyzeCurrentSituationEn}
//
// ${thought.thoughtEn}
//
// ${thought.whyCantContinueWithBashCommandEn ?? ''}
//
// ### Japanese
// ${thought.analyzeCurrentSituationJa}
//
// ${thought.thoughtJa}
//
// ${thought.whyCantContinueWithBashCommandJa ?? ''}
//
// ${
//     !thought.bashCommandToInvestigate
//         ? ``
//         : `## Command to investigate
// ${thought.bashCommandToInvestigate}
// `
// }
//     `;
