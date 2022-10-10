import { zx } from './';

describe('BoolAsString', () => {
  test('parses true as string', () => {
    expect(zx.BoolAsString.parse('true')).toBe(true);
  });
  test('parses false as string', () => {
    expect(zx.BoolAsString.parse('false')).toBe(false);
  });
  test('throws on non-boolean string', () => {
    expect(() => zx.BoolAsString.parse('hello')).toThrowError();
  });
});

describe('CheckboxAsString', () => {
  test('parses "on" as boolean', () => {
    expect(zx.CheckboxAsString.parse('on')).toBe(true);
  });
  test('parses undefined as boolean', () => {
    expect(zx.CheckboxAsString.parse(undefined)).toBe(false);
  });
  test('throws on non-"on" string', () => {
    expect(() => zx.CheckboxAsString.parse('hello')).toThrowError();
  });
});

describe('IntAsString', () => {
  test('parses int as string', () => {
    expect(zx.IntAsString.parse('3')).toBe(3);
  });
  test('parses int as string with leading 0', () => {
    expect(zx.IntAsString.parse('03')).toBe(3);
  });
  test('parses negative int as string', () => {
    expect(zx.IntAsString.parse('-3')).toBe(-3);
  });
  test('throws on int as number', () => {
    expect(() => zx.IntAsString.parse(3)).toThrowError();
  });
  test('throws on float', () => {
    expect(() => zx.IntAsString.parse(3.14)).toThrowError();
  });
  test('throws on string float', () => {
    expect(() => zx.IntAsString.parse('3.14')).toThrowError();
  });
  test('throws on non-int string', () => {
    expect(() => zx.IntAsString.parse('a3')).toThrowError();
  });
});

describe('NumAsString', () => {
  test('parses number with decimal as string', () => {
    expect(zx.NumAsString.parse('3.14')).toBe(3.14);
  });
  test('parses number with decimal as string with leading 0', () => {
    expect(zx.NumAsString.parse('03.14')).toBe(3.14);
  });
  test('parses negative number with decimal as string', () => {
    expect(zx.NumAsString.parse('-3.14')).toBe(-3.14);
  });
  test('parses int as string', () => {
    expect(zx.NumAsString.parse('3')).toBe(3);
  });
  test('parses int as string with leading 0', () => {
    expect(zx.NumAsString.parse('03')).toBe(3);
  });
  test('parses negative int as string', () => {
    expect(zx.NumAsString.parse('-3')).toBe(-3);
  });
  test('throws on non-number string', () => {
    expect(() => zx.NumAsString.parse('a3')).toThrowError();
  });
});
