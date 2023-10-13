import { zx } from './';

describe('boolAsString', () => {
  test('parses true as string', () => {
    expect(zx.boolAsString().parse('true')).toBe(true);
  });
  test('parses false as string', () => {
    expect(zx.boolAsString().parse('false')).toBe(false);
  });
  test('throws on non-boolean string', () => {
    expect(() => zx.boolAsString().parse('hello')).toThrowError();
  });
});

describe('checkboxAsString', () => {
  test('parses "on" as boolean', () => {
    expect(zx.checkboxAsString().parse('on')).toBe(true);
  });
  test('parses "true" as boolean', () => {
    expect(zx.checkboxAsString({ trueValue: 'true' }).parse('true')).toBe(true);
  });
  test('parses undefined as boolean', () => {
    expect(zx.checkboxAsString().parse(undefined)).toBe(false);
  });
  test('throws on non-"on" string', () => {
    expect(() => zx.checkboxAsString().parse('hello')).toThrowError();
  });
});

describe('intAsString', () => {
  test('parses int as string', () => {
    expect(zx.intAsString().parse('3')).toBe(3);
  });
  test('parses int as string with leading 0', () => {
    expect(zx.intAsString().parse('03')).toBe(3);
  });
  test('parses negative int as string', () => {
    expect(zx.intAsString().parse('-3')).toBe(-3);
  });
  test('throws on int as number', () => {
    expect(() => zx.intAsString().parse(3)).toThrowError();
  });
  test('throws on float', () => {
    expect(() => zx.intAsString().parse(3.14)).toThrowError();
  });
  test('throws on string float', () => {
    expect(() => zx.intAsString().parse('3.14')).toThrowError();
  });
  test('throws on non-int string', () => {
    expect(() => zx.intAsString().parse('a3')).toThrowError();
  });
});

describe('numAsString', () => {
  test('parses number with decimal as string', () => {
    expect(zx.numAsString().parse('3.14')).toBe(3.14);
  });
  test('parses number with decimal as string with leading 0', () => {
    expect(zx.numAsString().parse('03.14')).toBe(3.14);
  });
  test('parses negative number with decimal as string', () => {
    expect(zx.numAsString().parse('-3.14')).toBe(-3.14);
  });
  test('parses int as string', () => {
    expect(zx.numAsString().parse('3')).toBe(3);
  });
  test('parses int as string with leading 0', () => {
    expect(zx.numAsString().parse('03')).toBe(3);
  });
  test('parses negative int as string', () => {
    expect(zx.numAsString().parse('-3')).toBe(-3);
  });
  test('throws on non-number string', () => {
    expect(() => zx.numAsString().parse('a3')).toThrowError();
  });
});
