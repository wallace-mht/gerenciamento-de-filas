// Carrega config.js e assets/app.js num ambiente simulado (sem navegador) e testa as regras.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const el = () => new Proxy(function () {}, {
  get: (t, k) => { if (k === 'classList') return { toggle() {}, add() {} }; if (k === 'style') return { setProperty() {} };
    if (k === 'dataset') return {}; if (['addEventListener', 'setAttribute', 'showModal', 'close', 'click', 'focus'].includes(k)) return () => {};
    if (k === 'value') return t._v || ''; return t[k]; },
  set: (t, k, v) => { t[k] = v; if (k === 'value') t._v = v; return true; }, apply: () => el() });
function carregar() {
  const els = {}, store = {};
  const ctx = { console, Date, Math, JSON, Object, Array, Number, String, Set, Promise, Intl,
    document: { querySelector: s => els[s] || (els[s] = el()), querySelectorAll: () => [], body: { dataset: {} }, createElement: () => el() },
    localStorage: { getItem: k => store[k] ?? null, setItem: (k, v) => { store[k] = v; } },
    location: { hash: '', protocol: 'file:' }, setInterval() {}, URL: { createObjectURL: () => '', revokeObjectURL() {} }, Blob: function () {}, encodeURIComponent };
  ctx.addEventListener = () => {}; ctx.window = ctx; vm.createContext(ctx);
  vm.runInContext(readFileSync('config.js', 'utf8'), ctx);
  vm.runInContext(readFileSync('assets/app.js', 'utf8'), ctx);
  return { ctx, els, run: c => vm.runInContext(c, ctx) };
}

test('horário livre respeita antecedência, folga, expediente e sobreposição', () => {
  const { run } = carregar();
  run("S.itens=[];S.pausa=false;S.sim=600");
  assert.equal(run("free(dia(),B(0),630,35)"), false, 'menos de 60 min de antecedência');
  assert.equal(run("free(dia(),B(0),660,35)"), true);
  assert.equal(run("free(dia(),B(0),500,35)"), false, 'antes do expediente');
  run("S.itens.push(mk({b:B(0),t:660,dur:50,ex:0}))");
  assert.equal(run("free(dia(),B(0),690,35)"), false, 'sobrepõe o corte de 50 min');
  assert.equal(run("free(dia(),B(0),710,35)"), true);
  run("S.cfg[B(0)].fo=String(new Date(dia(1)+'T12:00').getDay())");
  assert.equal(run("free(dia(1),B(0),600,35)"), false, 'dia de folga');
});

test('janela de 50 min, tolerância de 10 min e retenção do sinal', () => {
  const { run } = carregar();
  run("S.itens=[];S.sim=600;S.itens.push(mk({b:B(0),t:660,ex:0}))");
  assert.equal(run("minAte(S.itens[0])"), 60);
  run("S.sim=668;tick()"); assert.equal(run("S.itens[0].s"), 'aguardando', 'T+8 ainda aguarda');
  run("S.sim=671;tick()"); assert.equal(run("S.itens[0].s"), 'faltou');
  assert.equal(run("S.itens[0].ret"), run("S.itens[0].sinal"), 'retenção de 100% do sinal');
  run("S.itens=[];S.sim=600;S.itens.push(mk({b:B(0),t:660,ex:0,chk:1}));S.sim=700;tick()");
  assert.equal(run("S.itens[0].s"), 'aguardando', 'quem fez check-in não vira não comparecimento');
});

test('sinal reforçado após não comparecimento', () => {
  const { run } = carregar();
  run("S.itens=[mk({nome:'Teste',s:'faltou',ret:800,ex:0})]");
  assert.equal(run("sinalPct('Teste')"), 30);
  assert.equal(run("sinalPct('Outro')"), 20);
});

test('estados da fila nos cenários de teste', () => {
  const { run, els } = carregar();
  const estado = nome => { run(`CEN.find(c=>c[0]==='${nome}')[1]();resetClk();renderAll()`); return els['#anelEstado'].innerHTML.replace(/<[^>]+>/g, ''); };
  assert.equal(estado('Sem fila'), 'Sem fila');
  assert.equal(estado('Fila normal'), 'Fila normal');
  assert.equal(estado('Fila cheia'), 'Fila cheia');
  assert.equal(estado('Pausa ou fechado'), 'Pausa');
  assert.equal(estado('Status desatualizado'), 'Status desatualizado');
  estado('Não comparecimento (T+10)');
  assert.equal(run("S.itens.filter(i=>i.s==='faltou').length"), 1);
});

test('nota de saúde: saudável alta, crítica baixa', () => {
  const { run } = carregar();
  run("CEN.find(c=>c[0]==='Painel saudável')[1]()");
  assert.ok(run("calc().sc") >= 75, 'saudável');
  run("CEN.find(c=>c[0]==='Painel crítico')[1]()");
  assert.ok(run("calc().sc") < 50, 'crítico');
});
