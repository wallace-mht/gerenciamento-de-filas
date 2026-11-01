const CFG=window.NAVALHA_CONFIG,BARB=CFG.barbeiros,CORTES=CFG.cortes,B=i=>BARB[i%BARB.length].id;
const NOMES=['Bruno','Lucas','Mateus','Pedro','Igor','André','Thiago','Felipe','Renan','Davi','Gustavo','Samuel','Otávio','Leandro','Vitor','Heitor','Caio B.','Marcos','Rafa','Joel','Enzo','Murilo','Paulo','Hugo','Diogo','Nando','Teo','Ícaro','Léo','Dudu','Ivan','Raul','Bento','Cauã','Ênio','Fábio','Gil','Jonas','Kaio','Lauro'];
const ST={aguardando:'Aguardando',concluido:'Concluído',faltou:'Não compareceu',cancelado:'Cancelado',tardio:'Cancelado tarde'},ATIVO=['aguardando','concluido','faltou'];
const hh=m=>String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');
const dia=(o=0)=>{const t=new Date();t.setDate(t.getDate()+o);return t.toLocaleDateString('sv')};
const $=s=>document.querySelector(s),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const brl=c=>(c/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'}),pct=x=>Math.round(x*100)+'%';
const K='navalha.proto.v2',DEF=()=>({itens:[],nome:'',meta:1200000,plano:'base',vis:'cliente',sim:null,pausa:false,upd:null,pc:Object.assign({sinal:20,noshow:100,remarc:50},CFG.regras),cfg:Object.fromEntries(BARB.map(b=>[b.id,{i:b.i,f:b.f,fo:b.fo}]))});
let S=DEF();try{S=Object.assign(DEF(),JSON.parse(localStorage.getItem(K)||'{}'))}catch(e){}
const save=()=>{try{localStorage.setItem(K,JSON.stringify(S))}catch(e){msg='Não foi possível salvar neste navegador.'}};
const corte=id=>CORTES.find(c=>c.id===id)||CORTES[0],hoje=()=>S.itens.filter(i=>i.d===dia());
const nowMin=()=>{if(S.sim!=null)return S.sim;const d=new Date();return d.getHours()*60+d.getMinutes()};
let msg='',zapItem=null,sel={d:dia(),b:B(0),c:CORTES[0].id},clk={},pend=null,remarc=null,uid=0;
const novoId=()=>Date.now().toString(36)+(uid++);

/* regras (funções puras com now) */
function free(d,b,t,dur,ign){const c=S.cfg[b];if(String(new Date(d+'T12:00').getDay())===c.fo)return false;if(t<c.i||t+dur>c.f)return false;
 if(d===dia()&&(S.pausa||t<nowMin()+60))return false;
 return !S.itens.some(i=>i.b===b&&i.d===d&&i.id!==ign&&ATIVO.includes(i.s)&&t<i.t+i.dur&&i.t<t+dur)}
const horaLivre=(d,b,h,dur)=>[0,10,20,30,40,50].some(m=>free(d,b,h*60+m,dur));
const minAte=i=>Math.round((new Date(i.d+'T12:00')-new Date(dia()+'T12:00'))/86400000)*1440+i.t-nowMin();
const sinalPct=nome=>S.itens.some(i=>i.nome.toLowerCase()===nome.toLowerCase()&&i.s==='faltou'&&i.ret>0)?30:S.pc.sinal;
const espera=b=>{const n=nowMin();return Math.round(hoje().filter(i=>i.b===b&&i.s==='aguardando').reduce((a,i)=>a+Math.max(0,Math.min(i.t+i.dur,n+60)-Math.max(i.t,n)),0))};
const velho=()=>S.upd&&Date.now()-S.upd>7200000,toca=()=>{S.upd=Date.now()};
function tick(){let ch=false;const n=nowMin(),h=dia();S.itens.forEach(i=>{if(i.s==='aguardando'&&!i.chk&&!i.perd&&(i.d<h||(i.d===h&&n>=i.t+10))){i.s='faltou';i.ret=Math.round(i.sinal*S.pc.noshow/100);i.auto=1;ch=true}});if(ch)save()}
function mk(o){const c=corte(o.c||'social'),nome=o.nome||'Cliente',p=o.pct||20;return Object.assign({id:novoId(),d:dia(),dur:c.m,s:'aguardando',v:c.p,pct:p,sinal:Math.round(c.p*p/100),ret:0,chk:0,ex:1,nome},o,{c:c.id})}

/* anel e fila */
function renderAnel(){const w=BARB.map(b=>espera(b.id)),min=Math.min(...w);let est,ic,show=true;
 if(S.pausa){est='Pausa';ic='pausa';show=false}else if(velho()){est='Status desatualizado';ic='relogio';show=false}else if(min===0){est='Sem fila';ic='vazio'}else if(min<=30){est='Fila normal';ic='meio'}else{est='Fila cheia';ic='cheio'}
 $('#anelMin').textContent=show?min:'--';$('#anelUn').style.display=show?'':'none';const a=$('#arco');a.classList.toggle('vel',!show);a.style.strokeDashoffset=show?565*(1-Math.min(min/60,1)):0;
 $('#anelEstado').innerHTML=`<svg class="i"><use href="#${ic}"/></svg>${est}`;
 $('#anelAtu').textContent=S.upd?`Atualizado há ${Math.max(0,Math.round((Date.now()-S.upd)/60000))} min`:'Menor espera entre os barbeiros';
 $('#anel').setAttribute('aria-label',`${est}${show?`, menor espera de ${min} minutos`:''}.`);
 $('#minis').innerHTML=BARB.map((b,i)=>`<div class="mini"><b>${show?w[i]:'--'}</b><span>${b.n}</span></div>`).join('')}
function linha(i){const bar=S.vis==='barbeiro',n=nowMin(),b=BARB.find(x=>x.id===i.b).n;const al=i.s==='aguardando'&&!i.chk&&n>=i.t+5&&n<i.t+10;
 let ac='';if(bar){if(i.s==='aguardando')ac+=`<button class="btn sec peq" data-a="ok" data-id="${i.id}" type="button">Concluir</button><button class="btn sec peq" data-a="falta" data-id="${i.id}" type="button">Não compareceu</button><button class="btn sec peq" data-a="atraso" data-id="${i.id}" type="button">Atrasei mais de 15 min</button>`;
  if(i.s==='faltou'&&i.auto)ac+=`<button class="btn sec peq" data-a="perd" data-id="${i.id}" type="button">Perdoar e atender</button>`;
  if(i.ret>0)ac+=`<button class="btn sec peq" data-a="disp" data-id="${i.id}" type="button">Dispensar retenção</button>`;ac+=`<button class="btn sec peq" data-a="del" data-id="${i.id}" type="button" aria-label="Remover ${esc(i.nome)}">Remover</button>`}
 return `<li class="${i.s==='aguardando'?'':'inat'}"><span class="hora">${hh(i.t)}</span><span><b>${esc(i.nome.split(' ')[0])}</b> com ${b}<br><span class="apoio">${corte(i.c).n} · ${i.dur} min</span><br><span class="tag ${i.s==='concluido'?'ok':''}">${ST[i.s]}</span>${i.chk?'<span class="tag ok">Chegou</span>':''}${al?'<span class="tag al">Sem check-in: alerta</span>':''}${i.nota?`<span class="tag">${i.nota}</span>`:''}${bar?`<span class="tag">Sinal ${brl(i.sinal)}${i.ret?' · retido '+brl(i.ret):''}</span>`:''}</span><span class="acoes">${ac}</span></li>`}
function renderFila(){const bar=S.vis==='barbeiro';const l=hoje().filter(i=>bar||!['cancelado','tardio'].includes(i.s)).sort((a,b)=>a.t-b.t);
 const p=l.find(i=>i.s==='aguardando');$('#fila').innerHTML=l.length?l.map(i=>linha(i).replace('<li class="','<li class="'+(i===p?'prox ':''))).join(''):`<li class="vazio" style="display:grid"><svg class="i"><use href="#tesoura"/></svg>Ninguém na fila hoje. Marque um horário no relógio.</li>`;
 $('#bPausa').textContent=S.pausa?'Retomar fila':'Pausar fila'}
function renderMeus(){const el=$('#meus'),n=(S.nome||'').toLowerCase();const l=n?S.itens.filter(i=>i.nome.toLowerCase()===n&&i.s==='aguardando'&&i.d>=dia()).sort((a,b)=>(a.d+hh(a.t)).localeCompare(b.d+hh(b.t))):[];
 el.innerHTML=l.length?`<h3 class="s">Meus horários</h3><ul class="fila">${l.map(i=>{const m=minAte(i);return `<li><span class="hora">${hh(i.t)}</span><span><b>${i.d===dia()?'Hoje':new Date(i.d+'T12:00').toLocaleDateString('pt-BR',{weekday:'short',day:'2-digit',month:'2-digit'})}</b> com ${BARB.find(x=>x.id===i.b).n}<br><span class="apoio">${corte(i.c).n} · sinal ${brl(i.sinal)} (simulado)</span><br><span class="tag ${m>=50?'ok':'al'}">${m>=50?'Cancelamento com crédito total até '+hh(Math.max(0,i.t-50)):'Janela de crédito encerrada: o sinal fica retido'}</span></span><span class="acoes"><button class="btn peq" data-m="chk" data-id="${i.id}" type="button" ${m<=15&&m>-10&&!i.chk?'':'disabled'}>${i.chk?'Chegada registrada':'Cheguei'}</button><button class="btn sec peq" data-m="re" data-id="${i.id}" type="button">Remarcar</button><button class="btn sec peq" data-m="can" data-id="${i.id}" type="button">Cancelar</button></span></li>`}).join('')}</ul>`:'';}

/* relógio */
function resetClk(){const dur=corte(sel.c).m;const am=[...Array(12).keys()].some(h=>horaLivre(sel.d,sel.b,h,dur));clk={stage:'h',ap:am?'am':'pm',h:null,t:null}}
function renderRel(){const dur=corte(sel.c).m,st=clk.stage,pos=[];let any=false;
 if(st==='h'){for(let p=1;p<=12;p++){const h=clk.ap==='am'?p%12:p%12+12,ok=horaLivre(sel.d,sel.b,h,dur);any=any||ok;pos.push({v:h,l:p,a:p*30,ok,on:clk.h===h})}}
 else{for(let m=0;m<60;m+=10){const t=clk.h*60+m,ok=free(sel.d,sel.b,t,dur);pos.push({v:t,l:String(m).padStart(2,'0'),a:m*6,ok,on:clk.t===t})}}
 const ang=st==='h'?(clk.h!=null?(clk.h%12)*30:null):(clk.t!=null?(clk.t%60)*6:null),R=108;
 const semHoras=!pos.some(p=>p.ok)&&st==='h';
 $('#rel').innerHTML=`<div class="digital" role="group" aria-label="Horário escolhido"><button type="button" data-st="h" class="${st==='h'?'on':''}">${clk.h==null?'--':String(clk.h).padStart(2,'0')}</button>:<button type="button" data-st="m" class="${st==='m'?'on':''}" ${clk.h==null?'disabled':''}>${clk.t==null?'--':String(clk.t%60).padStart(2,'0')}</button></div>
 <div class="seg" role="radiogroup" aria-label="Período" ${st==='m'?'hidden':''}><label><input type="radio" name="ap" value="am" ${clk.ap==='am'?'checked':''}><span>Manhã</span></label><label><input type="radio" name="ap" value="pm" ${clk.ap==='pm'?'checked':''}><span>Tarde</span></label></div>
 <div class="mostrador" role="group" aria-label="${st==='h'?'Escolha a hora':'Escolha os minutos'}">${ang!=null?`<div class="mao" style="transform:rotate(${ang}deg)"></div>`:''}${pos.map(p=>`<button type="button" class="num ${p.on?'on':''}" data-v="${p.v}" style="left:${140+R*Math.sin(p.a*Math.PI/180)}px;top:${140-R*Math.cos(p.a*Math.PI/180)}px" ${p.ok?'':'disabled'} aria-label="${st==='h'?p.l+' horas':'minuto '+p.l}${p.ok?'':', indisponível'}">${p.l}</button>`).join('')}</div>
 <p class="apoio" style="margin:0;text-align:center">${semHoras?'Sem horários livres neste período. Veja outro período, dia ou barbeiro.':st==='h'?'Toque na hora. Horas apagadas estão ocupadas, fora do expediente ou muito próximas (mínimo de 60 min).':'Toque nos minutos. O corte dura '+dur+' min.'}</p>
 <button class="btn" id="rBook" type="button" ${clk.t==null?'disabled':''}>${remarc?'Remarcar':'Reservar'}${clk.t!=null?' '+hh(clk.t):''}</button>${remarc?'<button class="btn sec peq" id="rCanc" type="button">Cancelar remarcação</button>':''}`;
}
$('#rel').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.st){clk.stage=b.dataset.st;if(b.dataset.st==='h'){clk.t=null}renderRel();return}
 if(b.classList.contains('num')){const v=+b.dataset.v;if(clk.stage==='h'){clk.h=v;clk.t=null;clk.stage='m'}else clk.t=v;renderRel();return}
 if(b.id==='rBook')abrirReserva();if(b.id==='rCanc'){remarc=null;msg='Remarcação cancelada.';resetClk();renderAll()}});
