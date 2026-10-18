import { createElement, type ReactNode, type ElementType } from 'react';
import { useLanguage } from './context';
import { translate } from './translate';

const attributes = ['aria-label', 'aria-description', 'title', 'placeholder', 'alt'];
function localizeChildren(children: ReactNode, language: 'en' | 'hu'): ReactNode {
  if (typeof children === 'string') return translate(children, language);
  if (Array.isArray(children)) return children.map(child => localizeChildren(child, language));
  return children;
}

export function LocalizedElement({ tag, original }: { tag: ElementType; original: Record<string, unknown> }) {
  const { language } = useLanguage();
  const props = { ...original };
  if (!props['data-no-translate'] && !(typeof tag === 'string' && ['script', 'style', 'code', 'pre'].includes(tag))) {
    props['children'] = localizeChildren(props['children'] as ReactNode, language);
    for (const attribute of attributes) {
      const value = props[attribute];
      if (typeof value === 'string') props[attribute] = translate(value, language);
    }
  }
  return createElement(tag, props);
}