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

interface Repository {
    name: string;
}

const octokit = new Octokit({ auth: process.env.GH_TOKEN });

async function fetchRepositories(owner: string): Promise<Repository[]> {
    const response = await octokit.request('GET /users/{owner}/repos', { owner });
    return response.data as Repository[];
}

async function fetchIssues(owner: string, repo: string): Promise<GitHubIssue[]> {
    const response = await octokit.request('GET /repos/{owner}/{repo}/issues', {
        owner,
        repo
    });
    return response.data as GitHubIssue[];
}

async function writeIssuesToFile(owner: string, repo: string, issues: GitHubIssue[]) {
    let content = `# Repository: ${repo}\n\n`;
    for (const issue of issues) {
        content += `## Issue ${issue.number}: ${issue.title}\n
**Created by:** [${issue.user.login}](${issue.user.url}) **on** ${issue.created_at}\n
\`\`\`
${issue.body}
\`\`\`\n\n`;
    }
    await fs.writeFile(`./${owner}_${repo}_issues.md`, content);
}

async function main(owner: string) {
    try {
        const repositories = await fetchRepositories(owner);
        console.log(repositories)
        for (const repo of repositories) {
            const issues = await fetchIssues(owner, repo.name);
            await writeIssuesToFile(owner, repo.name, issues);
        }
    } catch (error) {
        console.error(error);
    }
}

main('HiromiShikata');