$('#rel').addEventListener('change',e=>{if(e.target.name==='ap'){clk.ap=e.target.value;clk.h=null;clk.t=null;renderRel()}});
function renderCtl(){const d=[...Array(7).keys()].map(o=>dia(o));$('#sDia').innerHTML=d.map((x,i)=>`<option value="${x}" ${x===sel.d?'selected':''}>${i?new Date(x+'T12:00').toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'2-digit'}):'Hoje'}</option>`).join('');
 $('#sCorte').innerHTML=CORTES.map(c=>`<option value="${c.id}" ${c.id===sel.c?'selected':''}>${c.n} (${c.m} min)</option>`).join('');
 $('#sBarb').innerHTML=BARB.map(b=>`<label><input type="radio" name="sb" value="${b.id}" ${b.id===sel.b?'checked':''}><span>${b.n}</span></label>`).join('');
 $('#agInfo').textContent=msg||(remarc?'Escolha o novo horário no relógio.':'Escolha dia, corte e barbeiro, depois toque no relógio.');msg=''}
['sDia','sCorte'].forEach(id=>$('#'+id).addEventListener('change',e=>{sel[id==='sDia'?'d':'c']=e.target.value;resetClk();renderRel()}));
$('#sBarb').addEventListener('change',e=>{sel.b=e.target.value;resetClk();renderRel()});

