(() => {
  const siteDirectory = new URL('.', document.baseURI).pathname;
  function prepareLink(link) {
    const href = link.getAttribute('href');
    if (!href) return;
    let url;
    try { url = new URL(href, document.baseURI); } catch { return; }
    if (!['http:', 'https:'].includes(url.protocol)) return;
    const external = url.origin !== location.origin || !url.pathname.startsWith(siteDirectory);
    if (!external) return;
    link.target = '_blank';
    const rel = new Set((link.getAttribute('rel') || '').split(/\s+/).filter(Boolean));
    rel.add('noopener');
    rel.add('noreferrer');
    link.setAttribute('rel', [...rel].join(' '));
  }
  function prepareTree(node) {
    if (!(node instanceof Element)) return;
    if (node.matches('a[href]')) prepareLink(node);
    node.querySelectorAll('a[href]').forEach(prepareLink);
  }
  prepareTree(document.documentElement);
  new MutationObserver(records => {
    for (const record of records) {
      if (record.type === 'attributes') prepareLink(record.target);
      else record.addedNodes.forEach(prepareTree);
    }
  }).observe(document.documentElement, {
    subtree: true, childList: true, attributes: true, attributeFilter: ['href']
  });
})();
