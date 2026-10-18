import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/localization/context';

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  return <div className="language-selector flex shrink-0 items-center gap-1" role="group" aria-label="Language / Nyelv" data-no-translate>
    <Languages size={15} className="text-muted-foreground" aria-hidden="true" />
    <Button size="sm" variant={language === 'en' ? 'secondary' : 'ghost'} aria-label="English" aria-pressed={language === 'en'} onClick={() => setLanguage('en')}>EN</Button>
    <Button size="sm" variant={language === 'hu' ? 'secondary' : 'ghost'} aria-label="Magyar" aria-pressed={language === 'hu'} onClick={() => setLanguage('hu')}>HU</Button>
  </div>;
}