/* reserva, remarcação e cancelamento */
function abrirReserva(){if(clk.t==null)return;const c=corte(sel.c),b=BARB.find(x=>x.id===sel.b).n;pend={d:sel.d,b:sel.b,t:clk.t,c:c.id};
 const it=remarc&&S.itens.find(i=>i.id===remarc),nome=it?it.nome:(S.nome||''),p=it?it.pct:sinalPct(nome||'x');
 $('#a-titulo').textContent=`${it?'Remarcar para ':''}${hh(clk.t)} com ${b}`;$('#aNomeW').hidden=!!it;$('#aNome').value=nome;$('#aNome').required=!it;
 let fee=0;if(it&&minAte(it)<50)fee=Math.round(it.sinal*S.pc.remarc/100);
 $('#aResumo').textContent=it?`${corte(it.c).n}. ${fee?`Taxa de remarcação tardia: ${brl(fee)} do sinal ficam retidos.`:'Sem taxa: dentro da janela de crédito total.'}`:`${c.n}, ${c.m} min. Sinal de ${p}%: ${brl(Math.round(c.p*p/100))} (simulado, abatido do preço de ${brl(c.p)}).${p>S.pc.sinal?' Sinal reforçado após um não comparecimento anterior.':''}`;
 $('#aRegra').textContent='Regras: cancelamento e remarcação até 50 min antes devolvem o sinal. Depois disso, parte ou todo o sinal fica retido. Tolerância de 10 min de atraso; sem chegada registrada, o horário é liberado.';
 $('#dAg').showModal()}
