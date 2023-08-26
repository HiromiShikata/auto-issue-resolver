export const createInformationForResolverArea = (
  informationForResolver: string,
) => `<details>
  <summary>Information for resolver</summary>
  <pre>
\`\`\`
${informationForResolver}
\`\`\`
  </pre>
</details>
`;

export const extructInformationForResolverFromCommentArea = (
  commentBody: string,
): null | string => {
  const informationForResolverArea = commentBody.match(
    /<details>\n *<summary>Information for resolver<\/summary>\n *<pre>\n```\n([^`]*)\n```\n *<\/pre>\n<\/details>\n/,
  );
  if (!informationForResolverArea) {
    return null;
  }
  return informationForResolverArea[1];
};
