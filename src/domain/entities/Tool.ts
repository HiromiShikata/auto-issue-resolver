export type Tool = {
  name: string;
  description: string;
  executor: (arg: string) => Promise<string>;
};
