import {
  parseParams,
  parseParamsSafe,
  parseQuery,
  parseQuerySafe,
  parseForm,
  parseFormSafe,
} from './parsers';
import {
  boolAsString,
  checkboxAsString,
  intAsString,
  numAsString,
} from './schemas';

export {
  parseParams,
  parseParamsSafe,
  parseQuery,
  parseQuerySafe,
  parseForm,
  parseFormSafe,
  boolAsString,
  intAsString,
  numAsString,
};

export const zx = {
  parseParams,
  parseParamsSafe,
  parseQuery,
  parseQuerySafe,
  parseForm,
  parseFormSafe,
  boolAsString,
  checkboxAsString,
  intAsString,
  numAsString,
};
