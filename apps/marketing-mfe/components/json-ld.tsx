export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      id="marketing-json-ld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
