const residents = [
  {id:1,name:'山田 春子',kana:'やまだ はるこ',age:84,gender:'女性',facility:'呉診療所',facilityKey:'kure',room:'201号室',status:'入居中',care:'要介護3',staff:'勝山',last:'本日 10:18',condition:'食事・水分ともに良好',contact:'山田 健一（長男）',phone:'090-0000-1101'},
  {id:2,name:'佐藤 一郎',kana:'さとう いちろう',age:79,gender:'男性',facility:'呉診療所',facilityKey:'kure',room:'105号室',status:'入居中',care:'要介護2',staff:'小林',last:'本日 09:42',condition:'歩行時のふらつきに注意',contact:'佐藤 恵（長女）',phone:'090-0000-1102'},
  {id:3,name:'田中 和子',kana:'たなか かずこ',age:88,gender:'女性',facility:'田島ホーム',facilityKey:'tajima',room:'302号室',status:'入院中',care:'要介護4',staff:'水野',last:'昨日 16:30',condition:'9/10より経過観察入院',contact:'田中 修（二男）',phone:'090-0000-1103'},
  {id:4,name:'鈴木 正夫',kana:'すずき まさお',age:82,gender:'男性',facility:'田島ホーム',facilityKey:'tajima',room:'208号室',status:'外出中',care:'要介護2',staff:'勝山',last:'本日 08:55',condition:'ご家族と外出・16時帰所予定',contact:'鈴木 洋子（妻）',phone:'090-0000-1104'},
  {id:5,name:'高橋 澄江',kana:'たかはし すみえ',age:91,gender:'女性',facility:'呉診療所',facilityKey:'kure',room:'203号室',status:'入居中',care:'要介護4',staff:'小林',last:'昨日 20:15',condition:'夜間の咳込みを観察',contact:'高橋 聡（長男）',phone:'090-0000-1105'},
  {id:6,name:'伊藤 勇',kana:'いとう いさむ',age:76,gender:'男性',facility:'田島ホーム',facilityKey:'tajima',room:'101号室',status:'入居中',care:'要介護1',staff:'水野',last:'本日 07:50',condition:'変化なし',contact:'伊藤 幸子（妻）',phone:'090-0000-1106'}
];

let records = [
  {id:1,residentId:2,category:'重要',text:'歩行時に一度ふらつきあり。転倒はなく、以降は普段どおりです。移動時の見守りをお願いします。',author:'小林',time:'本日 10:24'},
  {id:2,residentId:1,category:'健康',text:'朝食は全量摂取。水分もしっかり取られ、体調に変化はありません。',author:'勝山',time:'本日 10:18'},
  {id:3,residentId:4,category:'生活',text:'ご家族と外出されました。16時頃に帰所予定です。',author:'水野',time:'本日 08:55'},
  {id:4,residentId:6,category:'生活',text:'夜間は良眠。7時に起床され、穏やかに過ごされています。',author:'佐々木',time:'本日 07:50'},
  {id:5,residentId:3,category:'重要',text:'病院より連絡あり。状態は安定しており、明日改めて経過共有予定です。',author:'水野',time:'昨日 16:30'},
  {id:6,residentId:5,category:'健康',text:'就寝前に軽い咳込みあり。発熱なし。夜間も継続して様子観察します。',author:'小林',time:'昨日 20:15'}
];

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const viewTitles = {dashboard:'施設ホーム',residents:'入居者情報',records:'申し送り・記録',schedule:'在所予定'};
let activeCategory = 'all';

function selectedFacility(){ return $('#facilitySelect').value; }
function visibleResidents(){ const f=selectedFacility(); return residents.filter(r=>f==='all'||r.facilityKey===f); }
function residentFor(id){ return residents.find(r=>r.id===id); }

function showView(name){
  $$('.view').forEach(v=>v.classList.remove('active'));
  $(`#${name}View`).classList.add('active');
  $$('.nav-item').forEach(n=>n.classList.toggle('active',n.dataset.view===name));
  $('#pageTitle').textContent=viewTitles[name];
  $('#sidebar').classList.remove('open');
  renderAll();
  window.scrollTo({top:0,behavior:'smooth'});
}

