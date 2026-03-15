// isSpaceKey.test.ts
import isSpaceKey from '../isSpaceKey';

describe('isSpaceKey', () => {
  test('returns true if the space key is pressed (Space)', () => {
    const spaceKeyEvent = {
      key: 'Space',
    } as React.KeyboardEvent;

    expect(isSpaceKey(spaceKeyEvent)).toBe(true);
  });

  test('returns true if the space key is pressed (single space character)', () => {
    const spaceKeyEvent = {
      key: ' ',
    } as React.KeyboardEvent;

    expect(isSpaceKey(spaceKeyEvent)).toBe(true);
  });

  test('returns true if the space key is pressed (Spacebar)', () => {
    const spaceKeyEvent = {
      key: 'Spacebar',
    } as React.KeyboardEvent;

    expect(isSpaceKey(spaceKeyEvent)).toBe(true);
  });

  test('returns false if any other key is pressed', () => {
    const enterKeyEvent = {
      key: 'Enter',
    } as React.KeyboardEvent;

    expect(isSpaceKey(enterKeyEvent)).toBe(false);
  });

  test('returns false if the key is undefined', () => {
    const undefinedKeyEvent = {
      key: undefined,
    } as unknown as React.KeyboardEvent;

    expect(isSpaceKey(undefinedKeyEvent)).toBe(false);
  });
});