$('#fAg').addEventListener('submit',e=>{e.preventDefault();if(!pend)return;const it=remarc&&S.itens.find(i=>i.id===remarc),dur=corte(pend.c).m;
 if(!free(pend.d,pend.b,pend.t,dur,it&&it.id)){msg='Esse horário acabou de ficar indisponível.';$('#dAg').close();resetClk();return renderAll()}
 if(it){const fee=minAte(it)<50?Math.round(it.sinal*S.pc.remarc/100):0;Object.assign(it,{d:pend.d,b:pend.b,t:pend.t,dur,ret:(it.ret||0)+fee,chk:0,auto:0,perd:0,c:pend.c,nota:'Remarcado'});msg=`Remarcado para ${hh(pend.t)}.${fee?' Taxa retida: '+brl(fee)+'.':''}`;remarc=null}
 else{const nome=$('#aNome').value.trim();if(!nome)return;S.nome=nome;const novo=mk({d:pend.d,b:pend.b,t:pend.t,c:pend.c,nome,pct:sinalPct(nome),ex:0});S.itens.push(novo);if(S.vis==='cliente')zapItem=novo;msg=`Horário das ${hh(pend.t)} reservado para ${nome.split(' ')[0]}. Sinal simulado.`}
 toca();save();$('#dAg').close();pend=null;resetClk();renderAll();if(zapItem){abrirZap(zapItem);zapItem=null}});
