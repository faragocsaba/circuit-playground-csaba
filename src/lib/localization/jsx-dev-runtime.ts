import { jsxDEV as reactJsxDEV, Fragment } from 'react/jsx-dev-runtime';
import { LocalizedElement } from './element';
export { Fragment } from 'react/jsx-dev-runtime';
export type { JSX } from 'react/jsx-dev-runtime';

export const jsxDEV: typeof reactJsxDEV = (type, props, key, staticChildren, source, self) => type !== Fragment
  ? reactJsxDEV(LocalizedElement, { tag: type, original: props }, key, staticChildren, source, self)
  : reactJsxDEV(type, props, key, staticChildren, source, self);