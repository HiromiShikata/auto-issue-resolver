import { DateRepository } from '../../domain/usecases/adapter-interfaces/DateRepository';

export class SystemDateRepository implements DateRepository {
  now = (): Date => {
    return new Date();
  };

  afterMinutesFromNow = (minutes: number): Date => {
    const now = this.now();
    return new Date(now.getTime() + minutes * 60 * 1000);
  };
}
