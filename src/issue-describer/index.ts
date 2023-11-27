// https://chat.openai.com/c/42bb5a3c-86a3-4263-8549-a556f230966e
import { Octokit } from "@octokit/core";
import { promises as fs } from "fs";

interface User {
    login: string;
    url: string;
}

interface GitHubIssue {
    number: number;
    title: string;
    body: string;
    user: User;
    created_at: string;
    comments_url: string;
}

interface Comment {
    user: User;
    created_at: string;
    body: string;
}

const octokit = new Octokit({ auth: process.env.GH_TOKEN });

function extractIssueInfoFromUrl(url: string): { owner: string, repo: string, issue_number: number } {
    const regex = /github\.com\/(.*?)\/(.*?)\/issues\/(\d+)/;
    const match = url.match(regex);
    if (!match) throw new Error('Invalid GitHub issue URL');
    return { owner: match[1], repo: match[2], issue_number: parseInt(match[3]) };
}

async function fetchIssue(owner: string, repo: string, issue_number: number): Promise<GitHubIssue> {
    const response = await octokit.request('GET /repos/{owner}/{repo}/issues/{issue_number}', {
        owner,
        repo,
        issue_number
    });
    return response.data as GitHubIssue;
}

async function fetchComments(url: string): Promise<Comment[]> {
    const response = await octokit.request(url);
    return response.data as Comment[];
}

async function writeIssueToFile(issue: GitHubIssue, comments: Comment[]) {
    let content = `# Issue ${issue.number}: ${issue.title}

**Created by:** [${issue.user.login}](${issue.user.url}) **on** ${issue.created_at}
\`\`\`
${issue.body}
\`\`\`

## Comments
`;
    for (const comment of comments) {
        content += `
### Comment by [${comment.user.login}](${comment.user.url}) on ${comment.created_at}
\`\`\`
${comment.body}
\`\`\`
`;
    }
    await fs.writeFile(`./issues_${issue.number}.md`, content);
}

async function main(githubIssueUrl: string) {
    try {
        const { owner, repo, issue_number } = extractIssueInfoFromUrl(githubIssueUrl);
        const issue = await fetchIssue(owner, repo, issue_number);
        const comments = await fetchComments(issue.comments_url);
        await writeIssueToFile(issue, comments);
    } catch (error) {
        console.error(error);
    }
}

const githubIssueUrl = process.argv[2]; // issue url

main(githubIssueUrl);
