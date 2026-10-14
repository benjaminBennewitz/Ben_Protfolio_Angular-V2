/* scoop/script.js */
'use strict';
(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const products = { strawlarry: { name: 'Strawlarry', flavor: 'Erdbeere', price: 690 }, brostacchio: { name: 'Brostacchio', flavor: 'Pistazie', price: 690 }, jochen: { name: 'Jochen', flavor: 'Vanille', price: 690 } };
  const storageKey = 'scoop-demo-cart-v1';
  const voteKey = 'scoop-demo-vote-v1';
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const automaticHover = matchMedia('(hover: none), (pointer: coarse)');
  const loader = $('#page-loader');
  const loaderStarted = performance.now();
  $('.site-shell').inert = true; document.body.classList.add('is-loading');
  const cartDialog = $('#cart-dialog');
  const menu = $('#mobile-menu');
  const menuButton = $('#menu-toggle');
  const actors = new Set();
  const founderActors = new Set();
  let mountIndex = 0;
  let pointer = null;
  let frame = 0;
  let heroElapsed = 0;
  let heroPreviousFrame = 0;
  let heroRunning = false;
  let heroLanded = false;
  let heroVisible = true;
  let pathReady = false;
  let pathCurrentLength = 0;
  let pathTargetLength = 0;
  let cartTrigger = null;
  let toastTimer = 0;
  let cart = [];
  const mix = ['strawlarry', 'brostacchio', 'jochen'];
  const euro = cents => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(cents / 100);

  /** Liest nur das eigene, optionale Demo-Storage und fängt gesperrte Zugriffe ab. */
  function readStorage(key) { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } }
  function writeStorage(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* Die Demo bleibt auch ohne Storage bedienbar. */ } }

  /** Akzeptiert ausschließlich bekannte Produkte, gültige Mix-Boxen und begrenzte Mengen. */
  function validateCart(input) {
    if (!Array.isArray(input)) return [];
    const result = [];
    const seen = new Set();
    for (const item of input.slice(0, 50)) {
      if (!item || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) continue;
      if (item.type === 'single' && Object.hasOwn(products, item.product)) {
        const id = `single:${item.product}`;
        if (!seen.has(id)) { result.push({ id, type: 'single', product: item.product, quantity: item.quantity }); seen.add(id); }
      } else if (item.type === 'box' && Array.isArray(item.flavors) && item.flavors.length === 3 && item.flavors.every(name => Object.hasOwn(products, name))) {
        const id = `box:${item.flavors.join(',')}`;
        if (!seen.has(id)) { result.push({ id, type: 'box', flavors: [...item.flavors], quantity: item.quantity }); seen.add(id); }
      }
    }
    return result;
  }
  function unitPrice(item) { return item.type === 'box' ? item.flavors.reduce((sum, id) => sum + products[id].price, 0) : products[item.product].price; }
  function itemName(item) { return item.type === 'box' ? 'Deine 3er-Mix-Box' : products[item.product].name; }
  function itemDescription(item) { return item.type === 'box' ? item.flavors.map(id => products[id].name).join(' + ') : `500 ml · ${products[item.product].flavor}`; }
  function cartCount() { return cart.reduce((sum, item) => sum + item.quantity, 0); }
  function cartTotal() { return cart.reduce((sum, item) => sum + unitPrice(item) * item.quantity, 0); }

  /** Erzeugt UI ausschließlich aus Textknoten; gespeicherte Werte werden nicht als HTML ausgegeben. */
  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function productImage(item) {
    const img = element('img'); const id = item.type === 'box' ? item.flavors[0] : item.product;
    img.src = `assets/${id}-cup.svg`; img.alt = item.type === 'box' ? 'Becher aus deiner Mix-Box' : products[id].name; img.width = 65; img.height = 80;
    return img;
  }
  function showToast(text) {
    clearTimeout(toastTimer); $('#toast').textContent = text; $('#toast').classList.add('is-visible');
    toastTimer = setTimeout(() => $('#toast').classList.remove('is-visible'), 3000);
  }

  /** Gemeinsame Darstellung für Mengen, Zwischensumme, Drawer und kleine Beutelvorschau. */
  function renderCart() {
    $$('[data-bag-count]').forEach(node => { node.textContent = `(${cartCount()})`; });
    $$('[data-cart-total]').forEach(node => { node.textContent = euro(cartTotal()); });
    $('#checkout').disabled = cart.length === 0;
    const list = $('#cart-items'); const preview = $('#cart-preview-items'); list.replaceChildren(); preview.replaceChildren();
    if (!cart.length) {
      list.append(element('p', 'empty-cart', 'Noch ziemlich luftig hier. Such dir deinen ersten Scoop aus!'));
      preview.append(element('p', 'empty-cart', 'Noch ziemlich luftig hier. Ein Scoop würde helfen.'));
    }
    for (const item of cart) {
      const row = element('article', 'cart-item'); row.append(productImage(item));
      const info = element('div'); info.append(element('h3', '', itemName(item)), element('p', 'item-description', itemDescription(item)), element('p', 'item-price', euro(unitPrice(item) * item.quantity)));
      const controls = element('div', 'cart-item-controls'); const stepper = element('div', 'stepper'); stepper.setAttribute('role', 'group'); stepper.setAttribute('aria-label', `Menge ${itemName(item)}`);
      for (const delta of [-1, 1]) {
        const button = element('button', '', delta === -1 ? '−' : '+'); button.type = 'button'; button.dataset.cartId = item.id; button.dataset.cartDelta = delta;
        button.setAttribute('aria-label', `${itemName(item)} ${delta === -1 ? 'verringern' : 'erhöhen'}`); button.disabled = delta === 1 && item.quantity === 99;
        if (delta === 1) stepper.append(element('span', '', String(item.quantity)));
        stepper.append(button);
      }
      const remove = element('button', 'remove-item', 'Entfernen'); remove.type = 'button'; remove.dataset.removeId = item.id; remove.setAttribute('aria-label', `${itemName(item)} entfernen`);
      controls.append(stepper, remove); info.append(controls); row.append(info); list.append(row);
    }
    for (const item of cart.slice(0, 2)) {
      const row = element('div', 'preview-item'); const info = element('div'); row.append(productImage(item));
      info.append(element('b', '', itemName(item)), element('p', '', `${item.quantity} × ${euro(unitPrice(item))}`)); row.append(info); preview.append(row);
    }
    if (cart.length > 2) preview.append(element('p', 'preview-more', `… und ${cart.length - 2} weitere Position${cart.length > 3 ? 'en' : ''}.`));
    writeStorage(storageKey, cart);
  }

  /** Addiert Mengen zentral; alle Preise werden aus dem Produktkatalog in Cent berechnet. */
  function addToCart(item, quantity = 1) {
    const id = item.type === 'box' ? `box:${item.flavors.join(',')}` : `single:${item.product}`;
    const existing = cart.find(row => row.id === id);
    const previous = existing?.quantity || 0;
    const next = Math.min(99, previous + quantity);
    if (existing) existing.quantity = next; else cart.push({ ...item, id, quantity: next });
    $('#checkout-message').textContent = ''; renderCart();
    showToast(next === previous ? 'Dieser Scoop ist schon 99-mal im Beutel.' : item.type === 'box' ? 'Deine Mix-Box ist im Beutel. Gute Wahl!' : `${products[item.product].name} ist im Beutel. Mehr gute Laune!`);
  }

  function openCart(trigger) {
    if (!cartDialog.showModal || cartDialog.open) return;
    if (!menu.hidden) setMenu(false, false);
    cartTrigger = trigger; document.body.classList.add('modal-open'); cartDialog.showModal(); $('#close-cart').focus();
  }
  $$('[data-open-cart]').forEach(button => button.addEventListener('click', () => openCart(button)));
  $('#close-cart').addEventListener('click', () => cartDialog.close());
  cartDialog.addEventListener('close', () => { document.body.classList.remove('modal-open'); cartTrigger?.focus({ preventScroll: true }); });
  cartDialog.addEventListener('click', event => {
    if (event.target === cartDialog) { const r = cartDialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) cartDialog.close(); }
    const deltaButton = event.target.closest('[data-cart-delta]'); const removeButton = event.target.closest('[data-remove-id]');
    if (deltaButton || removeButton) {
      const id = deltaButton?.dataset.cartId || removeButton.dataset.removeId; const item = cart.find(row => row.id === id); if (!item) return;
      const oldDelta = deltaButton?.dataset.cartDelta;
      if (removeButton) cart = cart.filter(row => row.id !== id); else { item.quantity = Math.min(99, item.quantity + Number(oldDelta)); if (item.quantity <= 0) cart = cart.filter(row => row.id !== id); }
      renderCart();
      const replacement = $$('[data-cart-id]', cartDialog).find(button => button.dataset.cartId === id && button.dataset.cartDelta === oldDelta);
      (replacement && !replacement.disabled ? replacement : $('#close-cart')).focus({ preventScroll: true });
    }
  });
  $('#checkout').addEventListener('click', () => {
    if (!cart.length) return;
    const total = euro(cartTotal()); cart = []; renderCart();
    $('#checkout-message').textContent = `Demo abgeschlossen! Dein Beispiel-Beutel hatte einen Wert von ${total}. Es wurde keine Bestellung aufgegeben und keine Zahlung ausgelöst.`;
    $('#close-cart').focus();
  });

  /** Kleiner Flug zum Beutel; native Web Animations, bei Reduced Motion ausgelassen. */
  function flyCup(id, button) {
    if (motion.matches || !Element.prototype.animate) return;
    const start = button.getBoundingClientRect(), end = $('[data-open-cart]').getBoundingClientRect();
    const img = element('img', 'flying-cup'); img.src = `assets/${id}-cup.svg`; img.alt = ''; img.setAttribute('aria-hidden', 'true'); img.style.left = `${start.left + start.width / 2 - 35}px`; img.style.top = `${start.top - 60}px`; document.body.append(img);
    const x = end.left + end.width / 2 - start.left - start.width / 2; const y = end.top - start.top + 40;
    const animation = img.animate([{ transform: 'translate(0,0) rotate(-8deg) scale(1)', opacity: 1 }, { transform: `translate(${x * .45}px,${Math.min(-100, y * .6)}px) rotate(15deg) scale(.8)`, opacity: 1, offset: .5 }, { transform: `translate(${x}px,${y}px) rotate(-10deg) scale(.15)`, opacity: 0 }], { duration: 650, easing: 'cubic-bezier(.3,.6,.3,1)' });
    animation.finished.then(() => img.remove(), () => img.remove());
  }
  /** Kurze Sprüche werden ohne direkte Wiederholung pro aktiver Karte zufällig gewählt. */
  const speechMessages = {
    general: ['Ja!', 'Ja, ja, nimm mich!', 'Ich schmecke lecker!', 'Kauf mich!', 'Bitte nimm mich!', 'Trau dich!', 'Ich schmecke am besten!', 'Scoop mich!', 'Ein Löffel geht noch!', 'Klick, klick, endlich!', 'Wir zwei? Läuft!', 'Ich bin dein Eis!'],
    strawlarry: ['Voll frischer Erdbeeren!', 'Ich schmecke nach Erdbeere!', 'Erdbeerlicious!', 'Rosa macht glücklich!', 'Beerenstark, oder?', 'Ich bring den Sommer!'],
    brostacchio: ['Komm schon, Bro!', 'Ein paar Proteine für dich?!', 'Pistazie? Passt zu dir!', 'Grün steht dir, Bro!', 'Nuss mich scoop’en!', 'Bro, gönn dir!'],
    jochen: ['Hi, ich bin Jochen!', 'Ich schmecke vanillig!', 'Ganz entspannt. Ganz Jochen.', 'Vanille kann auch wild!', 'Jochen regelt das!', 'Ich bin der cremige Typ.']
  };
  const speechBubbleShapes = [
    'M12 8H88Q96 8 96 16V76Q96 84 88 84H76L86 98L62 84H12Q4 84 4 76V16Q4 8 12 8Z',
    'M12 8H88Q96 8 96 16V76Q96 84 88 84H38L14 98L24 84H12Q4 84 4 76V16Q4 8 12 8Z',
    'M12 8H80Q88 8 88 16V38L99 55L88 62V84Q88 92 80 92H12Q4 92 4 84V16Q4 8 12 8Z',
    'M20 8H88Q96 8 96 16V84Q96 92 88 92H20Q12 92 12 84V62L1 55L12 38V16Q12 8 20 8Z',
    'M12 16H64L89 2L78 16H88Q96 16 96 24V84Q96 92 88 92H12Q4 92 4 84V24Q4 16 12 16Z'
  ];
  /** Ein geschlossener SVG-Umriss verbindet die Blase und ihre zum Becher zeigende Spitze. */
  function createSpeechBubble(text, slot) {
    const bubble = element('span', 'speech-bubble'); bubble.dataset.bubbleSlot = String(slot);
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 100 100'); svg.setAttribute('preserveAspectRatio', 'none'); svg.setAttribute('aria-hidden', 'true');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path'); path.setAttribute('d', speechBubbleShapes[slot]);
    path.setAttribute('vector-effect', 'non-scaling-stroke'); svg.append(path); bubble.append(svg, element('span', 'speech-text', text));
    return bubble;
  }
  const automaticHoverTargets = new Map();
  const automaticHoverObserver = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    for (const entry of entries) {
      const state = automaticHoverTargets.get(entry.target);
      if (state) { state.visible = entry.isIntersecting && entry.intersectionRatio >= .3; refreshAutomaticHover(entry.target); }
    }
  }, { threshold: [0, .3] }) : null;
  /** Dekorative Hover-Zustände laufen auf Touch-Geräten nur sichtbar und ohne Reduced Motion. */
  function refreshAutomaticHover(target) {
    const state = automaticHoverTargets.get(target);
    state?.update(automaticHover.matches && state.visible && !document.hidden && !motion.matches);
  }
  function watchAutomaticHover(target, update) {
    automaticHoverTargets.set(target, { visible: false, update }); automaticHoverObserver?.observe(target); refreshAutomaticHover(target);
  }
  function refreshAutomaticHovers() { for (const target of automaticHoverTargets.keys()) refreshAutomaticHover(target); }
  automaticHover.addEventListener('change', refreshAutomaticHovers);
  motion.addEventListener('change', refreshAutomaticHovers);
  document.addEventListener('visibilitychange', refreshAutomaticHovers);
  $$('[data-product]').forEach(card => {
    let quantity = 1; const output = $('[data-quantity-output]', card); const decrement = $('[data-quantity="-1"]', card); const increment = $('[data-quantity="1"]', card); const buy = $('[data-add]', card);
    function syncQuantity() { output.textContent = quantity; decrement.disabled = quantity <= 1; increment.disabled = quantity >= 12; }
    $$('[data-quantity]', card).forEach(button => button.addEventListener('click', () => { quantity = Math.max(1, Math.min(12, quantity + Number(button.dataset.quantity))); syncQuantity(); }));
    buy.addEventListener('click', () => { addToCart({ type: 'single', product: card.dataset.product }, quantity); flyCup(card.dataset.product, buy); });
    const cloud = $('.speech-cloud', card);
    let bubbleSlot = 0;
    let hovering = false, focused = false, automaticActive = false, speechTimer = 0, previousMessage = '';
    function speechActive() { return hovering || (!automaticHover.matches && focused) || automaticActive; }
    const messages = [...speechMessages.general, ...speechMessages[card.dataset.product]];
    function stopSpeech() { clearTimeout(speechTimer); speechTimer = 0; $$('.speech-bubble', cloud).forEach(bubble => bubble.getAnimations?.().forEach(animation => animation.cancel())); cloud.replaceChildren(); bubbleSlot = 0; card.classList.remove('is-chatty'); }
    function speak() {
      if (!speechActive() || document.hidden) { stopSpeech(); return; }
      const choices = messages.filter(message => message !== previousMessage);
      previousMessage = choices[Math.floor(Math.random() * choices.length)];
      if (cloud.children.length === 5) cloud.firstElementChild.remove();
      const bubble = createSpeechBubble(previousMessage, bubbleSlot);
      bubble.style.setProperty('--bubble-x', `${(Math.random() * 3).toFixed(2)}%`);
      bubble.style.setProperty('--bubble-y', `${(Math.random() * 3 - 1.5).toFixed(2)}%`);
      bubble.style.setProperty('--bubble-jitter-angle', `${(Math.random() * 8 - 4).toFixed(2)}deg`);
      bubbleSlot = (bubbleSlot + 1) % 5; cloud.append(bubble);
      card.classList.add('is-chatty');
      if (!motion.matches) bubble.animate([{ opacity: 0, scale: '.85', translate: '0 8px' }, { opacity: 1, scale: '1', translate: '0 0' }], { duration: 220, easing: 'ease-out' });
      speechTimer = setTimeout(speak, Math.random() * 2000);
    }
    function syncSpeech() { card.classList.toggle('is-mouth-open', (hovering || automaticActive) && !document.hidden); if (speechActive() && !document.hidden) { if (!speechTimer) speak(); } else stopSpeech(); }
    card.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') { hovering = true; syncSpeech(); } });
    card.addEventListener('pointerleave', () => { hovering = false; syncSpeech(); });
    card.addEventListener('focusin', () => { focused = true; syncSpeech(); });
    card.addEventListener('focusout', event => { if (!card.contains(event.relatedTarget)) { focused = false; syncSpeech(); } });
    document.addEventListener('visibilitychange', syncSpeech);
    watchAutomaticHover(card, active => { automaticActive = active; card.classList.toggle('is-auto-hover', active); syncSpeech(); });
    syncQuantity();
  });

  let visibilityObserver;
  if ('IntersectionObserver' in window) visibilityObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const actor = [...actors].find(item => item.svg === entry.target); if (actor) actor.visible = entry.isIntersecting;
      if (entry.target === $('#hero-art')) heroVisible = entry.isIntersecting;
      if (entry.target === $('.mix-illustration')) entry.target.classList.toggle('is-in-view', entry.isIntersecting);
    }
    requestFrame();
  }, { rootMargin: '40px', threshold: 0 });

  /** Bindet vorbereitete Originalgrafiken inline ein und vergibt pro Instanz eindeutige IDs. */
  function mountArtwork(key, host) {
    const oldSvg = $('svg[data-character]', host); const oldActor = [...actors].find(item => item.svg === oldSvg);
    if (oldActor) { visibilityObserver?.unobserve(oldSvg); actors.delete(oldActor); }
    const text = window.SCOOP_ARTWORKS[key]; if (!text) return null;
    const svg = new DOMParser().parseFromString(text, 'image/svg+xml').documentElement;
    const prefix = `scoop-${++mountIndex}-`; const idMap = new Map();
    [svg, ...$$('[id]', svg)].forEach(node => { if (node.id) { const old = node.id; idMap.set(old, prefix + old); node.id = prefix + old; } });
    [svg, ...$$('*', svg)].forEach(node => { for (const attr of [...node.attributes]) {
      let value = attr.value.replace(/url\(#([^)]+)\)/g, (_, id) => `url(#${idMap.get(id) || id})`);
      if ((attr.name === 'href' || attr.name === 'xlink:href') && value.startsWith('#')) value = `#${idMap.get(value.slice(1)) || value.slice(1)}`;
      if (value !== attr.value) node.setAttribute(attr.name, value);
    } });
    svg.dataset.character = key; host.replaceChildren(svg);
    const actor = { svg, gazePhase: mountIndex * .65, visible: !visibilityObserver, eyes: $$('[data-eye]', svg).map(eye => ({ white: $('[data-eye-white]', eye), mover: $('[data-pupil]', eye), base: null, x: 0, y: 0 })), arms: [] };
    if (key === 'jochen-scoop') $$('[data-arm]', svg).forEach(path => {
      const length = path.getTotalLength(); const points = [0, 1 / 3, 2 / 3, 1].map(t => { const p = path.getPointAtLength(t * length); return { x: p.x, y: p.y }; });
      const hand = $('[data-hand]', path.parentElement); const nearEnd = path.getPointAtLength(length - 1); const end = points[3];
      actor.arms.push({ path, hand, points, phase: actor.arms.length * 2.4, angle: Math.atan2(end.y - nearEnd.y, end.x - nearEnd.x) });
    });
    actors.add(actor); visibilityObserver?.observe(svg); return svg;
  }
  $$('[data-art]').forEach(host => mountArtwork(host.dataset.art, host));
  /** Endpositionen entsprechen der Soll-Komposition; Fallbewegung und feste Pose sind getrennt. */
  const heroLayers = [
    { name: 'cone', key: 'Unbenannt-5', x: 286.6, y: 944.7, w: 391.85, h: 626.43, angle: 0, delay: -1 },
    { name: 'jochen', key: 'jochen-scoop', x: 73.75, y: 573, w: 880.83, h: 481.18, angle: 0, delay: 100 },
    { name: 'brostacchio', key: 'brostacchio-scoop', x: 99.3, y: 281.85, w: 640.92, h: 516.62, angle: 0, delay: 950 },
    { name: 'strawlarry', key: 'strawlarry-scoop', x: 201, y: 73.6, w: 543.3, h: 527.38, angle: -8, delay: 1800 }
  ];
  heroLayers.forEach(layer => {
    layer.group = $(`[data-hero="${layer.name}"]`);
    const pose = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    pose.setAttribute('transform', `translate(${layer.x},${layer.y}) rotate(${layer.angle}) scale(.935)`);
    layer.group.replaceChildren(pose); layer.svg = mountArtwork(layer.key, pose);
    layer.svg.setAttribute('width', layer.w); layer.svg.setAttribute('height', layer.h);
    layer.shadow = $('[data-contact-shadow]', layer.svg); layer.offset = 0; layer.contact = false;
  });
  function renderMix() { $$('[data-mix-art]').forEach((host, index) => { mountArtwork(`${mix[index]}-cup`, host); host.setAttribute('role', 'img'); host.setAttribute('aria-label', `${products[mix[index]].name} auf Platz ${index + 1}`); }); requestFrame(); }
  let openMixPicker = null;
  /** Eigene Listbox mit Pfeiltasten, Home/End, Escape, Tab und Fokus-Rückgabe. */
  function closeMixPicker(restoreFocus = false) {
    if (!openMixPicker) return;
    const trigger = $('[data-mix-select]', openMixPicker);
    $('.mix-options', openMixPicker).hidden = true; trigger.setAttribute('aria-expanded', 'false');
    if (restoreFocus) trigger.focus(); openMixPicker = null;
  }
  $$('[data-mix-picker]').forEach(picker => {
    const trigger = $('[data-mix-select]', picker), list = $('.mix-options', picker), options = $$('[data-mix-option]', picker), index = Number(picker.dataset.mixPicker);
    function openPicker() {
      closeMixPicker(); openMixPicker = picker; list.hidden = false; trigger.setAttribute('aria-expanded', 'true');
      options.find(option => option.dataset.mixOption === mix[index]).focus();
    }
    trigger.addEventListener('click', () => { if (openMixPicker === picker) closeMixPicker(true); else openPicker(); });
    trigger.addEventListener('keydown', event => { if (['ArrowDown', 'ArrowUp'].includes(event.key)) { event.preventDefault(); openPicker(); } });
    options.forEach(option => option.addEventListener('click', () => {
      const id = option.dataset.mixOption; mix[index] = id; picker.dataset.flavor = id;
      $('.mix-choice-label', trigger).textContent = `${products[id].name} · ${products[id].flavor}`;
      $('.mix-choice-icon', trigger).src = `assets/${id}-cup.svg`;
      trigger.setAttribute('aria-label', `Platz ${index + 1}: ${products[id].name}, ${products[id].flavor}`);
      options.forEach(node => node.setAttribute('aria-selected', String(node === option)));
      closeMixPicker(true); renderMix();
    }));
    list.addEventListener('keydown', event => {
      const current = options.indexOf(document.activeElement);
      const directions = { ArrowDown: 1, ArrowUp: -1, Home: -current, End: options.length - 1 - current };
      if (Object.hasOwn(directions, event.key)) { event.preventDefault(); options[(current + directions[event.key] + options.length) % options.length].focus(); }
    });
    picker.addEventListener('keydown', event => { if (event.key === 'Escape' && openMixPicker === picker) { event.preventDefault(); event.stopPropagation(); closeMixPicker(true); } else if (event.key === 'Tab') closeMixPicker(true); });
    picker.addEventListener('focusout', event => { if (!picker.contains(event.relatedTarget) && openMixPicker === picker) closeMixPicker(); });
  });
  document.addEventListener('pointerdown', event => { if (openMixPicker && !openMixPicker.contains(event.target)) closeMixPicker(); });
  $('#add-mix').addEventListener('click', () => addToCart({ type: 'box', flavors: [...mix] }));
  renderMix();

  /** Fällt, federt zweimal nach und setzt die Figur auf ihre endgültige Position. */
  function dropOffset(progress) {
    const points = [[0, -1400], [.55, 0], [.7, -65], [.84, 0], [.92, -14], [1, 0]];
    for (let i = 1; i < points.length; i++) if (progress <= points[i][0]) {
      const [a, from] = points[i - 1], [b, to] = points[i]; let t = Math.max(0, (progress - a) / (b - a));
      t = i === 1 ? t * t : (1 - Math.cos(t * Math.PI)) / 2; return from + (to - from) * t;
    }
    return 0;
  }
  function finishHero() { heroRunning = false; heroLanded = true; heroLayers.forEach(layer => { layer.offset = 0; layer.contact = true; layer.group.removeAttribute('transform'); layer.group.style.opacity = '1'; if (layer.shadow) layer.shadow.style.opacity = '1'; }); pathReady = true; updatePath(); requestFrame(); }
  function playHero() {
    if (motion.matches) { finishHero(); showToast('Weniger Bewegung ist aktiv. Die Kugeln bleiben an ihrem Platz.'); return; }
    heroElapsed = 0; heroPreviousFrame = 0; heroRunning = true; pathReady = false; pathCurrentLength = 0; updatePath(); heroLanded = false;
    heroLayers.forEach(layer => { layer.contact = false; if (layer.delay >= 0) { layer.group.style.opacity = '0'; layer.group.setAttribute('transform', 'translate(0,-1400)'); } if (layer.shadow) layer.shadow.style.opacity = '0'; }); requestFrame();
  }
  $('#replay-hero').addEventListener('click', playHero);

  /** Rekonstruiert drei weich verbundene Béziersegmente aus vier verformten Armankern. */
  function armPath(points) {
    let d = `M${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const a = points[Math.max(0, i - 1)], b = points[i], c = points[i + 1], e = points[Math.min(points.length - 1, i + 2)];
      d += ` C${b.x + (c.x - a.x) / 6},${b.y + (c.y - a.y) / 6} ${c.x - (e.x - b.x) / 6},${c.y - (e.y - b.y) / 6} ${c.x},${c.y}`;
    }
    return d;
  }
  function updateArms(actor, time) {
    for (const arm of actor.arms) {
      const points = arm.points.map((p, i) => ({ x: p.x + Math.sin(time * 2.9 + arm.phase - i * .9) * i * 6, y: p.y + Math.sin(time * 2.1 + arm.phase - i * 1.2) * i * 5 }));
      arm.path.setAttribute('d', armPath(points));
      const last = points[3], previous = points[2], base = arm.points[3];
      const angle = (Math.atan2(last.y - previous.y, last.x - previous.x) - arm.angle) * 180 / Math.PI;
      arm.hand.setAttribute('transform', `translate(${last.x - base.x},${last.y - base.y}) rotate(${angle},${base.x},${base.y})`);
    }
  }
  function resetFounderArms(actor) { for (const arm of actor.arms) { arm.path.setAttribute('d', arm.original); arm.hand.removeAttribute('transform'); } }
  /** Die Portrait-Arme nutzen dieselbe Pfadverformung wie Jochen, jedoch nur bei Hover/Fokus/Klick. */
  $$('.founder-wave').forEach(button => {
    const actor = { arms: [], active: false }; let hovering = false, focused = false, tapped = false, automaticActive = false, tapTimer = 0;
    $$('[data-founder-arm]', button).forEach(path => {
      const length = path.getTotalLength(), points = [0, 1 / 3, 2 / 3, 1].map(t => { const p = path.getPointAtLength(t * length); return { x: p.x, y: p.y }; });
      const end = points[3], near = path.getPointAtLength(length - 1);
      actor.arms.push({ path, hand: $('[data-founder-hand]', path.parentElement), points, original: path.getAttribute('d'), phase: actor.arms.length * 2.4, angle: Math.atan2(end.y - near.y, end.x - near.x) });
    });
    function syncWave() { actor.active = (hovering || focused || tapped || automaticActive) && !document.hidden && (!automaticHover.matches || automaticActive || hovering); if (!actor.active || motion.matches) resetFounderArms(actor); else requestFrame(); }
    button.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') { hovering = true; syncWave(); } });
    button.addEventListener('pointerleave', () => { hovering = false; syncWave(); });
    button.addEventListener('focus', () => { focused = true; syncWave(); }); button.addEventListener('blur', () => { focused = false; syncWave(); });
    button.addEventListener('click', () => { clearTimeout(tapTimer); tapped = true; syncWave(); tapTimer = setTimeout(() => { tapped = false; syncWave(); }, 1600); });
    watchAutomaticHover(button, active => { automaticActive = active; button.classList.toggle('is-auto-hover', active); syncWave(); });
    founderActors.add(actor);
  });
  function updateEyes(actor, time) {
    let moving = false;
    for (const eye of actor.eyes) {
      if (!eye.base) {
        const white = eye.white.getBBox(), pupil = eye.mover.getBBox();
        eye.base = { x: white.x + white.width / 2, y: white.y + white.height / 2, centerX: white.x + white.width / 2 - pupil.x - pupil.width / 2, centerY: white.y + white.height / 2 - pupil.y - pupil.height / 2 };
      }
      let dx = 0, dy = 0;
      if (pointer && finePointer.matches) {
        const matrix = actor.svg.getScreenCTM(); if (!matrix) continue;
        const p = new DOMPoint(pointer.x, pointer.y).matrixTransform(matrix.inverse()); dx = p.x - eye.base.x; dy = p.y - eye.base.y;
        const magnitude = Math.hypot(dx, dy); if (magnitude) { dx = dx / magnitude * Math.min(10, magnitude * .04); dy = dy / magnitude * Math.min(7, magnitude * .025); }
      }
      if (automaticHover.matches && loader.hidden && !finePointer.matches) { dx = Math.sin(time * .9 + actor.gazePhase) * 5; dy = Math.cos(time * .65 + actor.gazePhase) * 2; }
      if (Math.abs(dx - eye.x) > .05 || Math.abs(dy - eye.y) > .05) moving = true;
      eye.x += (dx - eye.x) * .25; eye.y += (dy - eye.y) * .25;
      eye.mover.setAttribute('transform', `translate(${eye.base.centerX + eye.x},${eye.base.centerY + eye.y})`);
    }
    return moving;
  }
  function requestFrame() { if (!frame && !document.hidden && !motion.matches) frame = requestAnimationFrame(tick); }
  /** Die Fallzeit läuft erst ab einem sichtbaren Frame; blockierte oder versteckte Frames werden nicht übersprungen. */
  function tick(now) {
    frame = 0; if (document.hidden || motion.matches) return;
    let eyesMoving = false;
    if (heroRunning && heroVisible) {
      heroElapsed += heroPreviousFrame ? Math.min(now - heroPreviousFrame, 50) : 0;
      heroPreviousFrame = now;
      for (const layer of heroLayers) if (layer.delay >= 0) {
        const p = Math.max(0, Math.min(1, (heroElapsed - layer.delay) / 900)); layer.offset = dropOffset(p); layer.contact = p >= .55;
        layer.group.style.opacity = p > 0 ? '1' : '0'; layer.group.setAttribute('transform', `translate(0,${layer.offset})`);
      }
      for (let i = 0; i < 3; i++) { const lower = heroLayers[i], above = heroLayers[i + 1]; if (lower.shadow) lower.shadow.style.opacity = above.contact ? String(Math.max(0, 1 - Math.abs(above.offset - lower.offset) / 90)) : '0'; }
      if (heroElapsed >= 2700) finishHero();
    } else heroPreviousFrame = 0;
    for (const actor of actors) if (actor.visible && actor.svg.isConnected) { eyesMoving = updateEyes(actor, now / 1000) || (automaticHover.matches && loader.hidden) || eyesMoving; if (heroVisible && heroLanded && actor.arms.length) updateArms(actor, now / 1000); }
    let founderMoving = false;
    for (const actor of founderActors) if (actor.active) { updateArms(actor, now / 1000); founderMoving = true; }
    const pathMoving = advancePath();
    if ((heroVisible && (heroRunning || heroLanded)) || eyesMoving || founderMoving || pathMoving) requestFrame();
  }
  window.addEventListener('pointermove', event => { if (event.pointerType === 'mouse') { pointer = { x: event.clientX, y: event.clientY }; requestFrame(); } }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => { pointer = null; requestFrame(); });
  visibilityObserver?.observe($('#hero-art')); visibilityObserver?.observe($('.mix-illustration'));
  if (!visibilityObserver) $('.mix-illustration').classList.add('is-in-view');

  let pathArcLength = 0;
  let pathSamples = [];

  /** Der SVG-Verlauf folgt den Section-Höhen; seine Füllung wird an die sichtbare Kurvenposition gekoppelt. */
  function layoutPath() {
    const region = $('#path-region'), svg = $('#scroll-path'), width = region.clientWidth, height = region.offsetHeight;
    const heroEnd = $('#sorten').offsetTop, productsEnd = $('#mix').offsetTop, mixEnd = $('#idee').offsetTop, storyEnd = $('#vote').offsetTop;
    const mobile = width <= 600;
    const d = mobile ? `M${width * .8},0 C${width + 40},${heroEnd * .4} ${width - 10},${heroEnd * .6} ${width - 10},${heroEnd} S8,${heroEnd + 60} 8,${(heroEnd + productsEnd) / 2} S${width - 8},${productsEnd - 100} ${width - 8},${productsEnd + 20} S8,${mixEnd - 50} 8,${mixEnd + 30} S${width - 8},${storyEnd - 60} ${width - 8},${storyEnd + 25}` : `M${width * .55},-30 C${width * .7},${heroEnd * .3} ${width * 1.1},${heroEnd * .4} ${width * .94},${heroEnd * .7} S${width * .1},${heroEnd - 30} ${width * .03},${heroEnd + 120} S${width * .8},${productsEnd - 80} ${width * .97},${productsEnd + 20} S${width * .6},${mixEnd - 70} ${width * .25},${mixEnd + 40} S${width * .05},${storyEnd - 40} ${width * .02},${storyEnd + 20}`;
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    const reveal = $('.path-reveal'); reveal.setAttribute('d', d); reveal.removeAttribute('pathLength');
    const mask = $('#path-reveal-mask'); mask.setAttribute('width', width); mask.setAttribute('height', height);
    const length = reveal.getTotalLength(), points = [], count = Math.max(180, Math.ceil(length / 12));
    pathArcLength = length; pathSamples = [];
    for (let i = 0; i <= count; i++) {
      const distance = length * i / count, center = reveal.getPointAtLength(distance);
      pathSamples.push({ y: center.y, distance });
      const before = reveal.getPointAtLength(Math.max(0, distance - 1)), after = reveal.getPointAtLength(Math.min(length, distance + 1));
      const dx = after.x - before.x, dy = after.y - before.y, magnitude = Math.hypot(dx, dy) || 1;
      const radius = (mobile ? 3.8 : 6) * (1 + .32 * Math.sin(i / count * Math.PI * 12) + .15 * Math.sin(i / count * Math.PI * 29));
      points.push({ left: [center.x - dy / magnitude * radius, center.y + dx / magnitude * radius], right: [center.x + dy / magnitude * radius, center.y - dx / magnitude * radius] });
    }
    const outline = [...points.map(point => point.left), ...points.reverse().map(point => point.right)];
    const ribbon = outline.map((point, i) => `${i ? 'L' : 'M'}${point[0].toFixed(2)},${point[1].toFixed(2)}`).join(' ') + ' Z';
    $$('.path-guide, .path-color').forEach(path => path.setAttribute('d', ribbon)); updatePath();
  }
  /** Ermittelt die Bogenlänge bis zur sichtbaren Höhe statt Seitenhöhe und Kurvenlänge gleichzusetzen. */
  function revealedPathLength(visibleY) {
    if (!pathSamples.length || visibleY <= pathSamples[0].y) return 0;
    for (let i = 1; i < pathSamples.length; i++) {
      const after = pathSamples[i], before = pathSamples[i - 1];
      if (after.y > visibleY) {
        const ratio = Math.max(0, Math.min(1, (visibleY - before.y) / (after.y - before.y || 1)));
        return before.distance + (after.distance - before.distance) * ratio;
      }
    }
    return pathArcLength;
  }
  function updatePath() {
    const region = $('#path-region').getBoundingClientRect();
    const visibleY = innerHeight * .76 - region.top;
    pathTargetLength = motion.matches ? pathArcLength : pathReady ? revealedPathLength(visibleY) : 0;
    if (motion.matches) pathCurrentLength = pathTargetLength;
    pathCurrentLength = Math.min(pathCurrentLength, pathArcLength);
    const path = $('.path-reveal');
    path.style.strokeDasharray = `${pathArcLength} ${pathArcLength}`;
    path.style.strokeDashoffset = String(Math.max(0, pathArcLength - pathCurrentLength));
    if (Math.abs(pathTargetLength - pathCurrentLength) > .1) requestFrame();
  }

  /** Füllt den Pfad nach dem letzten Aufprall weich bis zur aktuellen Scrollposition. */
  function advancePath() {
    const difference = pathTargetLength - pathCurrentLength;
    const moving = Math.abs(difference) > .1;
    pathCurrentLength = moving ? pathCurrentLength + difference * .12 : pathTargetLength;
    $('.path-reveal').style.strokeDashoffset = String(Math.max(0, pathArcLength - pathCurrentLength));
    return moving;
  }
  let scrollFrame = 0;
  window.addEventListener('scroll', () => { if (!scrollFrame) scrollFrame = requestAnimationFrame(() => { scrollFrame = 0; updatePath(); requestFrame(); }); }, { passive: true });
  if ('ResizeObserver' in window) new ResizeObserver(layoutPath).observe($('#path-region')); else window.addEventListener('resize', layoutPath);
  document.fonts?.ready.then(layoutPath);

  function setMenu(open, restore = true) {
    menu.hidden = !open; menuButton.setAttribute('aria-expanded', String(open)); menuButton.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen'); document.body.classList.toggle('menu-open', open); $('main').inert = open; $('footer').inert = open;
    if (open) $('a', menu).focus(); else if (restore) menuButton.focus();
  }
  menuButton.addEventListener('click', () => setMenu(menu.hidden));
  $$('a', menu).forEach(link => link.addEventListener('click', () => { setMenu(false, false); const heading = $('h2', $(link.getAttribute('href'))); heading.setAttribute('tabindex', '-1'); heading.focus({ preventScroll: true }); heading.addEventListener('blur', () => heading.removeAttribute('tabindex'), { once: true }); }));
  document.addEventListener('keydown', event => {
    if (menu.hidden) return;
    if (event.key === 'Escape') { event.preventDefault(); setMenu(false); }
    if (event.key === 'Tab') {
      const nodes = [...$$('button:not(:disabled)', $('.site-header')), ...$$('a', menu)]; const i = nodes.indexOf(document.activeElement);
      if (event.shiftKey && i === 0) { event.preventDefault(); nodes.at(-1).focus(); } else if (!event.shiftKey && i === nodes.length - 1) { event.preventDefault(); nodes[0].focus(); }
    }
  });
  matchMedia('(min-width:801px)').addEventListener('change', event => { if (event.matches && !menu.hidden) setMenu(false, false); });
  const voteNames = { blaubeere: 'Blaubeere', caramel: 'Salted Caramel', schoko: 'Schoko' };
  function displayVote(value) { if (!Object.hasOwn(voteNames, value)) return; $(`input[value="${value}"]`, $('#vote-form')).checked = true; $('#vote-result').textContent = `Deine Stimme: ${voteNames[value]}. Nur in diesem Browser gespeichert; keine echte Umfrage.`; }
  const voteDialog = $('#vote-dialog'); let voteTrigger = null;
  $('#vote-form').addEventListener('submit', event => {
    event.preventDefault(); const checked = $('input:checked', event.currentTarget);
    if (!checked) return;
    writeStorage(voteKey, checked.value); displayVote(checked.value);
    if (voteDialog.showModal && !voteDialog.open) { voteTrigger = $('button[type="submit"]', event.currentTarget); document.body.classList.add('modal-open'); voteDialog.showModal(); $('#close-vote').focus(); }
  });
  ['#close-vote', '#vote-done'].forEach(selector => $(selector).addEventListener('click', () => voteDialog.close()));
  voteDialog.addEventListener('close', () => { document.body.classList.remove('modal-open'); voteTrigger?.focus({ preventScroll: true }); });
  voteDialog.addEventListener('click', event => { if (event.target === voteDialog) { const r = voteDialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) voteDialog.close(); } });
  displayVote(readStorage(voteKey));

  /** Zutaten-Doodles werden als kleine Code-Grafiken hinter den Originalbechern verteilt. */
  const ink = '#3b1811';
  const doodles = {
    berry: `<svg viewBox="0 0 100 120"><path d="M15 48C6 75 35 106 50 114c22-10 45-44 36-66-10-24-62-24-71 0Z" fill="#ff638c" stroke="${ink}" stroke-width="4"/><path d="M50 42 30 18l-2 23-18-3 21 18 20-7 24 7 18-19-22 4-2-24Z" fill="#86b84a" stroke="${ink}" stroke-width="3"/><path d="m29 66-2 7m25-8-2 7m23-5-2 7m-27 11-2 7m17-1-2 7" stroke="${ink}" stroke-width="3" stroke-linecap="round"/></svg>`,
    nut: `<svg viewBox="0 0 110 90"><path d="M9 54C17 17 67 8 96 24c14 36-22 65-48 59S15 68 9 54Z" fill="#e5c28d" stroke="${ink}" stroke-width="4"/><path d="M25 52C38 28 62 23 91 29c-10 23-34 28-66 23Z" fill="#91b849" stroke="${ink}" stroke-width="3"/><path d="M19 63c33 6 52-7 77-30" fill="none" stroke="${ink}" stroke-width="3"/></svg>`,
    flower: `<svg viewBox="0 0 110 110">${Array.from({ length: 5 }, (_, i) => `<ellipse cx="55" cy="28" rx="13" ry="24" transform="rotate(${i * 72} 55 55)" fill="#fff8e7" stroke="${ink}" stroke-width="3"/>`).join('')}<circle cx="55" cy="55" r="13" fill="#fce362" stroke="${ink}" stroke-width="3"/></svg>`,
    pod: `<svg viewBox="0 0 140 100"><path d="M9 87C65 72 97 39 125 10c-6 31-44 68-103 83Z" fill="#986136" stroke="${ink}" stroke-width="4"/></svg>`
  };
  $$('[data-ingredients]').forEach(host => { const keys = host.dataset.ingredients === 'strawlarry' ? ['berry', 'berry', 'berry', 'berry', 'berry'] : host.dataset.ingredients === 'brostacchio' ? ['nut', 'nut', 'nut', 'nut', 'nut'] : ['flower', 'pod', 'pod', 'flower', 'flower']; keys.forEach(key => { const wrapper = element('span', 'ingredient'); wrapper.innerHTML = doodles[key]; host.append(wrapper); }); });

  document.addEventListener('visibilitychange', () => { document.body.classList.toggle('page-hidden', document.hidden); if (document.hidden) { cancelAnimationFrame(frame); frame = 0; heroPreviousFrame = 0; } else requestFrame(); });
  motion.addEventListener('change', () => { if (motion.matches) { cancelAnimationFrame(frame); frame = 0; finishHero(); founderActors.forEach(resetFounderArms); pointer = null; for (const actor of actors) for (const eye of actor.eyes) { if (eye.base) eye.mover.setAttribute('transform', `translate(${eye.base.centerX},${eye.base.centerY})`); } } else requestFrame(); updatePath(); });
  document.body.classList.add('js-ready'); menuButton.hidden = false; $('#year').textContent = new Date().getFullYear();
  $$('[data-add], #add-mix, #vote-form button, #replay-hero').forEach(button => { button.disabled = false; });
  $$('[data-open-cart]').forEach(button => { button.disabled = !cartDialog.showModal; });
  cart = validateCart(readStorage(storageKey)); renderCart(); layoutPath();
  heroLayers.forEach(layer => { if (layer.delay >= 0) layer.group.style.opacity = '0'; if (layer.shadow) layer.shadow.style.opacity = '0'; });

  /** Kurzer Loader wartet auf Fonts und sichtbare Bilder; erst danach beginnt die Fallanimation. */
  async function startExperience() {
    const wait = duration => new Promise(resolve => setTimeout(resolve, duration));
    const assetsReady = Promise.allSettled([document.fonts?.ready, ...$$('img:not([loading="lazy"])').map(img => img.decode?.())]);
    await Promise.all([wait(Math.max(0, 2000 - (performance.now() - loaderStarted))), Promise.race([assetsReady, wait(5000)])]);
    layoutPath(); loader.classList.add('is-leaving');
    await wait(motion.matches ? 0 : 220);
    loader.hidden = true; $('.site-shell').inert = false; document.body.classList.remove('is-loading');
    if (motion.matches) finishHero(); else playHero();
  }
  startExperience();
})();
