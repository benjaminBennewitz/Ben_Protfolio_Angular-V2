import { drawColony } from './organisms/colony.js';
import { drawAmoeba } from './organisms/amoeba.js';
import { drawSpirillum } from './organisms/spirillum.js';
import { drawSun } from './organisms/sun.js';
import { drawCiliate } from './organisms/ciliate.js';
import { drawMedusa } from './organisms/medusa.js';
import { drawWorm } from './organisms/worm.js';
/** Gemeinsame Standardwerte; frequency steuert den dritten artspezifischen Parameter. */
export const DEFAULT_SETTINGS = Object.freeze({ speed: 0.8, amplitude: 1, frequency: 1.2 });

/** Die künstlerischen Proben teilen Farben und Punktdarstellung, aber keine Körperform. */
export const SPECIMENS = Object.freeze([
  {
    id: 'worm',
    number: '001',
    de: {
      name: 'Borstenwurm',
      description: 'Eine Welle wandert vom Kopf bis in die feinsten Fortsätze.',
      parameter: 'Wellenfrequenz',
      canvas: 'Schlängelnder Borstenwurm aus hellen Punkten mit seitlichen Borsten und roten Spitzen.',
    },
    en: {
      name: 'Bristle worm',
      description: 'A wave travels from the head into the finest appendages.',
      parameter: 'Wave frequency',
      canvas: 'Undulating bristle worm made of pale points, with lateral bristles and red tips.',
    },
    render: drawWorm,
  },
  {
    id: 'medusa',
    number: '002',
    fitWidth: 1.1,
    de: {
      name: 'Meduse',
      description: 'Ein innerer Impuls. Schirm und Schleier folgen seinem Rhythmus.',
      parameter: 'Schirmkontraktion',
      canvas: 'Meduse aus Punkten mit pulsierendem Lichtkern, feinen Adern, bewegtem Schirm und nachschwingenden Schleiern.',
    },
    en: {
      name: 'Medusa',
      description: 'An inner impulse. Bell and veils follow its rhythm.',
      parameter: 'Bell contraction',
      canvas: 'Point-cloud medusa with a pulsing light core, fine radial channels, a moving bell and trailing veils.',
    },
    render: drawMedusa,
  },
  {
    id: 'ciliate',
    number: '003',
    de: {
      name: 'Pantoffeltierchen',
      description: 'Unzählige Flimmerhärchen. Ein gemeinsamer Bewegungstakt.',
      parameter: 'Schlagfrequenz',
      canvas: 'Ovales Pantoffeltierchen mit feinen schlagenden Flimmerhärchen und einem inneren Zellkern.',
    },
    en: {
      name: 'Paramecium',
      description: 'Countless tiny cilia. One coordinated rhythm.',
      parameter: 'Beat frequency',
      canvas: 'Oval paramecium with beating fine cilia and an internal nucleus.',
    },
    render: drawCiliate,
  },
  {
    id: 'sun',
    number: '004',
    fitWidth: 0.92,
    de: {
      name: 'Sonnentierchen',
      description: 'Ein schwebender Mittelpunkt. Impulse wandern bis in die Spitzen.',
      parameter: 'Pulsfrequenz',
      canvas: 'Kugelförmiges Sonnentierchen mit langen radialen Strahlen und wandernden roten Impulsen.',
    },
    en: {
      name: 'Sun animalcule',
      description: 'A floating centre. Impulses travel all the way to the tips.',
      parameter: 'Pulse frequency',
      canvas: 'Spherical sun animalcule with long radial rays and travelling red impulses.',
    },
    render: drawSun,
  },
  {
    id: 'spirillum',
    number: '005',
    de: {
      name: 'Spirille',
      description: 'Ein lebender Korkenzieher. Geißeln folgen der Rotation.',
      parameter: 'Windungen',
      canvas: 'Rotierende Spirille aus Punkten mit räumlichem Schraubenkörper und feinen Geißeln.',
    },
    en: {
      name: 'Spirillum',
      description: 'A living corkscrew. Flagella follow its rotation.',
      parameter: 'Coiling',
      canvas: 'Rotating point-cloud spirillum with a helical body and fine flagella.',
    },
    render: drawSpirillum,
  },
  {
    id: 'amoeba',
    number: '006',
    fitWidth: 1.08,
    de: {
      name: 'Amöbe',
      description: 'Eine fließende Grenze. Scheinfüßchen entstehen und ziehen sich zurück.',
      parameter: 'Formwandel',
      canvas: 'Weiche Amöbe aus Punkten mit wandernden Scheinfüßchen, Zellkern und strömenden Partikeln.',
    },
    en: {
      name: 'Amoeba',
      description: 'A flowing boundary. Pseudopods emerge and withdraw.',
      parameter: 'Morphing',
      canvas: 'Soft point-cloud amoeba with extending pseudopods, a nucleus and flowing internal particles.',
    },
    render: drawAmoeba,
  },
  {
    id: 'colony',
    number: '007',
    fitWidth: 1.08,
    de: {
      name: 'Zellkolonie',
      description: 'Viele Zellen. Ein Verbund, der atmet und Impulse weitergibt.',
      parameter: 'Pulsversatz',
      canvas: 'Neun verbundene pulsierende Zellkörper mit hellen Membranen, inneren Kernen und roten Lichtimpulsen.',
    },
    en: {
      name: 'Cell colony',
      description: 'Many cells. One colony breathing and passing impulses along.',
      parameter: 'Pulse offset',
      canvas: 'Nine connected pulsing cells with pale membranes, internal nuclei and red light impulses.',
    },
    render: drawColony,
  },
]);
