import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '../../i18n/navigation';
import { JsonLd } from '../../components/json-ld';
import { buildPageMetadata, buildWebApplicationJsonLd } from '../../lib/metadata';
import type { AppLocale } from '../../i18n/routing';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home' });

  return buildPageMetadata({
    locale: locale as AppLocale,
    path: '',
    title: t('title'),
    description: t('description'),
    ogImage: '/og-home.png',
  });
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('home');

  return (
    <section className="marketing-hero">
      <JsonLd data={buildWebApplicationJsonLd(locale as AppLocale)} />
      <p className="text-sm font-semibold tracking-wide text-[var(--color-primary)]">
        {t('title')}
      </p>
      <h1>{t('headline')}</h1>
      <p>{t('description')}</p>
      <div className="marketing-cta-row">
        <Link href="/pricing">
          <span className="inline-flex h-11 items-center rounded-[var(--radius-lg)] bg-[var(--color-primary)] px-6 text-sm font-semibold text-white hover:bg-[var(--color-primary-hover)]">
            {t('ctaPrimary')}
          </span>
        </Link>
        <Link href="/docs">
          <span className="inline-flex h-11 items-center rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] px-6 text-sm font-semibold text-[var(--color-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]">
            {t('ctaSecondary')}
          </span>
        </Link>
      </div>
    </section>
  );
}
