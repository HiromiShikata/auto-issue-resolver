export type BashResult = {
  stdout: string;
  stderr: string | null;
};
export interface BashExecutor {
  execute(command: string): Promise<BashResult>;
}
