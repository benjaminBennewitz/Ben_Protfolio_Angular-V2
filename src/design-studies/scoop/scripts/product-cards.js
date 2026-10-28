/** @file product-cards.js — Gekapselter Teilbereich der SCOOP!-Studie. */

/**
 * Registriert Mengenwahl und Sprechblasen für alle Produktkarten.
 * @param {object} context - Explizite Abhängigkeiten dieses Bereichs.
 * @returns {void} Kein Rückgabewert.
 */
export function initProductCards({
  $,
  $$,
  element,
  motion,
  automaticHover,
  addToCart,
  flyCup,
  watchAutomaticHover,
}) {
  // Allgemeine und sortenspezifische Sprechblasentexte.
  const speechMessages = {
    general: [
      'Ja!',
      'Ja, ja, nimm mich!',
      'Ich schmecke lecker!',
      'Kauf mich!',
      'Bitte nimm mich!',
      'Trau dich!',
      'Ich schmecke am besten!',
      'Scoop mich!',
      'Ein Löffel geht noch!',
      'Klick, klick, endlich!',
      'Wir zwei? Läuft!',
      'Ich bin dein Eis!',
    ],
    strawlarry: [
      'Voll frischer Erdbeeren!',
      'Ich schmecke nach Erdbeere!',
      'Erdbeerlicious!',
      'Rosa macht glücklich!',
      'Beerenstark, oder?',
      'Ich bring den Sommer!',
    ],
    brostacchio: [
      'Komm schon, Bro!',
      'Ein paar Proteine für dich?!',
      'Pistazie? Passt zu dir!',
      'Grün steht dir, Bro!',
      'Nuss mich scoop’en!',
      'Bro, gönn dir!',
    ],
    jochen: [
      'Hi, ich bin Jochen!',
      'Ich schmecke vanillig!',
      'Ganz entspannt. Ganz Jochen.',
      'Vanille kann auch wild!',
      'Jochen regelt das!',
      'Ich bin der cremige Typ.',
    ],
  };
  // SVG-Konturen für wechselnde Sprechblasenpositionen.
  const speechBubbleShapes = [
    'M12 8H88Q96 8 96 16V76Q96 84 88 84H76L86 98L62 84H12Q4 84 4 76V16Q4 8 12 8Z',
    'M12 8H88Q96 8 96 16V76Q96 84 88 84H38L14 98L24 84H12Q4 84 4 76V16Q4 8 12 8Z',
    'M12 8H80Q88 8 88 16V38L99 55L88 62V84Q88 92 80 92H12Q4 92 4 84V16Q4 8 12 8Z',
    'M20 8H88Q96 8 96 16V84Q96 92 88 92H20Q12 92 12 84V62L1 55L12 38V16Q12 8 20 8Z',
    'M12 16H64L89 2L78 16H88Q96 16 96 24V84Q96 92 88 92H12Q4 92 4 84V24Q4 16 12 16Z',
  ];

  /**
   * Erstellt eine Sprechblase mit der passenden SVG-Kontur.
   *
   * @param {string} text - Sprechblasentext.
   * @param {number} slot - Position im Rotationsmuster.
   * @returns {HTMLElement} Sprechblasen-Element.
   */
  function createSpeechBubble(text, slot) {
    // Aktuell erzeugte Sprechblase.
    const bubble = element('span', 'speech-bubble');
    bubble.dataset.bubbleSlot = String(slot);
    // Aktuell eingebundene oder bearbeitete SVG-Instanz.
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('aria-hidden', 'true');
    // Aktuell bearbeitete SVG-Pfadkontur.
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', speechBubbleShapes[slot]);
    path.setAttribute('vector-effect', 'non-scaling-stroke');
    svg.append(path);
    bubble.append(svg, element('span', 'speech-text', text));
    return bubble;
  }

  /**
   * Bindet Mengenwahl, Hover und Sprechzustand einer Produktkarte.
   * @param {HTMLElement} card - Eingabewert der Operation.
   * @returns {void} Kein Rückgabewert.
   */
  function initProductCard(card) {
    // Aktuell ausgewählte Produktmenge.
    let quantity = 1;
    // Anzeige der gewählten Produktmenge.
    const output = $('[data-quantity-output]', card);
    // Schaltfläche zum Verringern der Produktmenge.
    const decrement = $('[data-quantity="-1"]', card);
    // Schaltfläche zum Erhöhen der Produktmenge.
    const increment = $('[data-quantity="1"]', card);
    // Kaufen-Schaltfläche der Produktkarte.
    const buy = $('[data-add]', card);

    /**
     * Aktualisiert Menge und erlaubte Mengenschritte der Produktkarte.
     *
     * @returns {void} Kein Rückgabewert.
     */
    function syncQuantity() {
      output.textContent = quantity;
      decrement.disabled = quantity <= 1;
      increment.disabled = quantity >= 12;
    }
    $$('[data-quantity]', card).forEach(

      /**
       * Verarbeitet den aktuellen Eintrag der zugehörigen DOM- oder Datenliste.
       * @param {unknown} button - Zur Interaktion gehörende Schaltfläche.
       * @returns {unknown} Ergebnis der Verarbeitung.
       */
      button => {
        return button.addEventListener(
          'click',

          /**
           * Verarbeitet das Ereignis „click“ für diese Interaktion.
           * @returns {void} Kein Rückgabewert.
           */
          () => {
            quantity = Math.max(1, Math.min(12, quantity + Number(button.dataset.quantity)));
            syncQuantity();
          },
        );
      },
    );
    buy.addEventListener(
      'click',

      /**
       * Verarbeitet das Ereignis „click“ für diese Interaktion.
       * @returns {void} Kein Rückgabewert.
       */
      () => {
        addToCart(
          {
            type: 'single',
            product: card.dataset.product,
          },
          quantity,
        );
        flyCup(card.dataset.product, buy);
      },
    );
    // Container der Sprechblasen einer Produktkarte.
    const cloud = $('.speech-cloud', card);
    // Nächste Position im Sprechblasenmuster.
    let bubbleSlot = 0;
    // Die Maus befindet sich über der Interaktion.
    let hovering = false;
    // Die Interaktion besitzt Tastaturfokus.
    let focused = false;
    // Simulierter Hover ist aktiv.
    let automaticActive = false;
    // Timeout für den nächsten Spruch.
    let speechTimer = 0;
    // Zuletzt gezeigter Spruch zur Wiederholungsvermeidung.
    let previousMessage = '';

    /**
     * Prüft, ob die aktuelle Karte sprechen darf.
     *
     * @returns {boolean} Aktiver Sprechzustand.
     */
    function speechActive() {
      return hovering || (!automaticHover.matches && focused) || automaticActive;
    }
    // Allgemeine und sortenspezifische Sprüche.
    const messages = [...speechMessages.general, ...speechMessages[card.dataset.product]];

    /**
     * Beendet die Sprechanimation und entfernt alle Blasen.
     *
     * @returns {void} Kein Rückgabewert.
     */
    function stopSpeech() {
      clearTimeout(speechTimer);
      speechTimer = 0;
      $$('.speech-bubble', cloud).forEach(

        /**
         * Verarbeitet den aktuellen Eintrag der zugehörigen DOM- oder Datenliste.
         * @param {unknown} bubble - Aktuell erzeugte Sprechblase.
         * @returns {unknown} Ergebnis der Verarbeitung.
         */
        bubble => {
          return bubble.getAnimations?.().forEach(

            /**
             * Liest oder aktualisiert den zugehörigen Interaktionszustand.
             * @param {unknown} animation - Laufende Web-Animation.
             * @returns {unknown} Ergebnis der Verarbeitung.
             */
            animation => {
              return animation.cancel();
            },
          );
        },
      );
      cloud.replaceChildren();
      bubbleSlot = 0;
      card.classList.remove('is-chatty');
    }

    /**
     * Variiert Position und Drehung der neu erzeugten Sprechblase.
     * @param {object} bubble - Aktuell erzeugte Sprechblase.
     * @returns {void} Kein Rückgabewert.
     */
    function positionSpeechBubble(bubble) {
      bubble.style.setProperty('--bubble-x', `${(Math.random() * 3).toFixed(2)}%`);
      bubble.style.setProperty('--bubble-y', `${(Math.random() * 3 - 1.5).toFixed(2)}%`);
      bubble.style.setProperty('--bubble-jitter-angle', `${(Math.random() * 8 - 4).toFixed(2)}deg`);
    }

    /**
     * Zeigt und animiert eine neue Sprechblase im Rotationsmuster.
     * @param {object} bubble - Aktuell erzeugte Sprechblase.
     * @returns {void} Kein Rückgabewert.
     */
    function showSpeechBubble(bubble) {
      bubbleSlot = (bubbleSlot + 1) % 5;
      cloud.append(bubble);
      card.classList.add('is-chatty');
      if (!motion.matches)
        bubble.animate(
          [
            {
              opacity: 0,
              scale: '.85',
              translate: '0 8px',
            },
            {
              opacity: 1,
              scale: '1',
              translate: '0 0',
            },
          ],
          {
            duration: 220,
            easing: 'ease-out',
          },
        );
    }

    /**
     * Zeigt den nächsten Spruch ohne unmittelbare Wiederholung.
     *
     * @returns {void} Kein Rückgabewert.
     */
    function speak() {
      if (!speechActive() || document.hidden) {
        stopSpeech();
        return;
      }
      // Sprüche ohne unmittelbare Wiederholung.
      const choices = messages.filter(

        /**
         * Prüft, ob der aktuelle Eintrag in der Auswahl verbleibt.
         * @param {unknown} message - Eingabewert des Callbacks.
         * @returns {unknown} Ergebnis der Verarbeitung.
         */
        message => {
          return message !== previousMessage;
        },
      );
      previousMessage = choices[Math.floor(Math.random() * choices.length)];
      if (cloud.children.length === 5) cloud.firstElementChild.remove();
      // Aktuell erzeugte Sprechblase.
      const bubble = createSpeechBubble(previousMessage, bubbleSlot);
      positionSpeechBubble(bubble);
      showSpeechBubble(bubble);
      speechTimer = setTimeout(speak, Math.random() * 2000);
    }

    /**
     * Synchronisiert den Sprechzustand mit Hover, Fokus und Sichtbarkeit.
     *
     * @returns {void} Kein Rückgabewert.
     */
    function syncSpeech() {
      card.classList.toggle('is-mouth-open', (hovering || automaticActive) && !document.hidden);
      if (speechActive() && !document.hidden) {
        if (!speechTimer) speak();
      } else stopSpeech();
    }
    card.addEventListener(
      'pointerenter',

      /**
       * Verarbeitet das Ereignis „pointerenter“ für diese Interaktion.
       * @param {Event} event - Eingabewert des Callbacks.
       * @returns {void} Kein Rückgabewert.
       */
      event => {
        if (event.pointerType === 'mouse') {
          hovering = true;
          syncSpeech();
        }
      },
    );
    card.addEventListener(
      'pointerleave',

      /**
       * Verarbeitet das Ereignis „pointerleave“ für diese Interaktion.
       * @returns {void} Kein Rückgabewert.
       */
      () => {
        hovering = false;
        syncSpeech();
      },
    );
    card.addEventListener(
      'focusin',

      /**
       * Verarbeitet das Ereignis „focusin“ für diese Interaktion.
       * @returns {void} Kein Rückgabewert.
       */
      () => {
        focused = true;
        syncSpeech();
      },
    );
    card.addEventListener(
      'focusout',

      /**
       * Verarbeitet das Ereignis „focusout“ für diese Interaktion.
       * @param {Event} event - Eingabewert des Callbacks.
       * @returns {void} Kein Rückgabewert.
       */
      event => {
        if (!card.contains(event.relatedTarget)) {
          focused = false;
          syncSpeech();
        }
      },
    );
    document.addEventListener('visibilitychange', syncSpeech);
    watchAutomaticHover(
      card,

      /**
       * Führt den zeit- oder zustandsabhängigen Callback aus.
       * @param {unknown} active - Eingabewert des Callbacks.
       * @returns {void} Kein Rückgabewert.
       */
      active => {
        automaticActive = active;
        card.classList.toggle('is-auto-hover', active);
        syncSpeech();
      },
    );
    syncQuantity();
  }
  $$('[data-product]').forEach(initProductCard);
}
