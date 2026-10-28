/** @file cart.js — Demo-Warenkorb und Dialogsteuerung. */

import { products } from './products.js';

/**
 * Erstellt den Demo-Warenkorb mit Persistenz, Dialog und Mengensteuerung.
 * @param {object} context - Explizite Abhängigkeiten dieses Bereichs.
 * @returns {object} Ergebnis der beschriebenen Operation.
 */
export function createCart(context) {
  // Explizite Abhängigkeiten und öffentliche Schnittstellen dieses Bereichs.
  const { $, $$, element, motion, automaticHover, cartDialog, setMenu, readStorage, writeStorage } =
    context;
  // Schlüssel des browserlokalen Demo-Warenkorbs.
  const storageKey = 'scoop-demo-cart-v1';
  // Auslöser für die Fokus-Rückgabe nach Dialogschluss.
  let cartTrigger = null;
  // Timeout zum Ausblenden der Statusmeldung.
  let toastTimer = 0;
  // Validierte Positionen des Demo-Warenkorbs.
  let cart = [];

  /**
   * Formatiert einen Centbetrag als Euro für die Benutzeroberfläche.
   *
   * @param {number} cents - Betrag in Cent.
   * @returns {string} Formatierter Eurobetrag.
   */
  const euro = cents => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(cents / 100);
  };

  /**
   * Übernimmt eine gültige Position nur bei einer bislang unbekannten Kennung.
   * @param {object} item - Aktuell verarbeitete Warenkorbposition.
   * @param {Array<object>} result - Bereinigte Liste gültiger Warenkorbpositionen.
   * @param {Set<string>} seen - Bereits übernommene Warenkorbkennungen.
   * @returns {void} Kein Rückgabewert.
   */
  function appendValidCartItem(item, result, seen) {
    // Aus bekannten Produktkennungen normalisierte Position.
    const position = normalizeCartItem(item);
    if (!position || seen.has(position.id)) return;
    result.push(position);
    seen.add(position.id);
  }

  /**
   * Erstellt eine Warenkorbposition ausschließlich aus bekannten Produktkennungen.
   * @param {object} item - Aktuell verarbeitete Warenkorbposition.
   * @returns {object|null} Ergebnis der beschriebenen Operation.
   */
  function normalizeCartItem(item) {
    if (item.type === 'single' && Object.hasOwn(products, item.product)) {
      return {
        id: 'single:' + item.product,
        type: 'single',
        product: item.product,
        quantity: item.quantity,
      };
    }
    if (item.type !== 'box' || !Array.isArray(item.flavors) || item.flavors.length !== 3) return null;
    if (
      !item.flavors.every(

        /**
         * Prüft die Gültigkeit des aktuellen Eintrags.
         * @param {unknown} name - Eingabewert des Callbacks.
         * @returns {unknown} Ergebnis der Verarbeitung.
         */
        name => {
          return Object.hasOwn(products, name);
        },
      )
    )
      return null;
    return {
      id: 'box:' + item.flavors.join(','),
      type: 'box',
      flavors: [...item.flavors],
      quantity: item.quantity,
    };
  }

  /**
   * Übernimmt ausschließlich gültige, eindeutige Warenkorbpositionen.
   *
   * @param {*} input - Gespeicherte Warenkorbdaten.
   * @returns {Array<object>} Bereinigte Warenkorbpositionen.
   */
  function validateCart(input) {
    if (!Array.isArray(input)) return [];
    // Bereinigte Liste gültiger Warenkorbpositionen.
    const result = [];
    // Bereits übernommene Warenkorbkennungen.
    const seen = new Set();
    for (const item of input.slice(0, 50)) {
      if (!item || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) continue;
      appendValidCartItem(item, result, seen);
    }
    return result;
  }

  /**
   * Berechnet den Einzelpreis einer Position in Cent.
   *
   * @param {object} item - Produkt oder Mix-Box.
   * @returns {number} Einzelpreis in Cent.
   */
  function unitPrice(item) {
    return item.type === 'box'
      ? item.flavors.reduce(

        /**
         * Führt den aktuellen Eintrag mit dem bisherigen Gesamtergebnis zusammen.
         * @param {unknown} sum - Eingabewert des Callbacks.
         * @param {unknown} id - Stabile Kennung der aktuellen Position oder Sorte.
         * @returns {unknown} Ergebnis der Verarbeitung.
         */
        (sum, id) => {
          return sum + products[id].price;
        },
        0,
      )
      : products[item.product].price;
  }

  /**
   * Ermittelt den Anzeigenamen einer Warenkorbposition.
   *
   * @param {object} item - Produkt oder Mix-Box.
   * @returns {string} Anzeigename.
   */
  function itemName(item) {
    return item.type === 'box' ? 'Deine 3er-Mix-Box' : products[item.product].name;
  }

  /**
   * Erstellt den Beschreibungstext einer Warenkorbposition.
   *
   * @param {object} item - Produkt oder Mix-Box.
   * @returns {string} Beschreibungstext.
   */
  function itemDescription(item) {
    return item.type === 'box'
      ? item.flavors
        .map(

          /**
           * Berechnet den Zielwert für den aktuellen Listeneintrag.
           * @param {unknown} id - Stabile Kennung der aktuellen Position oder Sorte.
           * @returns {unknown} Ergebnis der Verarbeitung.
           */
          id => {
            return products[id].name;
          },
        )
        .join(' + ')
      : `500 ml · ${products[item.product].flavor}`;
  }

  /**
   * Zählt alle Produkteinheiten im Warenkorb.
   *
   * @returns {number} Gesamtmenge.
   */
  function cartCount() {
    return cart.reduce(

      /**
       * Führt den aktuellen Eintrag mit dem bisherigen Gesamtergebnis zusammen.
       * @param {unknown} sum - Eingabewert des Callbacks.
       * @param {unknown} item - Aktuell verarbeitete Warenkorbposition.
       * @returns {unknown} Ergebnis der Verarbeitung.
       */
      (sum, item) => {
        return sum + item.quantity;
      },
      0,
    );
  }

  /**
   * Berechnet den gesamten Warenkorbwert in Cent.
   *
   * @returns {number} Gesamtpreis in Cent.
   */
  function cartTotal() {
    return cart.reduce(

      /**
       * Führt den aktuellen Eintrag mit dem bisherigen Gesamtergebnis zusammen.
       * @param {unknown} sum - Eingabewert des Callbacks.
       * @param {unknown} item - Aktuell verarbeitete Warenkorbposition.
       * @returns {unknown} Ergebnis der Verarbeitung.
       */
      (sum, item) => {
        return sum + unitPrice(item) * item.quantity;
      },
      0,
    );
  }

  /**
   * Erzeugt das passende Becherbild für eine Warenkorbposition.
   *
   * @param {object} item - Produkt oder Mix-Box.
   * @returns {HTMLImageElement} Bild mit Alternativtext.
   */
  function productImage(item) {
    // Bild-Element der aktuellen Produktdarstellung.
    const img = element('img');
    // Stabile Kennung der aktuellen Position oder Sorte.
    const id = item.type === 'box' ? item.flavors[0] : item.product;
    img.src = `assets/${id}-cup.svg`;
    img.alt = item.type === 'box' ? 'Becher aus deiner Mix-Box' : products[id].name;
    img.width = 65;
    img.height = 80;
    return img;
  }

  /**
   * Zeigt eine kurze Statusmeldung mit automatischem Ausblenden.
   *
   * @param {string} text - Nachricht.
   * @returns {void} Kein Rückgabewert.
   */
  function showToast(text) {
    clearTimeout(toastTimer);
    $('#toast').textContent = text;
    $('#toast').classList.add('is-visible');
    toastTimer = setTimeout(

      /**
       * Führt den zeit- oder zustandsabhängigen Callback aus.
       * @returns {unknown} Ergebnis der Verarbeitung.
       */
      () => {
        return $('#toast').classList.remove('is-visible');
      },
      3000,
    );
  }

  /**
   * Synchronisiert Mengenanzeigen, Summen und Checkout-Status.
   *
   * @returns {void} Kein Rückgabewert.
   */
  function updateCartTotals() {
    $$('[data-bag-count]').forEach(

      /**
       * Verarbeitet den aktuellen Eintrag der zugehörigen DOM- oder Datenliste.
       * @param {unknown} node - Aktuell bearbeitetes DOM-Element.
       * @returns {void} Kein Rückgabewert.
       */
      node => {
        node.textContent = `(${cartCount()})`;
      },
    );
    $$('[data-cart-total]').forEach(

      /**
       * Verarbeitet den aktuellen Eintrag der zugehörigen DOM- oder Datenliste.
       * @param {unknown} node - Aktuell bearbeitetes DOM-Element.
       * @returns {void} Kein Rückgabewert.
       */
      node => {
        node.textContent = euro(cartTotal());
      },
    );
    $('#checkout').disabled = cart.length === 0;
  }

  /**
   * Erstellt die barrierefrei beschriftete Mengensteuerung einer Warenkorbposition.
   * @param {object} item - Aktuell verarbeitete Warenkorbposition.
   * @returns {HTMLElement} Ergebnis der beschriebenen Operation.
   */
  function createQuantityStepper(item) {
    // Barrierefrei gruppierte Mengensteuerung.
    const stepper = element('div', 'stepper');
    stepper.setAttribute('role', 'group');
    stepper.setAttribute('aria-label', `Menge ${itemName(item)}`);
    for (const delta of [-1, 1]) {
      // Zur Interaktion gehörende Schaltfläche.
      const button = element('button', '', delta === -1 ? '−' : '+');
      button.type = 'button';
      button.dataset.cartId = item.id;
      button.dataset.cartDelta = delta;
      button.setAttribute('aria-label', `${itemName(item)} ${delta === -1 ? 'verringern' : 'erhöhen'}`);
      button.disabled = delta === 1 && item.quantity === 99;
      if (delta === 1) stepper.append(element('span', '', String(item.quantity)));
      stepper.append(button);
    }
    return stepper;
  }

  /**
   * Erzeugt eine Warenkorbzeile einschließlich Mengensteuerung.
   *
   * @param {object} item - Warenkorbposition.
   * @returns {HTMLElement} Fertige Warenkorbzeile.
   */
  function createCartItemRow(item) {
    // DOM-Zeile einer Warenkorbposition.
    const row = element('article', 'cart-item');
    row.append(productImage(item));
    // Container für Name, Beschreibung und Preis.
    const info = element('div');
    info.append(
      element('h3', '', itemName(item)),
      element('p', 'item-description', itemDescription(item)),
      element('p', 'item-price', euro(unitPrice(item) * item.quantity)),
    );
    // Container für Mengenwahl und Entfernen.
    const controls = element('div', 'cart-item-controls');
    // Barrierefrei gruppierte Mengensteuerung.
    const stepper = createQuantityStepper(item);
    // Schaltfläche zum Entfernen einer Position.
    const remove = element('button', 'remove-item', 'Entfernen');
    remove.type = 'button';
    remove.dataset.removeId = item.id;
    remove.setAttribute('aria-label', `${itemName(item)} entfernen`);
    controls.append(stepper, remove);
    info.append(controls);
    row.append(info);
    return row;
  }

  /**
   * Stellt die vollständige Warenkorbliste dar.
   *
   * @param {HTMLElement} list - Container der Warenkorbpositionen.
   * @returns {void} Kein Rückgabewert.
   */
  function renderCartItems(list) {
    if (!cart.length)
      list.append(
        element('p', 'empty-cart', 'Noch ziemlich luftig hier. Such dir deinen ersten Scoop aus!'),
      );
    for (const item of cart) list.append(createCartItemRow(item));
  }

  /**
   * Zeigt die kompakte Vorschau der ersten beiden Positionen.
   *
   * @param {HTMLElement} preview - Container der Beutelvorschau.
   * @returns {void} Kein Rückgabewert.
   */
  function renderCartPreview(preview) {
    if (!cart.length)
      preview.append(element('p', 'empty-cart', 'Noch ziemlich luftig hier. Ein Scoop würde helfen.'));
    for (const item of cart.slice(0, 2)) {
      // DOM-Zeile einer Warenkorbposition.
      const row = element('div', 'preview-item');
      // Container für Name, Beschreibung und Preis.
      const info = element('div');
      row.append(productImage(item));
      info.append(
        element('b', '', itemName(item)),
        element('p', '', `${item.quantity} × ${euro(unitPrice(item))}`),
      );
      row.append(info);
      preview.append(row);
    }
    if (cart.length > 2)
      preview.append(
        element(
          'p',
          'preview-more',
          `… und ${cart.length - 2} weitere Position${cart.length > 3 ? 'en' : ''}.`,
        ),
      );
  }

  /**
   * Aktualisiert Warenkorbansichten und persistiert den Demo-Zustand.
   *
   * @returns {void} Kein Rückgabewert.
   */
  function renderCart() {
    updateCartTotals();
    // Container der Einträge beziehungsweise Sortenoptionen.
    const list = $('#cart-items');
    // Container der kompakten Warenkorbvorschau.
    const preview = $('#cart-preview-items');
    list.replaceChildren();
    preview.replaceChildren();
    renderCartItems(list);
    renderCartPreview(preview);
    writeStorage(storageKey, cart);
  }

  /**
   * Fügt eine gültige Position hinzu und aktualisiert die Oberfläche.
   *
   * @param {object} item - Produkt oder Mix-Box.
   * @param {number} quantity - Hinzuzufügende Menge.
   * @returns {void} Kein Rückgabewert.
   */
  function addToCart(item, quantity = 1) {
    if (item.type === 'box' && new Set(item.flavors).size === 3)
      document.dispatchEvent(
        new CustomEvent('bp:study-achievement', {
          detail: 'study-scoop-mix',
        }),
      );
    // Stabile Kennung der aktuellen Position oder Sorte.
    const id = item.type === 'box' ? `box:${item.flavors.join(',')}` : `single:${item.product}`;
    // Bereits vorhandene Warenkorbposition.
    const existing = cart.find(

      /**
       * Prüft die Kennung des gesuchten Eintrags.
       * @param {unknown} row - DOM-Zeile einer Warenkorbposition.
       * @returns {unknown} Ergebnis der Verarbeitung.
       */
      row => {
        return row.id === id;
      },
    );
    // Vorherige Menge beziehungsweise vorheriger Armanker.
    const previous = existing?.quantity || 0;
    // Auf 99 begrenzte nächste Positionsmenge.
    const next = Math.min(99, previous + quantity);
    if (existing) existing.quantity = next;
    else
      cart.push({
        ...item,
        id,
        quantity: next,
      });
    $('#checkout-message').textContent = '';
    renderCart();
    showToast(
      next === previous
        ? 'Dieser Scoop ist schon 99-mal im Beutel.'
        : item.type === 'box'
          ? 'Deine Mix-Box ist im Beutel. Gute Wahl!'
          : `${products[item.product].name} ist im Beutel. Mehr gute Laune!`,
    );
  }

  /**
   * Öffnet den Warenkorb-Dialog mit korrekter Fokusführung.
   *
   * @param {HTMLElement} trigger - Auslösende Schaltfläche.
   * @returns {void} Kein Rückgabewert.
   */
  function openCart(trigger) {
    if (!cartDialog.showModal || cartDialog.open) return;
    if (!$('#mobile-menu').hidden) setMenu(false, false);
    cartTrigger = trigger;
    document.body.classList.add('modal-open');
    cartDialog.showModal();
    $('#close-cart').focus();
  }
  $$('[data-open-cart]').forEach(

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
         * @returns {unknown} Ergebnis der Verarbeitung.
         */
        () => {
          return openCart(button);
        },
      );
    },
  );
  $('#close-cart').addEventListener(
    'click',

    /**
     * Verarbeitet das Ereignis „click“ für diese Interaktion.
     * @returns {unknown} Ergebnis der Verarbeitung.
     */
    () => {
      return cartDialog.close();
    },
  );
  cartDialog.addEventListener(
    'close',

    /**
     * Verarbeitet das Ereignis „close“ für diese Interaktion.
     * @returns {void} Kein Rückgabewert.
     */
    () => {
      document.body.classList.remove('modal-open');
      cartTrigger?.focus({
        preventScroll: true,
      });
    },
  );
  cartDialog.addEventListener(
    'click',

    /**
     * Verarbeitet das Ereignis „click“ für diese Interaktion.
     * @param {Event} event - Eingabewert des Callbacks.
     * @returns {void} Kein Rückgabewert.
     */
    event => {
      if (event.target === cartDialog) {
        // Dialogrechteck zur Erkennung von Backdrop-Klicks.
        const r = cartDialog.getBoundingClientRect();
        if (
          event.clientX < r.left ||
          event.clientX > r.right ||
          event.clientY < r.top ||
          event.clientY > r.bottom
        )
          cartDialog.close();
      }
      // Angeklickte Mengenschaltfläche im Warenkorb.
      const deltaButton = event.target.closest('[data-cart-delta]');
      // Angeklickte Entfernen-Schaltfläche.
      const removeButton = event.target.closest('[data-remove-id]');
      if (deltaButton || removeButton) {
        changeCartItem(deltaButton, removeButton);
      }
    },
  );
  $('#checkout').addEventListener(
    'click',

    /**
     * Verarbeitet das Ereignis „click“ für diese Interaktion.
     * @returns {void} Kein Rückgabewert.
     */
    () => {
      if (!cart.length) return;
      // Formatierter Warenkorbwert vor dem Demo-Checkout.
      const total = euro(cartTotal());
      cart = [];
      renderCart();
      $('#checkout-message').textContent =
        `Demo abgeschlossen! Dein Beispiel-Beutel hatte einen Wert von ${total}. Es wurde keine Bestellung aufgegeben und keine Zahlung ausgelöst.`;
      $('#close-cart').focus();
    },
  );

  /**
   * Erstellt das dekorative Becherbild am Startpunkt der Fluganimation.
   * @param {string} id - Stabile Kennung der aktuellen Position oder Sorte.
   * @param {object} start - Ausgangsrechteck der Kaufen-Schaltfläche.
   * @returns {HTMLImageElement} Ergebnis der beschriebenen Operation.
   */
  function createFlyingCup(id, start) {
    // Bild-Element der aktuellen Produktdarstellung.
    const img = element('img', 'flying-cup');
    img.src = `assets/${id}-cup.svg`;
    img.alt = '';
    img.setAttribute('aria-hidden', 'true');
    img.style.left = `${start.left + start.width / 2 - 35}px`;
    img.style.top = `${start.top - 60}px`;
    document.body.append(img);
    return img;
  }

  /**
   * Animiert den Becher zum Warenkorb und entfernt ihn nach Abschluss oder Abbruch.
   * @param {object} img - Bild-Element der aktuellen Produktdarstellung.
   * @param {object} x - Horizontaler Zielversatz.
   * @param {object} y - Vertikaler Zielversatz.
   * @returns {void} Kein Rückgabewert.
   */
  function animateCupFlight(img, x, y) {
    // Laufende Web-Animation.
    const animation = img.animate(
      [
        {
          transform: 'translate(0,0) rotate(-8deg) scale(1)',
          opacity: 1,
        },
        {
          transform: `translate(${x * 0.45}px,${Math.min(-100, y * 0.6)}px) rotate(15deg) scale(.8)`,
          opacity: 1,
          offset: 0.5,
        },
        {
          transform: `translate(${x}px,${y}px) rotate(-10deg) scale(.15)`,
          opacity: 0,
        },
      ],
      {
        duration: 650,
        easing: 'cubic-bezier(.3,.6,.3,1)',
      },
    );
    animation.finished.then(

      /**
       * Schließt die asynchrone Aktualisierung ab.
       * @returns {unknown} Ergebnis der Verarbeitung.
       */
      () => {
        return img.remove();
      },

      /**
       * Schließt die asynchrone Aktualisierung ab.
       * @returns {unknown} Ergebnis der Verarbeitung.
       */
      () => {
        return img.remove();
      },
    );
  }

  /**
   * Animiert einen Becher in Richtung Warenkorb.
   *
   * @param {string} id - Produktkennung.
   * @param {HTMLElement} button - Auslösende Schaltfläche.
   * @returns {void} Kein Rückgabewert.
   */
  function flyCup(id, button) {
    if (motion.matches || !Element.prototype.animate) return;
    // Ausgangsrechteck der Kaufen-Schaltfläche.
    const start = button.getBoundingClientRect();
    // Zielrechteck beziehungsweise letzter Armanker.
    const end = $('[data-open-cart]').getBoundingClientRect();
    // Bild-Element der aktuellen Produktdarstellung.
    const img = createFlyingCup(id, start);
    // Horizontaler Zielversatz.
    const x = end.left + end.width / 2 - start.left - start.width / 2;
    // Vertikaler Zielversatz.
    const y = end.top - start.top + 40;
    animateCupFlight(img, x, y);
  }

  /** Lädt und zeichnet den zuletzt gespeicherten Warenkorb. */
  function initCart() {
    cart = validateCart(readStorage(storageKey));
    renderCart();
  }

  /**
   * Ändert eine Warenkorbposition und stellt den Fokus nach dem Rendern wieder her.
   * @param {object} deltaButton - Angeklickte Mengenschaltfläche im Warenkorb.
   * @param {object} removeButton - Angeklickte Entfernen-Schaltfläche.
   * @returns {void} Kein Rückgabewert.
   */
  function changeCartItem(deltaButton, removeButton) {
    // Stabile Kennung der aktuellen Position oder Sorte.
    const id = deltaButton?.dataset.cartId || removeButton.dataset.removeId;
    // Aktuell verarbeitete Warenkorbposition.
    const item = cart.find(

      /**
       * Prüft die Kennung des gesuchten Eintrags.
       * @param {unknown} row - DOM-Zeile einer Warenkorbposition.
       * @returns {unknown} Ergebnis der Verarbeitung.
       */
      row => {
        return row.id === id;
      },
    );
    if (!item) return;
    // Mengenschritt zur Wiederherstellung des Fokus.
    const oldDelta = deltaButton?.dataset.cartDelta;
    if (removeButton)
      cart = cart.filter(

        /**
         * Prüft, ob der aktuelle Eintrag in der Auswahl verbleibt.
         * @param {unknown} row - DOM-Zeile einer Warenkorbposition.
         * @returns {unknown} Ergebnis der Verarbeitung.
         */
        row => {
          return row.id !== id;
        },
      );
    else {
      item.quantity = Math.min(99, item.quantity + Number(oldDelta));
      if (item.quantity <= 0)
        cart = cart.filter(

          /**
           * Prüft, ob der aktuelle Eintrag in der Auswahl verbleibt.
           * @param {unknown} row - DOM-Zeile einer Warenkorbposition.
           * @returns {unknown} Ergebnis der Verarbeitung.
           */
          row => {
            return row.id !== id;
          },
        );
    }
    renderCart();
    // Neu gerenderte Schaltfläche für die Fokus-Rückgabe.
    const replacement = $$('[data-cart-id]', cartDialog).find(

      /**
       * Prüft die Kennung des gesuchten Eintrags.
       * @param {unknown} button - Zur Interaktion gehörende Schaltfläche.
       * @returns {unknown} Ergebnis der Verarbeitung.
       */
      button => {
        return button.dataset.cartId === id && button.dataset.cartDelta === oldDelta;
      },
    );
    (replacement && !replacement.disabled ? replacement : $('#close-cart')).focus({
      preventScroll: true,
    });
  }
  return {
    addToCart,
    showToast,
    initCart,
    flyCup,
  };
}
