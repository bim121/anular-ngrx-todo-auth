import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { JsonLd } from '../../../components/json-ld';
import { buildPageMetadata, buildWebApplicationJsonLd } from '../../../lib/metadata';
import type { AppLocale } from '../../../i18n/routing';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'docs' });

  return buildPageMetadata({
    locale: locale as AppLocale,
    path: '/docs',
    title: t('title'),
    description: t('description'),
    ogImage: '/og-docs.png',
  });
}

export default async function DocsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('docs');

  return (
    <section className="marketing-section">
      <JsonLd data={buildWebApplicationJsonLd(locale as AppLocale)} />
      <h1>{t('headline')}</h1>
      <p className="lead">{t('description')}</p>
      <p className="lead">{t('body')}</p>
    </section>
  );
}