function renderAll(){
  const list=visibleResidents();
  $('#residentCount').innerHTML=`${list.length}<small>名</small>`;
  const visibleIds=new Set(list.map(r=>r.id));
  const scopedRecords=records.filter(r=>visibleIds.has(r.residentId));
  $('#recentRecords').innerHTML=scopedRecords.slice(0,4).map(recordMarkup).join('')||emptyMarkup('該当する記録はありません');
  $('#residentCards').innerHTML=list.slice(0,4).map(r=>`<div class="resident-card" data-resident="${r.id}"><div class="resident-top"><div class="resident-avatar">${r.name[0]}</div><div><strong>${r.name}</strong><span>${r.facility}・${r.room}</span></div></div><span class="status ${r.status}">${r.status}</span></div>`).join('')||emptyMarkup('該当する入居者はいません');
  renderResidentTable(); renderRecordFeed(); bindResidentOpen();
}

function recordMarkup(rec){const r=residentFor(rec.residentId);return `<div class="record-row" data-resident="${r.id}"><i class="record-dot ${rec.category}"></i><div><strong>${r.name} <span class="category-chip ${rec.category}">${rec.category}</span></strong><p>${rec.text}</p><span>${r.facility}｜記録者 ${rec.author}</span></div><span>${rec.time}</span></div>`}
function emptyMarkup(text){return `<div style="padding:28px;text-align:center;color:#71817f;font-size:11px">${text}</div>`}

function renderResidentTable(){
  const q=$('#residentSearch').value.trim().toLowerCase(),status=$('#statusFilter').value;
  const list=visibleResidents().filter(r=>(status==='all'||r.status===status)&&[r.name,r.kana,r.room,r.condition].join(' ').toLowerCase().includes(q));
  $('#residentTableBody').innerHTML=list.map(r=>`<tr data-id="${r.id}"><td><div class="row-person"><div class="mini-avatar">${r.name[0]}</div><div><strong>${r.name}</strong><span>${r.kana}・${r.age}歳</span></div></div></td><td><strong>${r.facility}</strong><span>${r.room}</span></td><td><span class="status ${r.status}">${r.status}</span></td><td>${r.staff}</td><td>${r.last}</td><td>›</td></tr>`).join('')||`<tr><td colspan="6">${emptyMarkup('検索条件に一致する入居者はいません')}</td></tr>`;
  $('#tableCount').textContent=`${list.length}名を表示`;
  $$('tr[data-id]').forEach(row=>row.onclick=()=>openResident(Number(row.dataset.id)));
}

function renderRecordFeed(){
  const q=$('#recordSearch').value.trim().toLowerCase(),ids=new Set(visibleResidents().map(r=>r.id));
  const list=records.filter(rec=>{const r=residentFor(rec.residentId);return ids.has(rec.residentId)&&(activeCategory==='all'||rec.category===activeCategory)&&`${r.name} ${rec.text}`.toLowerCase().includes(q)});
  $('#recordFeed').innerHTML=list.map(rec=>{const r=residentFor(rec.residentId);return `<article class="feed-card" data-resident="${r.id}"><time>${rec.time}<br>${r.facility}</time><div><h3>${r.name}</h3><p>${rec.text}</p><p style="margin-top:7px;font-size:9px">記録者：${rec.author}</p></div><span class="category-chip ${rec.category}">${rec.category}</span></article>`}).join('')||emptyMarkup('検索条件に一致する記録はありません');
  bindResidentOpen();
}

