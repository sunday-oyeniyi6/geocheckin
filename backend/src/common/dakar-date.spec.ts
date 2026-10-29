import { todayInDakar } from './dakar-date';

describe('todayInDakar', () => {
  it('returns the Dakar calendar day at UTC midnight', () => {
    expect(todayInDakar(new Date('2026-11-02T23:30:00Z')).toISOString()).toBe(
      '2026-11-02T00:00:00.000Z',
    );
  });
});
