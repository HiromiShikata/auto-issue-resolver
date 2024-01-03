import {
  IssueResolver,
  IssueResolverThought,
} from '../../../domain/usecases/adapter-interfaces/IssueResolver';
import { Issue } from '../../../domain/entities/Issue';
import fs from 'fs';
import { OpenAI } from 'openai';
import { Chat } from 'openai/resources';
import { User } from '../../../domain/entities/User';
import { Tool } from '../../../domain/entities/Tool';
import CreateChatCompletionRequestMessage = Chat.CreateChatCompletionRequestMessage;

type llmResponse = {
  thought: string;
  toolName: string;
  toolInput: string;
};
export class OpenAiIssueResolver implements IssueResolver {
  retryCountForInvalidResponseFormat = 3;
  logDir = './logs';
  constructor(private readonly openai: OpenAI) {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir);
    }
  }
  think = async (
    issue: Issue,
    botUserName: User['githubUserId'],
    tools: Tool[],
    toolResponse: string,
  ): Promise<IssueResolverThought> => {
    const logFileName = this.createLogFileName(issue);
    this.appendLogToFile('issue', issue, logFileName);

    const messages: CreateChatCompletionRequestMessage[] = [
      {
        role: 'system',
        content: `Assistant name is "${botUserName}". Assistant is a large language model trained by OpenAI.

Assistant is designed to be able to assist with a wide range of tasks, from answering simple questions to providing in-depth explanations and discussions on a wide range of topics. As a language model, Assistant is able to generate human-like text based on the input it receives, allowing it to engage in natural-sounding conversations and provide responses that are coherent and relevant to the topic at hand.

Assistant is constantly learning and improving, and its capabilities are constantly evolving. It is able to process and understand large amounts of text, and can use this knowledge to provide accurate and informative responses to a wide range of questions. Additionally, Assistant is able to generate its own text based on the input it receives, allowing it to engage in discussions and provide explanations and descriptions on a wide range of topics.

Overall, Assistant is a powerful system that can help with a wide range of tasks and provide valuable insights and information on a wide range of topics. Whether you need help with a specific question or just want to have a conversation about a particular topic, Assistant is here to assist.
As much as possible, assistant should do assistant's own research and minimize the time spent by the user.

IMPORTANT:
Before providing the final answer, assistant must double-check assistant's work and results.
If there is insufficient information, first attempt to use tools to get more information themselves.

If executing a task or query provides additional insights, use that new information to refine assistant's solution or response.
The assistant uses the tool to find out what you don't understand, so assistant don't ask the user as much as possible. Assistant can ask to user only if you do not understand the user's intentions even after conducting multiple investigating. When asking questions, assistant includes information about what kind of research was done in advance. Ask the user as little as possible.


`,
      },
      {
        role: 'user',
        content: `${this.templateToolResponse(toolResponse)}
        
${this.commentHistory(issue.comments)}

${this.suffix(issue, tools, this.formatInstructions)}
`,
      },
    ];

    this.appendLogToFile('request', messages, logFileName);
    let historyCount = issue.content.length
    for (let i = 0; i < this.retryCountForInvalidResponseFormat; i++) {
      try {
        const completion = await this.openai.chat.completions.create(
          {
            model: 'gpt-4',
            messages: messages,
            n: 1,
          },
          {
            timeout: 10 * 60 * 300,
          },
        );
        const result = completion.choices[0].message?.content ?? '';
        this.appendLogToFile('response', result, logFileName);
        console.log('Response:');
        console.log(result);
        const jsonObject: unknown =             JSON.parse(
          this.extractJsonFromString(result),
        );
        if (this.isLlmResponse(jsonObject)) {
          return jsonObject;
        }
      } catch (e) {
        console.error(e);
        if( !(e instanceof Error )) {
          continue
        }
        if (e.message.includes('Rate limit reached')) {
          console.log('Rate limit reached. Waiting for 1 minute...');
          await new Promise((resolve) => setTimeout(resolve, 60000));
        }else if(e.message.includes('Please reduce the length')){
          console.log('Please reduce the length. Waiting for 1 minute...');
          historyCount = Math.floor(historyCount * 0.6)
        }
      }
    }
    throw new Error(`Invalid response many times.`);
  };
  private extractJsonFromString = (input: string): string => {
    // const jsonMatchMd = input.match(/```json\n{[\s\S]*}\n```/);
    // if(jsonMatchMd){
    //   return jsonMatchMd[0]
    //
    // }

    const jsonMatch = input.match(/{[\s\S]*}/);
    return jsonMatch ? jsonMatch[0] : input;
  };
  private isLlmResponse = (value: unknown): value is llmResponse => {
    return (
      typeof value === 'object' &&
      value !== null &&
      'thought' in value &&
      'toolName' in value &&
      'toolInput' in value
    );
  };
  formatInstructions = `RESPONSE FORMAT INSTRUCTIONS
----------------------------

When responding to me, please output a response in one of two formats:

**Option 1:**
Use this if you want the human to use a tool.
Markdown code snippet formatted in the following schema:

\`\`\`json
{{{{
    "thought": string, \\ Your thought
    "toolName": string, \\ The action to take. Must be one of {tool_names}
    "toolInput": string \\ The input to the action
}}}}
\`\`\`

**Option #2:**
Use this if you want to respond directly to the human. Markdown code snippet formatted in the following schema:

\`\`\`json
{{{{
    "thought": string, \\ Your thought
    "toolName": "Final Answer",
    "toolInput": string \\ You should put what you want to return to use here
}}}}
\`\`\`"""
`;
  commentHistory = (comments: Issue['comments']) => `COMMENT HISTORY
--------------------
${comments
  .map(
    (comment): string => `
${comment.userName}: ${
      comment.informationForResolver
        ? comment.informationForResolver
        : comment.content
    }
`,
  )
  .join('\n------------------\n')}
`;

  suffix = (issue: Issue, tools: Tool[], formatInstructions: string) => `TOOLS
------
  Assistant can ask the user to use tools to look up information that may be helpful in answering the users original question. The tools the human can use are:

      ${tools
        .map(
          (tool) => `
[${tool.name}](${tool.description})
`,
        )
        .join('')}

${formatInstructions}

USER'S INPUT
--------------------
    Here is the user's input (remember to respond with a markdown code snippet of a json blob with a single action, and NOTHING else):
${issue.title}
${issue.content}
`;

  templateToolResponse = (toolResponse: string) => `TOOL RESPONSE:
---------------------
    ${toolResponse}

USER'S INPUT
--------------------
Okay, so what is the response to my last comment? If using information obtained from the tools you must mention it explicitly without mentioning the tool names - I have forgotten all TOOL RESPONSES! Remember to respond with a markdown code snippet of a json blob with a single action, and NOTHING else."""
`;
  appendLogToFile = (title: string, object: unknown, logFileName: string) => {
    fs.appendFileSync(
      `${this.logDir}/${logFileName}`,
      `== ${title} ===============================
${JSON.stringify(object, null, 2).replace(/\n/g, '\n\n')}
`,
    );
  };
  createLogFileName = (issue: Issue) => {
    return `${Date.now()}-${issue.id
      .replace(/#\//g, '-')
      .replace(/\//g, '-')}.${issue.title.replace(/ /g, '_')}.log`;
  };
}
