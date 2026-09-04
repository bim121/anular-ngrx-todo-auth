'use client';

import { Link, usePathname } from '../i18n/navigation';
import { useLocale, useTranslations } from 'next-intl';

const angularAppUrl =
  process.env.NEXT_PUBLIC_ANGULAR_APP_URL ?? 'http://localhost:4200/en/todos';

export function SiteHeader() {
  const t = useTranslations('nav');
  const brand = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 py-3">
      <Link href="/" className="text-lg font-semibold tracking-tight">
        {brand('brand')}
      </Link>
      <nav className="flex flex-wrap items-center gap-4 text-sm" aria-label="Primary">
        <Link href="/" className="text-[var(--color-muted)] hover:text-[var(--color-text)]">
          {t('home')}
        </Link>
        <Link
          href="/pricing"
          className="text-[var(--color-muted)] hover:text-[var(--color-text)]"
        >
          {t('pricing')}
        </Link>
        <Link
          href="/docs"
          className="text-[var(--color-muted)] hover:text-[var(--color-text)]"
        >
          {t('docs')}
        </Link>
        <div className="flex items-center gap-2 text-xs font-semibold">
          <Link
            href={pathname}
            locale="en"
            className={locale === 'en' ? 'underline' : 'opacity-70'}
            lang="en"
          >
            EN
          </Link>
          <Link
            href={pathname}
            locale="ru"
            className={locale === 'ru' ? 'underline' : 'opacity-70'}
            lang="ru"
          >
            RU
          </Link>
        </div>
        <a
          href={angularAppUrl}
          className="inline-flex h-8 items-center rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 text-xs font-semibold hover:bg-[var(--color-primary-subtle)]"
        >
          {t('openApp')}
        </a>
      </nav>
    </header>
  );
}
