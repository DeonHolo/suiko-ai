import { JSDOM } from 'jsdom';

process.env.TZ = 'Asia/Singapore';
const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'https://suiko.test/x_2236136_suiko_ai_review.do',
});
for (const name of ['window', 'document', 'navigator', 'HTMLElement', 'HTMLDialogElement', 'Event', 'PopStateEvent', 'MutationObserver']) {
  Object.defineProperty(globalThis, name, { value: dom.window[name], configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
window.scrollTo = () => {};
window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
// jsdom has no modal top layer. Real focus and Escape behavior require a browser check.
HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); };
