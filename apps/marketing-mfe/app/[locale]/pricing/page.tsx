import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { JsonLd } from '../../../components/json-ld';
import { buildPageMetadata, buildWebApplicationJsonLd } from '../../../lib/metadata';
import type { AppLocale } from '../../../i18n/routing';

type Props = {
  params: Promise<{ locale: string }>;
};

/** ISR — refresh pricing copy periodically (Phase 7 roadmap). */
export const revalidate = 3600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pricing' });

  return buildPageMetadata({
    locale: locale as AppLocale,
    path: '/pricing',
    title: t('title'),
    description: t('description'),
    ogImage: '/og-pricing.png',
  });
}

export default async function PricingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('pricing');

  return (
    <section className="marketing-section">
      <JsonLd data={buildWebApplicationJsonLd(locale as AppLocale)} />
      <h1>{t('headline')}</h1>
      <p className="lead">{t('description')}</p>
      <div className="pricing-grid">
        <article className="pricing-card">
          <h2>{t('free.name')}</h2>
          <div className="price">{t('free.price')}</div>
          <p>{t('free.blurb')}</p>
        </article>
        <article className="pricing-card">
          <h2>{t('team.name')}</h2>
          <div className="price">{t('team.price')}</div>
          <p>{t('team.blurb')}</p>
        </article>
      </div>
    </section>
  );
}