$('#aFecha').onclick=()=>$('#dAg').close();
function confirmar(titulo,txt,fn){$('#c-titulo').textContent=titulo;$('#cTxt').textContent=txt;$('#cOk').onclick=()=>{$('#dConf').close();fn()};$('#dConf').showModal()}
$('#cNo').onclick=()=>$('#dConf').close();
$('#meus').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const i=S.itens.find(x=>x.id===b.dataset.id);if(!i)return;
 if(b.dataset.m==='chk'){i.chk=1;toca();save();msg='Chegada registrada. O barbeiro foi avisado (simulado).';renderAll()}
 if(b.dataset.m==='re'){remarc=i.id;sel={d:i.d,b:i.b,c:i.c};resetClk();msg='Escolha o novo horário no relógio.';renderAll();location.hash='agenda'}
 if(b.dataset.m==='can'){const tarde=minAte(i)<50;confirmar('Cancelar horário',tarde?`Faltam menos de 50 min. O sinal de ${brl(i.sinal)} fica retido (${S.pc.noshow}%), a critério do barbeiro.`:`Dentro da janela: o sinal de ${brl(i.sinal)} volta como crédito total.`,()=>{i.s=tarde?'tardio':'cancelado';i.ret=tarde?Math.round(i.sinal*S.pc.noshow/100):0;toca();save();msg='Horário cancelado.';resetClk();renderAll()})}});
$('#fila').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const i=S.itens.find(x=>x.id===b.dataset.id);if(!i)return;const a=b.dataset.a;
 if(a==='ok')i.s='concluido';if(a==='falta'){i.s='faltou';i.ret=Math.round(i.sinal*S.pc.noshow/100)}if(a==='atraso'){i.s='cancelado';i.ret=0;i.nota='Reembolso integral por atraso do barbeiro'}
 if(a==='perd'){i.s='aguardando';i.chk=1;i.perd=1;i.ret=0;i.auto=0;i.nota='Perdoado, atendido como encaixe'}if(a==='disp'){i.ret=0;i.nota='Retenção dispensada'}if(a==='del')S.itens=S.itens.filter(x=>x!==i);
 toca();save();resetClk();renderAll()});
$('#bPausa').onclick=()=>{S.pausa=!S.pausa;toca();save();resetClk();renderAll()};$('#bAtu').onclick=()=>{toca();save();msg='Fila marcada como atualizada.';renderAll()};

/* cortes */
const g=$('#grade'),m=$('#modal');let ult;
function renderCortes(f){const l=CORTES.filter(c=>f==='todos'||c.e===f);g.innerHTML=l.map(c=>`<button class="corte" data-id="${c.id}" type="button"><div class="foto" style="--c1:${c.c[0]};--c2:${c.c[1]}"><svg class="i"><use href="#tesoura"/></svg>foto</div><h3>${c.n}</h3><p>${c.m} min · ${c.e}</p></button>`).join('');$('#contagem').textContent=l.length+(l.length===1?' estilo encontrado':' estilos encontrados')}
document.querySelectorAll('input[name=f]').forEach(r=>r.addEventListener('change',e=>renderCortes(e.target.value)));
g.addEventListener('click',e=>{const b=e.target.closest('.corte');if(!b)return;ult=b;const c=corte(b.dataset.id);sel.c=c.id;$('#m-titulo').textContent=c.n;$('#m-desc').textContent=`${c.m} min. Estilo ${c.e}.`;m.showModal()});
$('#mFecha').onclick=()=>m.close();m.addEventListener('close',()=>ult&&ult.focus());
$('#mAg').onclick=()=>{m.close();resetClk();renderAll();location.hash='agenda'};
$('#slide').addEventListener('input',e=>$('#depois').style.setProperty('--p',e.target.value+'%'));

/* painel premium (valores em centavos) */
function calc(){const j=dia(-6),h=dia(),v=S.itens.filter(i=>i.d>=j&&i.d<=h&&i.s!=='cancelado');const f=v.filter(i=>i.s==='concluido'),fl=v.filter(i=>i.s==='faltou');
 const dias=[...new Set(v.map(i=>i.d))],fat=f.reduce((a,i)=>a+i.v,0),ret=v.reduce((a,i)=>a+(i.ret||0),0);
 const disp=dias.reduce((a,d)=>a+BARB.reduce((s,b)=>{const c=S.cfg[b.id];return s+(String(new Date(d+'T12:00').getDay())===c.fo?0:c.f-c.i)},0),0);
 const ocup=disp?v.filter(i=>ATIVO.includes(i.s)).reduce((a,i)=>a+i.dur,0)/disp:0,falta=(f.length+fl.length)?fl.length/(f.length+fl.length):0;
 const cont={};f.forEach(i=>{const k=i.nome.toLowerCase();cont[k]=(cont[k]||0)+1});const un=Object.keys(cont).length,rt=un?Object.values(cont).filter(n=>n>1).length/un:0;
 const dd=new Set(f.map(i=>i.d)).size,proj=dd?fat/dd*26:0;
 const sc=Math.round(30*Math.min(ocup/.75,1)+25*Math.min(rt/.5,1)+20*(1-Math.min(falta/.15,1))+25*Math.min(proj/S.meta,1));return{v,f,fat,ret,ocup,falta,rt,proj,sc,tk:f.length?fat/f.length:0}}
