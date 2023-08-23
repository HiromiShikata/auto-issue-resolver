import { BashResult } from '../adapter-interfaces/BashExecutor';

export const bashResultIssueComment = (
  bashResult: BashResult,
) => `## Bash Result
### stdout
\`\`\`
${
  bashResult.stdout.length > 300
    ? bashResult.stdout.slice(0, 300) + '...'
    : bashResult.stdout
}
\`\`\`
${
  bashResult.stdout.length > 300
    ? `
<details>
  <summary>See all</summary>
  <pre>
${bashResult.stdout}
  </pre>
</details>
`
    : ''
}

### stderr
\`\`\`
${
  bashResult.stderr && bashResult.stderr?.length > 300
    ? bashResult.stderr.slice(0, 300) + '...'
    : bashResult.stderr ?? ''
}
\`\`\`
${
  bashResult.stderr && bashResult.stderr?.length > 300
    ? `
<details>
  <summary>See all</summary>
  <pre>
${bashResult.stderr}
  </pre>
</details>
`
    : ''
}
`;
