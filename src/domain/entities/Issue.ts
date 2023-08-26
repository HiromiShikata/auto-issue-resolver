import { User } from './User';

export type Issue = {
  id: string; // owner/repo#issueNumber
  creator: User['githubUserId'];
  assignees: User['githubUserId'][];
  title: string;
  content: string;
  comments: {
    userName: string;
    content: string;
    informationForResolver: string | null;
  }[];
};