function renderPainel(){const c=calc(),el=$('#pnConteudo');
 if(!c.v.length){el.innerHTML=`<div class="vazio"><svg class="i"><use href="#espuma"/></svg>Sem dados ainda. Use os cenários "Painel saudável" ou "Painel crítico" no modo de teste.</div>`;return}
 const nv=c.sc>=75?'Saudável':c.sc>=50?'Atenção':'Crítico',ic=c.sc>=75?'cheio':c.sc>=50?'meio':'vazio';
 const porB=BARB.map(b=>({n:b.n,r:c.f.filter(i=>i.b===b.id).reduce((a,i)=>a+i.v,0)})),mx=Math.max(1,...porB.map(x=>x.r));
 const pc={};c.f.forEach(i=>pc[i.c]=(pc[i.c]||0)+1);const top=Object.entries(pc).sort((a,b)=>b[1]-a[1])[0];
 const hs={};c.v.forEach(i=>{const h=Math.floor(i.t/60);hs[h]=(hs[h]||0)+1});const mh=Math.max(1,...Object.values(hs));
 const cp=[['Ocupação',c.ocup/.75,pct(c.ocup)],['Retorno',c.rt/.5,pct(c.rt)],['Presença',1-c.falta/.15,pct(1-c.falta)],['Meta',c.proj/S.meta,pct(c.proj/S.meta)]];
 el.innerHTML=`<div class="saude"><div class="anel" role="img" aria-label="Saúde do negócio: ${c.sc} de 100, ${nv}"><svg class="r" viewBox="0 0 200 200" aria-hidden="true"><circle class="trilho" cx="100" cy="100" r="90"/><circle class="arco" style="stroke-dashoffset:${565*(1-c.sc/100)}" cx="100" cy="100" r="90"/></svg><div class="centro"><div class="min">${c.sc}</div><div class="estado"><svg class="i"><use href="#${ic}"/></svg>${nv}</div></div></div>
 <div><h3 class="s">Nota de saúde do negócio</h3>${cp.map(x=>`<div class="barra"><span>${x[0]}</span><i style="--w:${Math.max(0,Math.min(1,x[1]))*100}%"></i><b>${x[2]}</b></div>`).join('')}<label class="c" style="max-width:260px">Meta mensal (R$)<input class="t" id="meta" type="number" min="1000" step="500" value="${S.meta/100}"></label></div></div>
 <div class="kpis"><div class="kpi"><b>${brl(c.fat)}</b><span>Faturamento concluído</span></div><div class="kpi"><b>${c.f.length}</b><span>Atendimentos</span></div><div class="kpi"><b>${brl(c.tk)}</b><span>Ticket médio</span></div><div class="kpi"><b>${pct(c.falta)}</b><span>Não comparecimento</span></div><div class="kpi"><b>${brl(c.ret)}</b><span>Sinais retidos</span></div><div class="kpi"><b>${brl(c.proj)}</b><span>Projeção do mês (estimativa)</span></div><div class="kpi"><b>${top?corte(top[0]).n:'-'}</b><span>Corte mais feito</span></div></div>
 <div class="cols"><div><h3 class="s">Receita por barbeiro</h3>${porB.map(x=>`<div class="barra"><span>${x.n}</span><i style="--w:${x.r/mx*100}%"></i><b>${brl(x.r)}</b></div>`).join('')}</div><div><h3 class="s">Horários de pico</h3><div class="grafico" role="img" aria-label="Agendamentos por hora">${[9,10,11,12,13,14,15,16,17,18].map(h=>`<div><i style="--h:${(hs[h]||0)/mh*100}%"></i>${h}h</div>`).join('')}</div></div></div>
 <details><summary>Como a nota é calculada</summary><p>30% ocupação (minutos agendados ÷ minutos de expediente, meta 75%) + 25% retorno (clientes com 2 ou mais atendimentos, meta 50%) + 20% presença (não comparecimento até 15%) + 25% projeção do mês ÷ meta (faturamento por dia atendido × 26). Pesos e metas são suposições do protótipo. A pontualidade do barbeiro, prevista na documentação, ainda não é medida.</p></details>`;
 $('#meta').onchange=e=>{S.meta=Math.max(100000,Math.round((+e.target.value||12000)*100));save();renderPainel()}}

