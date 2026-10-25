/** Bindet native Touchflächen an denselben Controller wie direkte Modellberührungen. */
export class NativeButtons {
  /** Nutzt einen gemeinsamen Pointerzustand für Canvas und HTML. @param {object} app Anwendung. @param {object} controls Modellcontroller. */
  constructor(app,controls) {
    this.app=app; this.controls=controls;
    for (const node of document.querySelectorAll('[data-model-action],[data-model-direction]')) this.bind(node);
  }
  /** Erhält Pointer-Capture, Mehrfingerbedienung und eine Tastaturalternative. @param {HTMLButtonElement} node Touchfläche. */
  bind(node) {
    node.addEventListener('pointerdown',this.start.bind(this));
    node.addEventListener('pointermove',this.controls.move.bind(this.controls));
    node.addEventListener('pointerup',this.controls.end.bind(this.controls));
    node.addEventListener('pointercancel',this.controls.cancel.bind(this.controls));
    node.addEventListener('lostpointercapture',this.controls.cancel.bind(this.controls));
    node.addEventListener('click',this.click.bind(this));
  }
  /** Übergibt die bekannte Taste ohne Raycast-Abhängigkeit. @param {PointerEvent} event Berührung. */
  start(event) {
    if (event.button>0) return;
    const data=event.currentTarget.dataset;
    this.controls.start(event,data.modelAction || 'dpad',data.modelDirection);
  }
  /** Löst nur assistive oder tastaturgenerierte Klicks zusätzlich aus. @param {MouseEvent} event Klick. */
  click(event) {
    if (event.detail || this.app.helpOpen || this.app.cartridge.open) return;
    const data=event.currentTarget.dataset;
    if (data.modelDirection) this.app.input.direction(data.modelDirection);
    else this.app.input.action(data.modelAction);
  }
}
