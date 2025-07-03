import { capitalize } from '../capitalize';

describe('capitalize', () => {
  it('should capitalize the first letter of a string', () => {
    expect(capitalize('hello')).toBe('Hello');
    expect(capitalize('world')).toBe('World');
  });

  it('should handle empty strings', () => {
    expect(capitalize('')).toBe('');
  });

  it('should not modify strings that already start with an uppercase letter', () => {
    expect(capitalize('Hello')).toBe('Hello');
  });

  it('should work with single-character strings', () => {
    expect(capitalize('a')).toBe('A');
    expect(capitalize('A')).toBe('A');
  });

  it('should handle non-alphabetic first characters', () => {
    expect(capitalize('1hello')).toBe('1hello');
    expect(capitalize('!hello')).toBe('!hello');
  });
});
