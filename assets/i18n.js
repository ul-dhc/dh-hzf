/* Shared display localisation. Record IDs, source data and filter values stay unchanged. */
(() => {
  const messages = window.DH_EN || {};
  const requested = new URLSearchParams(location.search).get('lang');
  let saved;
  try { saved = localStorage.getItem('dh-hzf-language'); } catch {}
  const language = ['lv', 'en'].includes(requested) ? requested : saved === 'en' ? 'en' : 'lv';
  try { localStorage.setItem('dh-hzf-language', language); } catch {}
  document.documentElement.lang = language;
  const englishValues = new Set(Object.values(messages));
  const escape = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // One pass, longest phrase first: translated output is never translated again.
  const pattern = Object.keys(messages).length ? new RegExp('(?<![\\p{L}])(?:' + Object.keys(messages).sort((a,b) => b.length-a.length).map(escape).join('|') + ')(?![\\p{L}])', 'gu') : null;
  function english(value) {
    const text = String(value ?? '');
    if (Object.hasOwn(messages, text)) return messages[text];
    if (englishValues.has(text)) return text;
    const translated = pattern ? text.replace(pattern, match => messages[match]) : text;
    return translated.replace(/\b(\d+) record\b/g, (_, count) => count + (Number(count) === 1 ? ' record' : ' records'));
  }
  function t(value) { return language === 'en' ? english(value) : String(value ?? ''); }
  window.DHI18n = {
    language, t,
    searchText: value => (String(value ?? '') + ' ' + english(value)).toLocaleLowerCase(language),
    compare: (a,b) => t(a).localeCompare(t(b), language)
  };
  const attributes = ['title', 'aria-label', 'placeholder', 'alt'];
  const translatedText = new WeakMap(), translatedAttributes = new WeakMap();
  const excluded = node => node.parentElement?.closest('script,style,.language-switch,[data-no-translate]');
  function translateText(node) {
    if (language !== 'en' || excluded(node)) return;
    const original = node.nodeValue;
    if (!original?.trim() || translatedText.get(node) === original) return;
    const translated = t(original);
    translatedText.set(node, translated);
    if (original !== translated) node.nodeValue = translated;
  }
  function prepareLink(link) {
    if (link.closest('.language-switch')) return;
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#')) return;
    let url;
    try { url = new URL(href, document.baseURI); } catch { return; }
    const directory = new URL('.', document.baseURI).pathname;
    if (url.origin !== location.origin || !url.pathname.startsWith(directory) || !/\/(?:[^/]+\.html)?$/.test(url.pathname)) return;
    url.searchParams.set('lang', language);
    const relative = url.pathname.slice(directory.length) + url.search + url.hash;
    if (href !== relative) link.setAttribute('href', relative);
  }
  function prepareElement(element) {
    if (element.closest('script,style,.language-switch,[data-no-translate]')) return;
    if (language === 'en' && element.hasAttribute('data-logo-en')) {
      const attr = element.localName === 'image' ? 'href' : 'src';
      const source = element.getAttribute('data-logo-en');
      if (element.getAttribute(attr) !== source) element.setAttribute(attr, source);
    }
    if (language === 'en') for (const attr of attributes) {
      if (!element.hasAttribute(attr)) continue;
      const original = element.getAttribute(attr);
      const previous = translatedAttributes.get(element) || {};
      if (previous[attr] === original) continue;
      const translated = t(original);
      previous[attr] = translated; translatedAttributes.set(element, previous);
      if (translated !== original) element.setAttribute(attr, translated);
    }
    if (element.matches('a[href]')) prepareLink(element);
  }
  function prepareTree(node) {
    if (node.nodeType === Node.TEXT_NODE) return translateText(node);
    if (node.nodeType !== Node.ELEMENT_NODE || node.matches('script,style')) return;
    prepareElement(node);
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      if (walker.currentNode.nodeType === Node.TEXT_NODE) translateText(walker.currentNode);
      else prepareElement(walker.currentNode);
    }
  }
  function refreshLanguageLinks() {
    document.querySelectorAll('.language-switch [data-language]').forEach(link => {
      const url = new URL(location.href);
      url.searchParams.set('lang', link.dataset.language);
      if (link.href !== url.href) link.href = url.href;
    });
  }
  function start() {
    document.querySelectorAll('.language-switch').forEach(control => {
      control.setAttribute('aria-label', language === 'en' ? 'Language' : 'Valoda');
      control.querySelectorAll('[data-language]').forEach(link => {
        const chosen = link.dataset.language;
        link.lang = chosen;
        link.setAttribute('aria-label', chosen === 'en' ? 'English' : 'Latviešu');
        if (chosen === language) link.setAttribute('aria-current', 'true');
        const url = new URL(location.href); url.searchParams.set('lang', chosen); link.href = url.href;
        link.addEventListener('click', event => {
          event.preventDefault();
          try { localStorage.setItem('dh-hzf-language', chosen); } catch {}
          const next = new URL(location.href); next.searchParams.set('lang', chosen); location.assign(next.href);
        });
      });
    });
    prepareTree(document.documentElement);
    new MutationObserver(records => {
      for (const record of records) {
        if (record.type === 'characterData') translateText(record.target);
        else if (record.type === 'attributes') prepareElement(record.target);
        else record.addedNodes.forEach(prepareTree);
      }
      refreshLanguageLinks();
    }).observe(document.documentElement, {subtree:true, childList:true, characterData:true, attributes:true, attributeFilter:[...attributes,'href']});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once:true});
  else start();
})();
