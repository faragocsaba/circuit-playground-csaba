import { jsx as reactJsx, jsxs as reactJsxs, Fragment } from 'react/jsx-runtime';
import { LocalizedElement } from './element';
export { Fragment } from 'react/jsx-runtime';
export type { JSX } from 'react/jsx-runtime';

export const jsx: typeof reactJsx = (type, props, key) => type !== Fragment
  ? reactJsx(LocalizedElement, { tag: type, original: props }, key)
  : reactJsx(type, props, key);
export const jsxs: typeof reactJsxs = (type, props, key) => type !== Fragment
  ? reactJsxs(LocalizedElement, { tag: type, original: props }, key)
  : reactJsxs(type, props, key);