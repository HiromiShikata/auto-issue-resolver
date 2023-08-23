import {
  BashExecutor,
  BashResult,
} from '../../domain/usecases/adapter-interfaces/BashExecutor';
import { execSync, ExecSyncOptions } from 'child_process';

type ExecError = {
  stdout?: Buffer;
  stderr?: Buffer;
};

export class ChildProcessBashExecutor implements BashExecutor {
  execute = async (command: string): Promise<BashResult> => {
    const options: ExecSyncOptions = {
      stdio: 'pipe',
      encoding: 'utf-8',
    };

    try {
      const stdout = execSync(command, options).toString();
      return {
        stdout: stdout,
        stderr: null,
      };
    } catch (error) {
      if (error instanceof Error) {
        const stdout = error.message;
        const stderr = error.stack || null;

        if (this.isExecError(error)) {
          return {
            stdout: error.stdout ? error.stdout.toString() : stdout,
            stderr: error.stderr ? error.stderr.toString() : stderr,
          };
        }

        return {
          stdout: stdout,
          stderr: stderr,
        };
      }

      return {
        stdout: 'Unknown error',
        stderr: null,
      };
    }
  };
  private isExecError = (error: unknown): error is ExecError => {
    return (
      error !== null &&
      typeof error === 'object' &&
      (('stdout' in error && error.stdout !== undefined) ||
        ('stderr' in error && error.stderr !== undefined))
    );
  };
}
