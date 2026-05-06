// Server component that emits a schema.org JSON-LD payload.
// Safe to use in any page or layout — no client JS.
//
// We intentionally use dangerouslySetInnerHTML because Next.js otherwise
// escapes the JSON, which breaks crawlers' ability to parse it. The payload
// is author-controlled, never user-supplied.

type JsonLdData = Record<string, unknown> | Record<string, unknown>[];

export default function JsonLd({ data }: { data: JsonLdData }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