/* dados de teste */
function gerarHist(o){let r=o.seed||7;const rnd=()=>(r=(r*9301+49297)%233280)/233280;
 for(let k=1;k<=6;k++)BARB.forEach(b=>{const c=S.cfg[b.id];if(String(new Date(dia(-k)+'T12:00').getDay())===c.fo)return;let t=c.i;
  while(t<c.f-30){const hr=Math.floor(t/60),p=o.pico?(([10,11,15,16].includes(hr))?.95:.2):o.occ;if(rnd()<p){const cc=CORTES[Math.floor(rnd()*CORTES.length)];if(t+cc.m>c.f)break;const f=rnd()<o.falta;
   S.itens.push(mk({d:dia(-k),b:b.id,t,c:cc.id,nome:NOMES[Math.floor(rnd()*o.pool)],s:f?'faltou':'concluido',ret:f?Math.round(cc.p*.2):0}));t+=cc.m+10*Math.floor(rnd()*2)}else t+=30}})}
const base=()=>{S.itens=S.itens.filter(i=>!i.ex);S.pausa=false;S.upd=null;remarc=null};
const todos=(t0,dur,n)=>BARB.forEach((b,k)=>{for(let j=0;j<n;j++)S.itens.push(mk({b:b.id,t:t0+j*dur,dur,nome:NOMES[(k*5+j)%40]}))});
const CEN=[
 ['Sem fila',()=>{base();S.sim=600},'#t-fila'],
 ['Fila normal',()=>{base();S.sim=600;todos(615,25,1)},'#t-fila'],
 ['Fila cheia',()=>{base();S.sim=600;todos(600,40,2)},'#t-fila'],
 ['Pausa ou fechado',()=>{base();S.sim=600;S.pausa=true},'#t-fila'],
 ['Status desatualizado',()=>{base();S.sim=600;todos(615,25,1);S.upd=Date.now()-3*3600000},'#t-fila'],
 ['Alerta de atraso (T+5)',()=>{base();S.sim=600;S.nome='Cliente Teste';S.itens.push(mk({b:B(0),t:594,nome:'Cliente Teste'}));S.vis='barbeiro'},'#agenda'],
 ['Não comparecimento (T+10)',()=>{base();S.sim=630;S.nome='Cliente Teste';S.itens.push(mk({b:B(1),t:610,nome:'Cliente Teste'}));S.vis='barbeiro'},'#agenda'],
 ['Cancelar tarde ou cedo',()=>{base();S.sim=600;S.nome='Cliente Teste';S.itens.push(mk({b:B(0),t:630,nome:'Cliente Teste'}),mk({b:B(1),t:780,nome:'Cliente Teste',c:'pompadour'}));S.vis='cliente'},'#agenda'],
 ['Chegada (Cheguei)',()=>{base();S.sim=600;S.nome='Cliente Teste';S.itens.push(mk({b:B(2),t:605,nome:'Cliente Teste'}));S.vis='cliente'},'#agenda'],
 ['Picos de horário',()=>{base();S.sim=600;gerarHist({pico:1,falta:.08,pool:20,seed:3});S.plano='premium';S.vis='barbeiro'},'#painel'],
 ['Painel saudável',()=>{base();S.sim=600;gerarHist({occ:.85,falta:.04,pool:8});S.plano='premium';S.vis='barbeiro'},'#painel'],
 ['Painel crítico',()=>{base();S.sim=600;gerarHist({occ:.12,falta:.35,pool:40,seed:11});S.plano='premium';S.vis='barbeiro'},'#painel']];
$('#cenarios').innerHTML=CEN.map((c,i)=>`<button class="btn sec" data-i="${i}" type="button">${c[0]}</button>`).join('');
$('#cenarios').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const c=CEN[+b.dataset.i];c[1]();save();msg=`Cenário: ${c[0]}. Hora simulada ${hh(S.sim)}.`;sel.d=dia();resetClk();syncTopo();renderAll();location.hash=c[2].slice(1)});
$('#simH').addEventListener('change',e=>{const [h,mi]=e.target.value.split(':').map(Number);if(!isNaN(h)){S.sim=h*60+mi;save();resetClk();renderAll()}});
$('#simReal').onclick=()=>{S.sim=null;save();resetClk();renderAll()};
$('#limpaEx').onclick=()=>{base();save();msg='Dados de teste removidos.';resetClk();renderAll()};
$('#zerar').onclick=()=>confirmar('Apagar tudo','Isso remove agendas, nome salvo e configurações deste protótipo neste navegador.',()=>{S=DEF();save();syncTopo();msg='Protótipo zerado.';resetClk();renderAll()});

