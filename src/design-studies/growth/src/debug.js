import { normalizeConfig } from './config.js';
/** Mounts a keyboard accessible editor only when ?debug=1 is present. */
export function mountDebug({ world, config }) {
  if (!new URLSearchParams(location.search).has('debug')) return;
  const panel = document.createElement('aside');
  panel.className = 'growth-debug';
  panel.setAttribute('aria-label', 'Tree authoring tools');
  const details = document.createElement('details');
  details.open = true;
  const summary = document.createElement('summary');
  summary.textContent = 'GROWTH / DEBUG 2.0';
  details.append(summary);
  const content = document.createElement('div');
  content.className = 'growth-debug-content';
  const intro = document.createElement('p');
  intro.textContent = 'Layer an-/ausschalten; Seeds und Parameter für einen reproduzierbaren Neustart exportieren.';
  content.append(intro);
  const controls = document.createElement('div');
  controls.className = 'growth-debug-layers';
  for (const [name, layer] of Object.entries(world.layers)) {
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = true;
    checkbox.addEventListener('change', () => world.setLayerVisible(name, checkbox.checked));
    label.append(checkbox, document.createTextNode(` ${name} (${layer.size})`));
    controls.append(label);
  }
  content.append(controls);
  const textarea = document.createElement('textarea');
  textarea.setAttribute('aria-label', 'Generator-Konfiguration als JSON');
  textarea.spellcheck = false;
  textarea.value = JSON.stringify(config, null, 2);
  content.append(textarea);
  const actions = document.createElement('div');
  actions.className = 'growth-debug-actions';
  function button(label, action) {
    const element = document.createElement('button');
    element.type = 'button';
    element.textContent = label;
    element.addEventListener('click', action);
    actions.append(element);
  }
  const apply = () => {
    try {
      const parsed = JSON.parse(textarea.value);
      const normalized = normalizeConfig(parsed);
      const url = new URL(location.href);
      url.searchParams.set('growth', encodeURIComponent(JSON.stringify(normalized)));
      url.searchParams.set('debug', '1');
      location.assign(url.href);
    } catch (error) { alert(`Ungültiges JSON: ${error.message}`); }
  };
  button('Apply / Reload', apply);
  button('Export JSON', () => {
    const blob = new Blob([textarea.value], { type: 'application/json' });
    const anchor = document.createElement('a');
    anchor.href = URL.createObjectURL(blob);
    anchor.download = 'growth-2-preset.json';
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(anchor.href), 1000);
  });
  button('Copy JSON', () => navigator.clipboard?.writeText(textarea.value));
  content.append(actions);
  details.append(content);
  panel.append(details);
  document.body.append(panel);
}
