import {
  createInformationForResolverArea,
  extructInformationForResolverFromCommentArea,
} from './InformationForResolverTemplate';

describe('InformationForResolverTemplate', () => {
  test('createInformationForResolver', () => {
    const informationForResolver = 'informationForResolver';
    const expected = `<details>
  <summary>Information for resolver</summary>
  <pre>
\`\`\`
${informationForResolver}
\`\`\`
  </pre>
</details>
`;
    expect(createInformationForResolverArea(informationForResolver)).toBe(
      expected,
    );
  });
  describe('extructInformationForResolverFromCommentArea', () => {
    test('success', () => {
      const commentBody = `<details>
  <summary>Information for resolver</summary>
  <pre>
\`\`\`
informationForResolver
\`\`\`
  </pre>
</details>
`;
      const expected = 'informationForResolver';
      expect(extructInformationForResolverFromCommentArea(commentBody)).toBe(
        expected,
      );
    });
  });
  describe(`create and extruct`, () => {
    const testCases = [
      {
        informationForResolver: 'informationForResolver',
      },
      {
        informationForResolver: ``,
      },
      {
        informationForResolver: `informationForResolver
informationForResolver
informationForResolver
`,
      },
    ];
    test.each(testCases)(`%p`, (testCase) => {
      const commentBody = createInformationForResolverArea(
        testCase.informationForResolver,
      );
      expect(extructInformationForResolverFromCommentArea(commentBody)).toBe(
        testCase.informationForResolver,
      );
    });
  });
});

// test target
// export const createInformationForResolverArea = (
//     informationForResolver: string
// ) => `<details>
//   <summary>Information for resolver</summary>
//   <pre>
// \`\`\`
// ${informationForResolver}
// \`\`\`
//   </pre>
// </details>
// `;
//
// export const extructInformationForResolverFromCommentArea = (
//     commentBody: string
// ) :null|string=> {
//     const informationForResolverArea = commentBody.match(
//         /<details>\n *<summary>Information for resolver<\/summary>\n *<pre>\n```([^`]+)\n```\n *<\/pre>\n<\/details>\n/
//     );
//     if (!informationForResolverArea) {
//         return null;
//     }
//     return informationForResolverArea[1];
// }
