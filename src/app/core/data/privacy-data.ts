/* src/app/core/data/privacy-data.ts */

/** @file Sprachabhängige Inhalte der privacy-page-Route. */

import type { PrivacyPageContent } from '../models/page-content.models';

export const PRIVACY_CONTENT: Record<'de' | 'en', PrivacyPageContent> = { // Datenschutzinformationen in beiden unterstützten Sprachen.
  de: {
    metaTitle: 'Datenschutz | Benjamin Bennewitz',
    metaDescription: 'Datenschutzerklärung für das Portfolio von Benjamin Bennewitz mit Informationen zu Hosting, Kontaktformular, lokalen Einstellungen und Betroffenenrechten.',
    eyebrow: 'privacy_protocol.exe',
    title: 'Datenschutz',
    intro: 'Transparent statt Kleingedruckt: Welche Daten dieses Portfolio verarbeitet, warum sie benötigt werden und welche Rechte du dabei hast.',
    status: 'Stand: August 2026 · Preflight vor Produktivgang',
    backLabel: 'Zurück zur Startseite',
    contactLabel: 'Zur Projektanfrage',
    scrollLabel: 'Horizontal scrollen',
    previousLabel: 'Vorheriges Datenschutzpanel',
    nextLabel: 'Nächstes Datenschutzpanel',
    overviewLabel: 'Datenschutzkapitel',
    signals: [
      { icon: 'visibility_off', label: 'Kein Werbetracking' },
      { icon: 'storage', label: 'Lokale Präferenzen' },
      { icon: 'lock', label: 'Datensparsam gebaut' },
    ],
    chapters: [
      {
        number: '01',
        title: 'Verantwortlicher',
        icon: 'badge',
        size: 'side',
        tone: 'accent',
        text: [
          'Verantwortlich für dieses Portfolio ist Benjamin Bennewitz, c/o Linzer Straße 45, 53604 Bad Honnef, Deutschland.',
          'Kontakt: kontakt@b2folio.de · Telefon: +49 162 9038166. Weitere Anbieterangaben findest du im Impressum.',
        ],
      },
      {
        number: '02',
        title: 'Hosting & Server-Protokolle',
        icon: 'dns',
        size: 'wide',
        text: [
          'Beim Aufruf der Website verarbeitet der Hosting-Server technisch notwendige Verbindungsdaten. Dazu können IP-Adresse, Zeitpunkt, aufgerufene Ressource, Referrer, Browserkennung und Betriebssystem gehören.',
          'Die Verarbeitung dient der sicheren Auslieferung, Fehleranalyse und Abwehr von Angriffen. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Der konkrete Hostinganbieter und die produktiven Löschfristen werden vor Livegang ergänzt.',
        ],
      },
      {
        number: '03',
        title: 'Kontaktformular',
        icon: 'forward_to_inbox',
        size: 'wide',
        tone: 'soft',
        text: [
          'Wenn du das Kontaktformular nutzt, werden Name, E-Mail-Adresse, Nachricht und freiwillig gewählte Themen verarbeitet, um deine Anfrage zu beantworten.',
          'Je nach Inhalt erfolgt die Verarbeitung zur Durchführung vorvertraglicher Maßnahmen nach Art. 6 Abs. 1 lit. b DSGVO oder auf Grundlage des berechtigten Interesses an der Kommunikation nach Art. 6 Abs. 1 lit. f DSGVO.',
        ],
      },
      {
        number: '04',
        title: 'Lokale Einstellungen',
        icon: 'tune',
        size: 'wide',
        tone: 'accent',
        text: [
          'Theme, Sprache, Accessibility-Modi, Achievement-Zustände und der Status des Privacy-Hinweises können lokal im Browser gespeichert werden. Diese Daten bleiben grundsätzlich auf deinem Gerät.',
          'Technisch notwendige oder ausdrücklich gewünschte lokale Speicherung erfolgt im Rahmen von § 25 Abs. 2 TDDDG. Die Einträge können über die Browserfunktionen gelöscht werden.',
        ],
      },
      {
        number: '05',
        title: 'Tracking & Marketing',
        icon: 'query_stats',
        size: 'side',
        tone: 'success',
        text: [
          'Aktuell werden keine Analytics-, Marketing- oder Profiling-Cookies eingesetzt. Das Portfolio enthält keinen externen Consent-Dienst und erstellt keine personenbezogenen Nutzungsprofile.',
          'Sollte sich das später ändern, wird diese Erklärung vor Aktivierung der entsprechenden Dienste aktualisiert.',
        ],
      },
      {
        number: '06',
        title: 'Lokale Assets & externe Links',
        icon: 'link',
        size: 'wide',
        text: [
          'Schriften, Icons und zentrale Designassets werden lokal ausgeliefert. Dadurch entsteht beim bloßen Seitenaufruf keine notwendige Verbindung zu externen Font-CDNs.',
          'Das Portfolio enthält Links zu externen Plattformen wie LinkedIn, Xing oder GitHub. Erst wenn du einen solchen Link öffnest, gelten die Datenschutzbestimmungen des jeweiligen Anbieters.',
        ],
      },
      {
        number: '07',
        title: 'Empfänger & Dienstleister',
        icon: 'hub',
        size: 'wide',
        tone: 'soft',
        text: [
          'Personenbezogene Daten erhalten nur Stellen, die sie für den technischen Betrieb oder die Bearbeitung deiner Anfrage benötigen. Dazu kann insbesondere der eingesetzte Hosting- oder E-Mail-Dienstleister gehören.',
          'Soweit Dienstleister als Auftragsverarbeiter tätig werden, werden die gesetzlich erforderlichen Vereinbarungen abgeschlossen.',
        ],
      },
      {
        number: '08',
        title: 'Speicherdauer',
        icon: 'schedule',
        size: 'side',
        text: [
          'Kontaktanfragen werden nur so lange gespeichert, wie sie für die Kommunikation, mögliche Anschlussfragen oder gesetzliche Aufbewahrungspflichten erforderlich sind.',
          'Technische Logs werden nach Ablauf der für Sicherheit und Fehleranalyse erforderlichen Frist gelöscht oder anonymisiert.',
        ],
      },
      {
        number: '09',
        title: 'Sicherheit',
        icon: 'shield_lock',
        size: 'wide',
        tone: 'accent',
        text: [
          'Für den Produktivbetrieb sind verschlüsselte HTTPS-Übertragung, restriktive Serverkonfiguration und eine datensparsame Verarbeitung vorgesehen.',
          'Trotz technischer und organisatorischer Schutzmaßnahmen kann bei Datenübertragungen im Internet keine absolute Sicherheit garantiert werden.',
        ],
      },
      {
        number: '10',
        title: 'Deine Rechte',
        icon: 'verified_user',
        size: 'full',
        tone: 'accent',
        text: [
          'Du hast im Rahmen der gesetzlichen Voraussetzungen insbesondere Rechte auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch.',
          'Soweit eine Verarbeitung auf einer Einwilligung beruht, kannst du diese mit Wirkung für die Zukunft widerrufen. Zur Ausübung deiner Rechte genügt eine Nachricht an kontakt@b2folio.de.',
        ],
      },
      {
        number: '11',
        title: 'Beschwerderecht',
        icon: 'gavel',
        size: 'side',
        text: [
          'Du kannst dich bei einer Datenschutz-Aufsichtsbehörde beschweren. Zuständig ist insbesondere die Aufsichtsbehörde deines gewöhnlichen Aufenthaltsorts, Arbeitsplatzes oder des Orts des mutmaßlichen Verstoßes.',
        ],
      },
      {
        number: '12',
        title: 'Änderungen & Livegang',
        icon: 'deployed_code_update',
        size: 'wide',
        tone: 'success',
        text: [
          'Diese Datenschutzerklärung bildet den aktuellen Entwicklungsstand des Portfolios ab. Vor dem Produktivgang werden insbesondere Hostinganbieter, produktive Löschfristen und der reale Mailversand final geprüft und ergänzt.',
          'Bei neuen Diensten oder einer geänderten Datenverarbeitung wird die Erklärung entsprechend aktualisiert.',
        ],
      },
    ],
  },
  en: {
    metaTitle: 'Privacy | Benjamin Bennewitz',
    metaDescription: 'Privacy policy for Benjamin Bennewitz’s portfolio covering hosting, the contact form, local preferences and data subject rights.',
    eyebrow: 'privacy_protocol.exe',
    title: 'Privacy',
    intro: 'Transparent instead of hidden in fine print: what this portfolio processes, why it is needed and which rights you have.',
    status: 'Updated: August 2026 · Preflight before production launch',
    backLabel: 'Back to home',
    contactLabel: 'To project inquiry',
    scrollLabel: 'Scroll horizontally',
    previousLabel: 'Previous privacy panel',
    nextLabel: 'Next privacy panel',
    overviewLabel: 'Privacy chapters',
    signals: [
      { icon: 'visibility_off', label: 'No ad tracking' },
      { icon: 'storage', label: 'Local preferences' },
      { icon: 'lock', label: 'Data-minimal by design' },
    ],
    chapters: [
      {
        number: '01', title: 'Controller', icon: 'badge', size: 'side', tone: 'accent',
        text: ['Benjamin Bennewitz, c/o Linzer Straße 45, 53604 Bad Honnef, Germany, is responsible for this portfolio.', 'Contact: kontakt@b2folio.de · Phone: +49 162 9038166. Further provider information is available in the legal notice.'],
      },
      {
        number: '02', title: 'Hosting & server logs', icon: 'dns', size: 'wide',
        text: ['When the website is accessed, the hosting server processes technically necessary connection data. This may include the IP address, timestamp, requested resource, referrer, browser identifier and operating system.', 'Processing supports secure delivery, troubleshooting and attack prevention. The legal basis is Art. 6(1)(f) GDPR. The production hosting provider and retention periods will be added before launch.'],
      },
      {
        number: '03', title: 'Contact form', icon: 'forward_to_inbox', size: 'wide', tone: 'soft',
        text: ['When you use the contact form, your name, email address, message and any voluntarily selected topics are processed to answer your request.', 'Depending on the request, processing is based on pre-contractual measures under Art. 6(1)(b) GDPR or on the legitimate interest in communication under Art. 6(1)(f) GDPR.'],
      },
      {
        number: '04', title: 'Local settings', icon: 'tune', size: 'wide', tone: 'accent',
        text: ['Theme, language, accessibility modes, achievement states and the privacy notice status may be stored locally in the browser. These values generally remain on your device.', 'Technically necessary or explicitly requested local storage is used within the scope of Section 25(2) TDDDG. Entries can be removed through your browser settings.'],
      },
      {
        number: '05', title: 'Tracking & marketing', icon: 'query_stats', size: 'side', tone: 'success',
        text: ['No analytics, marketing or profiling cookies are currently used. The portfolio does not use an external consent service and does not create personal usage profiles.', 'If this changes later, this policy will be updated before the relevant services are activated.'],
      },
      {
        number: '06', title: 'Local assets & external links', icon: 'link', size: 'wide',
        text: ['Fonts, icons and central design assets are served locally. Merely loading the site therefore does not require a connection to external font CDNs.', 'The portfolio links to external platforms such as LinkedIn, Xing and GitHub. Their respective privacy terms apply only after you open such a link.'],
      },
      {
        number: '07', title: 'Recipients & providers', icon: 'hub', size: 'wide', tone: 'soft',
        text: ['Personal data is only shared with parties that need it for technical operation or to process your request. This may include the hosting or email provider used in production.', 'Where providers act as processors, the legally required data processing agreements will be concluded.'],
      },
      {
        number: '08', title: 'Retention', icon: 'schedule', size: 'side',
        text: ['Contact requests are retained only as long as needed for communication, follow-up questions or statutory retention duties.', 'Technical logs are deleted or anonymized after the period required for security and troubleshooting.'],
      },
      {
        number: '09', title: 'Security', icon: 'shield_lock', size: 'wide', tone: 'accent',
        text: ['The production setup is intended to use encrypted HTTPS transport, restrictive server configuration and data-minimal processing.', 'Despite technical and organizational safeguards, absolute security cannot be guaranteed for data transmitted over the internet.'],
      },
      {
        number: '10', title: 'Your rights', icon: 'verified_user', size: 'full', tone: 'accent',
        text: ['Subject to the statutory requirements, you have rights including access, rectification, erasure, restriction of processing, data portability and objection.', 'Where processing relies on consent, you may withdraw it for the future. To exercise your rights, send a message to kontakt@b2folio.de.'],
      },
      {
        number: '11', title: 'Right to complain', icon: 'gavel', size: 'side',
        text: ['You may lodge a complaint with a data protection supervisory authority, in particular the authority responsible for your habitual residence, workplace or the location of the alleged infringement.'],
      },
      {
        number: '12', title: 'Changes & launch', icon: 'deployed_code_update', size: 'wide', tone: 'success',
        text: ['This policy reflects the current development state of the portfolio. Before production launch, the hosting provider, production retention periods and actual email delivery will be reviewed and completed.', 'If new services or processing activities are introduced, the policy will be updated accordingly.'],
      },
    ],
  },
};
