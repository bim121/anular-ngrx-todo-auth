import type { Metadata } from 'next';
import type { AppLocale } from '../i18n/routing';
import { absoluteUrl, getSiteUrl, SITE_NAME } from './site';

type PageMetaPath = '' | '/pricing' | '/docs';

interface PageMetaInput {
  locale: AppLocale;
  path: PageMetaPath;
  title: string;
  description: string;
  ogImage?: string;
}

export function buildPageMetadata({
  locale,
  path,
  title,
  description,
  ogImage = '/og-default.png',
}: PageMetaInput): Metadata {
  const canonical = absoluteUrl(locale, path);
  const languages = {
    en: absoluteUrl('en', path),
    ru: absoluteUrl('ru', path),
    'x-default': absoluteUrl('en', path),
  };

  return {
    title,
    description,
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale: locale === 'ru' ? 'ru_RU' : 'en_US',
      type: 'website',
      images: [
        {
          url: `${getSiteUrl()}${ogImage}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${getSiteUrl()}${ogImage}`],
    },
  };
}

export function buildWebApplicationJsonLd(locale: AppLocale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: SITE_NAME,
    url: absoluteUrl(locale),
    description:
      'Organize tasks, share plans, and stay productive across Angular and Next.js learning stacks.',
    applicationCategory: 'ProductivityApplication',
    operatingSystem: 'Any',
  };
}
