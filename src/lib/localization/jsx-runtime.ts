import { jsx as reactJsx, jsxs as reactJsxs } from 'react/jsx-runtime';
import { LocalizedElement } from './element';
export { Fragment } from 'react/jsx-runtime';
export type { JSX } from 'react/jsx-runtime';

export const jsx: typeof reactJsx = (type, props, key) => typeof type === 'string'
  ? reactJsx(LocalizedElement, { tag: type, original: props }, key)
  : reactJsx(type, props, key);
export const jsxs: typeof reactJsxs = (type, props, key) => typeof type === 'string'
  ? reactJsxs(LocalizedElement, { tag: type, original: props }, key)
  : reactJsxs(type, props, key);