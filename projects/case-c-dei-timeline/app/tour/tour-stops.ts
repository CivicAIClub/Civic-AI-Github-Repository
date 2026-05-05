// Shared data for the Campus Tour. Each stop has bilingual (EN/ES) content.
//
// `status: 'draft'` means the entry is a placeholder pending DEI Office review;
// the slug page will surface that state to visitors instead of rendering
// unreviewed copy. Flip to 'published' once Dr. McCarter signs off.
//
// `TOUR_LAUNCHED` is the master gate for the public-facing /tour index.
// Until the security review is cleared, the index renders a "Coming Soon"
// notice; individual /tour/[slug] pages remain reachable so the team can
// preview them and test QR codes.

export const TOUR_LAUNCHED = false;

export type TourStop = {
  _id: string;
  locationName: string;
  slug: string;
  status: 'published' | 'draft';
  quickSummary: { en: string; es: string };
  deepDive: { en: string; es: string };
};

export const tourStops: TourStop[] = [
  {
    _id: '1',
    locationName: 'Clark Memorial Chapel',
    slug: 'clark-memorial-chapel',
    status: 'published',
    quickSummary: {
      en: 'The heart of community life at Pomfret since 1910. This is where generations of students have shared their stories through the chapel talk tradition.',
      es: 'El corazón de la vida comunitaria en Pomfret desde 1910. Aquí, generaciones de estudiantes han compartido sus historias a través de la tradición de charlas en la capilla.',
    },
    deepDive: {
      en: 'Clark Memorial Chapel has stood at the center of Pomfret School since 1910, when it was built as a gift from the Clark family. More than a place of worship, it has always been a place of gathering, reflection, and courage. The chapel talk tradition — where students stand before the entire school community to share their personal stories — became a defining feature of the Pomfret experience over the decades that followed. These talks have produced some of the most powerful moments students remember from their time on the Hilltop: moments where vulnerability becomes strength and individual stories become shared understanding.',
      es: 'La Capilla Conmemorativa Clark ha estado en el centro de la Escuela Pomfret desde 1910, cuando fue construida como un regalo de la familia Clark. Más que un lugar de culto, siempre ha sido un lugar de reunión, reflexión y coraje. La tradición de las charlas en la capilla, donde los estudiantes comparten sus historias personales con toda la comunidad escolar, se convirtió en una característica distintiva de la experiencia Pomfret. Estas charlas han producido algunos de los momentos más poderosos que los estudiantes recuerdan de su tiempo en la Colina.',
    },
  },
  {
    _id: '2',
    locationName: 'School House',
    slug: 'school-house',
    status: 'draft',
    quickSummary: {
      en: 'The original academic building, now housing the humanities department. Its walls have witnessed over a century of learning and growth.',
      es: 'El edificio académico original, que ahora alberga el departamento de humanidades. Sus paredes han sido testigo de más de un siglo de aprendizaje y crecimiento.',
    },
    deepDive: {
      en: '',
      es: '',
    },
  },
  {
    _id: '3',
    locationName: 'Centennial Garden',
    slug: 'centennial-garden',
    status: 'draft',
    quickSummary: {
      en: "Created in 1994 to celebrate Pomfret's 100th anniversary. A gathering space designed to reflect the school's evolving identity.",
      es: 'Creado en 1994 para celebrar el centenario de Pomfret. Un espacio de reunión diseñado para reflejar la identidad en evolución de la escuela.',
    },
    deepDive: { en: '', es: '' },
  },
  {
    _id: '4',
    locationName: 'Jahn Rink',
    slug: 'jahn-rink',
    status: 'draft',
    quickSummary: {
      en: 'More than an athletic facility — a place where teamwork transcends differences and community is forged through shared effort.',
      es: 'Más que una instalación deportiva: un lugar donde el trabajo en equipo trasciende las diferencias y la comunidad se forja a través del esfuerzo compartido.',
    },
    deepDive: { en: '', es: '' },
  },
  {
    _id: '5',
    locationName: 'Olmsted Observatory',
    slug: 'olmsted-observatory',
    status: 'draft',
    quickSummary: {
      en: 'Connects students to the cosmos and to the universal human experience of wonder, reminding us we all share the same sky.',
      es: 'Conecta a los estudiantes con el cosmos y con la experiencia humana universal del asombro, recordándonos que todos compartimos el mismo cielo.',
    },
    deepDive: { en: '', es: '' },
  },
  {
    _id: '6',
    locationName: 'Hard Auditorium',
    slug: 'hard-auditorium',
    status: 'draft',
    quickSummary: {
      en: 'The stage where student performances celebrate diverse cultures, traditions, and artistic expressions from around the world.',
      es: 'El escenario donde las presentaciones estudiantiles celebran diversas culturas, tradiciones y expresiones artísticas de todo el mundo.',
    },
    deepDive: { en: '', es: '' },
  },
];

export function getTourStopBySlug(slug: string): TourStop | undefined {
  return tourStops.find((s) => s.slug === slug);
}
