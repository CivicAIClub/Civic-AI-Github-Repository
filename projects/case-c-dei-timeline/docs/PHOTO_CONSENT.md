# Photo Consent Workflow

Internal documentation for the Pomfret DEI team. Not published on the website.

---

## Why this matters

Every photograph of a real person on this site is a record of their public
presence in Pomfret School history. Before a photo is published we verify that
(1) the person is represented in a way they would recognize and accept, and (2)
the image has not been digitally altered.

The site&apos;s Sanity CMS enforces the technical side — a required checkbox that
confirms image authenticity before any profile can be saved. This document
covers the human side: **who signs off on what, before the checkbox is ticked.**

---

## Tiers of consent

### Tier A — Living subjects with direct contact
**Who:** Current students, current faculty, current Pomfret employees, alumni
whose email/phone is known and reachable.

**Required:**
1. Written (email) consent from the subject stating:
   - They approve the specific photograph being used
   - They approve the specific bio text being used
   - They understand the photo will appear on a public DEI archive
2. A dated record of that consent, stored in the DEI Dean&apos;s shared drive.
3. The `imageAuthenticityConfirmed` Sanity checkbox, ticked by the editor who
   received consent, confirming no alteration.

**Withdrawal:** If the subject later requests removal, the entry is unpublished
within 7 business days. The record of consent is retained for historical purposes.

### Tier B — Public figures (Schwartz Visiting Fellows, historical heads of school)
**Who:** Visiting speakers, historical heads of school, public figures whose
work and identity are already widely documented.

**Required:**
1. A public source for the photograph with clear attribution (e.g., the
   school&apos;s own publications, the speaker&apos;s published press photo, a
   verified institutional website).
2. No alteration. If the photo was ever retouched by a photographer for
   publication, that is acceptable as long as no AI enhancement or feature
   alteration was applied. Record the source.
3. For deceased figures: the same source standard plus any family or estate
   objection removes the photo pending review.

**Withdrawal:** A fellow or their representative can request removal at any
time and it is honored within 7 business days.

### Tier C — Historical archival photos
**Who:** Subjects drawn from published Pomfret School archival material
(<em>Pomfret Magazine</em> issues from 2003 and 2005 in particular).

**Required:**
1. The photo must be a direct reproduction from the original publication, with
   citation to the issue and page number in the `source` field.
2. No cropping that removes identifying context. Cropping for layout is
   acceptable; cropping that changes meaning is not.
3. If the subject is still alive and reachable, a courtesy notification is
   sent (not a consent request) so they know their archival photo has been
   made available on the DEI site. If they request removal, it is honored.
4. For class photos and group photos, individuals named in captions must
   still meet Tier A/B standards if they are shown prominently.

**Withdrawal:** Same as Tier B — 7 business days.

---

## What editors must do before publishing

1. Identify the tier (A, B, or C).
2. Meet the tier&apos;s requirements.
3. Fill the Sanity `source` field with the specific provenance.
4. Tick the `imageAuthenticityConfirmed` checkbox **only after** verifying the
   photo has not been digitally altered.
5. Save and publish.

---

## Hard rules (no exceptions)

- No AI-enhanced, AI-&ldquo;beautified,&rdquo; or AI-regenerated photographs of real
  people, ever.
- No skin-tone adjustment, no hair-texture alteration, no feature
  narrowing or widening, no age adjustment.
- No photographs of minors (under 18) without written guardian consent.
- No photographs of people who have explicitly requested not to be
  represented on this site.

---

## Response time standards

| Request | Response |
|---|---|
| New consent confirmation | Within 3 business days |
| Correction request | Within 5 business days |
| Removal request (Tier A) | Within 7 business days |
| Removal request (Tier B/C) | Within 7 business days |
| Accessibility issue report | Within 5 business days (see Accessibility page) |

---

## Who owns this process

The Dean of DEI holds final authority on publish/unpublish decisions. The
DEI content editor(s) are responsible for the day-to-day workflow. Questions
or disputes escalate to the Dean.
