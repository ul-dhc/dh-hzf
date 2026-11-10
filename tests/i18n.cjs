const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
process.chdir(path.resolve(__dirname, '..'));
function load(search, saved, blocked = false) {
  const values = new Map(saved ? [['dh-hzf-language', saved]] : []);
  const ctx = vm.createContext({URLSearchParams, location:{search}, window:{}, document:{documentElement:{}, readyState:'loading', addEventListener(){}}, localStorage:{getItem(k){if(blocked)throw Error();return values.get(k);},setItem(k,v){if(blocked)throw Error();values.set(k,v);}}});
  for (const file of ['assets/translations-en.js','assets/i18n.js']) vm.runInContext(fs.readFileSync(file,'utf8'),ctx);
  return {api:ctx.window.DHI18n, messages:ctx.window.DH_EN, values};
}
const {api, messages} = load('?lang=en');
assert.equal(api.language,'en');
assert.equal(load('', 'en').api.language,'en');
assert.equal(load('?lang=lv','en').api.language,'lv');
assert.equal(load('?lang=invalid','en').api.language,'en');
assert.equal(load('',undefined,true).api.language,'lv');
assert.equal(api.t('14 ieraksti'),'14 records');
assert.equal(api.t('31 ieraksts'),'31 records');
assert.equal(api.t('1 ieraksts'),'1 record');
assert.equal(api.t('NoProjektsX'),'NoProjektsX');
assert.equal(api.t('Apvidvārdu talka: Dialect Word Crowdsourcing'),'Apvidvārdu talka: Dialect Word Crowdsourcing');
assert.equal(api.t('← Sākums'),'← Home');
assert.equal(api.t('Aktīvs projekts'),'Active project');
assert.equal(api.t('Neaktīvs projekts'),'Inactive project');
assert.equal(api.t('https://manaizvele.lu.lv/'),'https://manaizvele.lu.lv/');
assert.equal(load('?lang=lv').api.t('Projekti'),'Projekti');
const data = JSON.parse(fs.readFileSync('HZF_DH_dati.json','utf8'));
for (const record of data.records) {
  for (const field of ['name','description','resourceName','organizerRole','eventKind','studyLevel','audienceScope','lifecycle','linkStatus']) {
    const value = record[field];
    if (!value || value.startsWith('Aktuālā īstenošana')) continue;
    assert(Object.hasOwn(messages,value), `${record.id}: untranslated ${field}: ${value}`);
  }
  for (const value of [...record.depts,...record.kws].filter(Boolean)) assert(Object.hasOwn(messages,value), `Missing unit or topic: ${value}`);
}
assert(api.searchText(data.records.find(r=>r.id==='A10').description).includes('handwriting'));
for (const file of fs.readdirSync('.').filter(n=>n.endsWith('.html'))) {
  const html=fs.readFileSync(file,'utf8');
  assert.equal((html.match(/class="language-switch"/g)||[]).length,1,file);
  assert(html.includes('assets/i18n.js'),file);
  for (const match of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)) new vm.Script(match[1]);
}
console.log('All 106 record titles, descriptions, units, topics and public metadata translated. Language precedence, storage fallback, bilingual search, composed labels and inline scripts verified.');

// A translated brand name still contains its Latvian name. Repeated observer
// notifications must not append the English explanation indefinitely.
let start, observer;
const root={nodeType:1,matches(){return false;},closest(){return null;},hasAttribute(){return false;},querySelectorAll(){return [];}};
const dom=vm.createContext({URLSearchParams,window:{},location:{search:'?lang=en'},Node:{TEXT_NODE:3,ELEMENT_NODE:1},NodeFilter:{SHOW_ELEMENT:1,SHOW_TEXT:4},document:{documentElement:root,readyState:'loading',addEventListener(type,fn){start=fn;},querySelectorAll(){return [];},createTreeWalker(){return {nextNode(){return false;}};}},MutationObserver:class{constructor(fn){observer=fn;}observe(){}},localStorage:{getItem(){},setItem(){}}});
for(const file of ['assets/translations-en.js','assets/i18n.js'])vm.runInContext(fs.readFileSync(file,'utf8'),dom);
start();
const text={nodeType:3,nodeValue:'Apvidvārdu talka',parentElement:root};
for(let i=0;i<20;i++)observer([{type:'characterData',target:text}]);
assert.equal(text.nodeValue,'Apvidvārdu talka: Dialect Word Crowdsourcing');
text.nodeValue='Vietvārdu talka';
for(let i=0;i<20;i++)observer([{type:'characterData',target:text}]);
assert.equal(text.nodeValue,'Vietvārdu talka: Place-Name Crowdsourcing');
console.log('Repeated DOM updates preserve translated brand names without retriggering translation.');
