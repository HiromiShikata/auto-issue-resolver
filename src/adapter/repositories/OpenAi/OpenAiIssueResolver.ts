import {
  IssueResolver,
  IssueResolverThought,
} from '../../../domain/usecases/adapter-interfaces/IssueResolver';
import { Issue } from '../../../domain/entities/Issue';
import fs from 'fs';
import { OpenAI } from 'openai';
import { Chat } from 'openai/resources';
import CreateChatCompletionRequestMessage = Chat.CreateChatCompletionRequestMessage;
import { OpenAiResponse } from './response-types/OpenAiResponse';

export class OpenAiIssueResolver implements IssueResolver {
  responseType: string;
  retryCountForInvalidResponseFormat = 3;
  constructor(private readonly openai: OpenAI) {
    this.responseType = fs
      .readFileSync(
        'src/adapter/repositories/OpenAi/response-types/OpenAiResponse.ts',
        'utf-8',
      )
      .replace('export type IssueResolverAIResponse =', '');
  }
  think = async (issue: Issue): Promise<IssueResolverThought> => {
    const messages: CreateChatCompletionRequestMessage[] = [
      {
        role: 'system',
        content: `You are well experienced AWS professional engineer.
You must provide command to investigate step by step.
You must answer this json format.
Don't output any strings other than json.

# output json format
${this.responseType}

`,
      },
      {
        role: 'user',
        content: issue.content,
      },
      ...issue.comments.map((comment): CreateChatCompletionRequestMessage => {
        return {
          role: 'user',
          content: comment.content,
        };
      }),
    ];
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
        console.log('Response:');
        console.log(result);
        const jsonObject: unknown = JSON.parse(
          this.extractJsonFromString(result),
        );
        if (this.isOpenAiResponse(jsonObject)) {
          return jsonObject;
        }
      } catch (e) {
        console.error(e);
      }
    }
    throw new Error(`Invalid response many times.`);
  };
  private extractJsonFromString = (input: string): string => {
    const jsonMatch = input.match(/{[\s\S]*}/);
    return jsonMatch ? jsonMatch[0] : input;
  };
  private isOpenAiResponse = (value: unknown): value is OpenAiResponse => {
    return (
      typeof value === 'object' &&
      value !== null &&
      'bashCommandToInvestigate' in value &&
      'analyzeCurrentSituationEn' in value &&
      'analyzeCurrentSituationJa' in value &&
      'thoughtEn' in value &&
      'thoughtJa' in value
    );
  };
}
