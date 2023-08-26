export interface DateRepository {
  now(): Date;
  afterMinutesFromNow(minutes: number): Date;
}