/* configuração e backup */
$('#bCfg').onclick=()=>{$('#cfgCorpo').innerHTML=BARB.map(b=>{const c=S.cfg[b.id];return `<fieldset style="border:1px solid var(--borda);border-radius:1rem;margin:8px 0"><legend>${b.n}</legend><div class="g3"><label class="c">Início<input class="t" type="time" data-k="i" data-b="${b.id}" value="${hh(c.i)}"></label><label class="c">Fim<input class="t" type="time" data-k="f" data-b="${b.id}" value="${hh(c.f)}"></label><label class="c">Folga<select class="t" data-k="fo" data-b="${b.id}"><option value="">Nenhuma</option>${['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'].map((d,i)=>`<option value="${i}" ${c.fo===String(i)?'selected':''}>${d}</option>`).join('')}</select></label></div></fieldset>`}).join('');
 $('#pSinal').value=S.pc.sinal;$('#pNo').value=S.pc.noshow;$('#pRe').value=S.pc.remarc;$('#dCfg').showModal()};
$('#fCfg').addEventListener('submit',e=>{e.preventDefault();const mn=v=>{const[a,b]=v.split(':').map(Number);return a*60+b};document.querySelectorAll('#cfgCorpo [data-k]').forEach(x=>{const c=S.cfg[x.dataset.b],k=x.dataset.k;c[k]=k==='fo'?x.value:mn(x.value)});
 S.pc.sinal=Math.min(30,Math.max(20,+$('#pSinal').value||20));S.pc.noshow=Math.min(100,Math.max(0,+$('#pNo').value));S.pc.remarc=Math.min(100,Math.max(0,+$('#pRe').value));save();$('#dCfg').close();msg='Agenda e percentuais salvos.';resetClk();renderAll()});
$('#gFecha').onclick=()=>$('#dCfg').close();
$('#bExp').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(S,null,1)],{type:'application/json'}));a.download='navalha-agenda.json';a.click();URL.revokeObjectURL(a.href)};
$('#bImp').onclick=()=>$('#fImp').click();
$('#fImp').addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;f.text().then(t=>{try{const o=JSON.parse(t);if(!Array.isArray(o.itens)||!o.cfg)throw 0;S=Object.assign(DEF(),o);save();syncTopo();msg='Agenda importada.'}catch(x){msg='Arquivo inválido: não foi importado.'}resetClk();renderAll()});e.target.value=''});

/* topo e ciclo */
function syncTopo(){document.body.dataset.plano=S.plano;document.body.dataset.vis=S.vis;document.querySelector(`input[name=plano][value=${S.plano}]`).checked=true;document.querySelector(`input[name=vis][value=${S.vis}]`).checked=true}
document.querySelectorAll('input[name=plano],input[name=vis]').forEach(r=>r.addEventListener('change',e=>{S[e.target.name==='plano'?'plano':'vis']=e.target.value;save();syncTopo();renderAll()}));
function renderAll(){tick();renderAnel();renderFila();renderMeus();renderCtl();renderRel();renderPainel();$('#simH').value=hh(nowMin())}
syncTopo();renderCortes('todos');resetClk();renderAll();setInterval(()=>{tick();renderAnel();renderFila();renderMeus()},30000);

/* WhatsApp: o pedido só existe neste aparelho; o barbeiro confirma pela mensagem */
function abrirZap(i){const b=BARB.find(x=>x.id===i.b).n,q=new Date(i.d+'T12:00').toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'2-digit'});
 const t=`Olá! Quero confirmar meu horário: ${corte(i.c).n} (${i.dur} min), ${i.d===dia()?'hoje':q} às ${hh(i.t)} com ${b}. Nome: ${i.nome}.`;
 $('#zTxt').textContent=`${hh(i.t)} com ${b}, ${corte(i.c).n}.`;$('#zLink').href=`https://wa.me/${CFG.whatsapp}?text=${encodeURIComponent(t)}`;$('#dZap').showModal()}
$('#zFecha').onclick=()=>$('#dZap').close();
/* sincroniza abas do mesmo navegador (ex.: tablet da barbearia e tela da TV) */
window.addEventListener('storage',e=>{if(e.key===K){try{S=Object.assign(DEF(),JSON.parse(e.newValue||'{}'));syncTopo();resetClk();renderAll()}catch(x){}}});
document.querySelectorAll('[data-cfg]').forEach(el=>{el.textContent=CFG[el.dataset.cfg]||el.textContent});
if(typeof navigator!=='undefined'&&'serviceWorker' in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js').catch(()=>{});