function bindResidentOpen(){$$('[data-resident]').forEach(el=>el.onclick=()=>openResident(Number(el.dataset.resident)))}
function openResident(id){
  const r=residentFor(id),history=records.filter(x=>x.residentId===id);
  $('#drawerName').textContent=r.name;
  $('#drawerContent').innerHTML=`<div class="profile-hero"><div class="profile-avatar">${r.name[0]}</div><div><strong>${r.name}（${r.age}歳・${r.gender}）</strong><span>${r.facility}｜${r.room}｜${r.care}</span><span class="status ${r.status}">${r.status}</span></div></div><section class="detail-section"><h3>基本情報</h3><div class="detail-grid"><div class="detail-field"><span>主担当</span><strong>${r.staff}</strong></div><div class="detail-field"><span>現在の様子</span><strong>${r.condition}</strong></div><div class="detail-field"><span>緊急連絡先</span><strong>${r.contact}</strong></div><div class="detail-field"><span>電話番号</span><strong>${r.phone}</strong></div></div></section><section class="detail-section"><h3>最近の記録</h3>${history.length?history.map(h=>`<div class="history-item"><time>${h.time}｜${h.category}｜${h.author}</time><p>${h.text}</p></div>`).join(''):emptyMarkup('記録はありません')}</section><section class="detail-section"><button class="primary-button" style="width:100%" data-drawer-record="${r.id}">この入居者の記録を追加</button></section>`;
  $('#detailDrawer').classList.add('open');$('#drawerBackdrop').classList.add('open');$('#detailDrawer').setAttribute('aria-hidden','false');
  $('[data-drawer-record]').onclick=()=>{closeDrawer();openRecordDialog(id)};
}
function closeDrawer(){$('#detailDrawer').classList.remove('open');$('#drawerBackdrop').classList.remove('open');$('#detailDrawer').setAttribute('aria-hidden','true')}

function openRecordDialog(id){
  $('#recordResident').innerHTML=visibleResidents().map(r=>`<option value="${r.id}" ${r.id===id?'selected':''}>${r.name}（${r.facility}）</option>`).join('');
  $('#recordText').value=''; $('#recordDialog').showModal();
}
function saveRecord(e){
  e.preventDefault(); if(!$('#recordForm').reportValidity())return;
  records.unshift({id:Date.now(),residentId:Number($('#recordResident').value),category:$('#recordCategory').value,text:$('#recordText').value.trim(),author:$('#recordAuthor').value.trim(),time:'たった今'});
  $('#recordDialog').close();renderAll();showToast('記録を保存しました（デモ）');
}
function showToast(message){const t=$('#toast');t.textContent=message;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2400)}
function exportCsv(){
  const rows=[['氏名','ふりがな','年齢','施設','居室','状態','要介護度','主担当'],...visibleResidents().map(r=>[r.name,r.kana,r.age,r.facility,r.room,r.status,r.care,r.staff])];
  const csv='\ufeff'+rows.map(row=>row.map(v=>`"${String(v).replaceAll('"','""')}"`).join(',')).join('\n');
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='入居者一覧_デモ.csv';a.click();URL.revokeObjectURL(a.href);showToast('CSVを出力しました');
}

$$('.nav-item').forEach(n=>n.onclick=()=>showView(n.dataset.view));
$$('[data-go]').forEach(n=>n.onclick=()=>showView(n.dataset.go));
$$('[data-open-record]').forEach(n=>n.onclick=()=>openRecordDialog());
$('#quickRecordButton').onclick=()=>openRecordDialog();
$('#facilitySelect').onchange=renderAll;
$('#residentSearch').oninput=renderResidentTable;$('#statusFilter').onchange=renderResidentTable;
$('#recordSearch').oninput=renderRecordFeed;
$$('[data-category]').forEach(b=>b.onclick=()=>{$$('[data-category]').forEach(x=>x.classList.remove('active'));b.classList.add('active');activeCategory=b.dataset.category;renderRecordFeed()});
$('#closeDrawer').onclick=closeDrawer;$('#drawerBackdrop').onclick=closeDrawer;
$('#saveRecordButton').onclick=saveRecord;
$('#exportButton').onclick=exportCsv;$('#printButton').onclick=()=>window.print();
$('#newResidentButton').onclick=()=>showToast('本番では登録フォームが開きます');
$('#voiceButton').onclick=()=>{$('#recordText').value='昼食後、いつも通り穏やかに過ごされています。体調に変化はありません。';showToast('音声入力のデモを反映しました')};
$('#menuButton').onclick=()=>$('#sidebar').classList.toggle('open');
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeDrawer()});
renderAll();
