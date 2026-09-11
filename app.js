const residents = [
  {id:1,name:'デモ入居者A',kana:'サンプル A',age:'--',gender:'-',facility:'施設A',facilityKey:'kure',room:'201号室',status:'入居中',care:'設定例A',staff:'スタッフA',last:'本日 10:18',condition:'サンプル状態A',contact:'デモ連絡先A',phone:'非表示'},
  {id:2,name:'デモ入居者B',kana:'サンプル B',age:'--',gender:'-',facility:'施設A',facilityKey:'kure',room:'105号室',status:'入居中',care:'設定例B',staff:'スタッフB',last:'本日 09:42',condition:'サンプル状態B',contact:'デモ連絡先B',phone:'非表示'},
  {id:3,name:'デモ入居者C',kana:'サンプル C',age:'--',gender:'-',facility:'施設B',facilityKey:'tajima',room:'302号室',status:'入院中',care:'設定例C',staff:'スタッフC',last:'昨日 16:30',condition:'サンプル状態C',contact:'デモ連絡先C',phone:'非表示'},
  {id:4,name:'デモ入居者D',kana:'サンプル D',age:'--',gender:'-',facility:'施設B',facilityKey:'tajima',room:'208号室',status:'外出中',care:'設定例B',staff:'スタッフA',last:'本日 08:55',condition:'サンプル状態D',contact:'デモ連絡先D',phone:'非表示'},
  {id:5,name:'デモ入居者E',kana:'サンプル E',age:'--',gender:'-',facility:'施設A',facilityKey:'kure',room:'203号室',status:'入居中',care:'設定例C',staff:'スタッフB',last:'昨日 20:15',condition:'サンプル状態E',contact:'デモ連絡先E',phone:'非表示'},
  {id:6,name:'デモ入居者F',kana:'サンプル F',age:'--',gender:'-',facility:'施設B',facilityKey:'tajima',room:'101号室',status:'入居中',care:'設定例A',staff:'スタッフC',last:'本日 07:50',condition:'サンプル状態F',contact:'デモ連絡先F',phone:'非表示'}
];

let records = [
  {id:1,residentId:2,category:'重要',text:'重要な申し送り事項のサンプルです。担当スタッフへ確認を依頼します。',author:'スタッフB',time:'本日 10:24'},
  {id:2,residentId:1,category:'健康',text:'日々の記録サンプルです。詳細な状況をこの欄に表示します。',author:'スタッフA',time:'本日 10:18'},
  {id:3,residentId:4,category:'生活',text:'外出予定のサンプルです。16時頃に帰所予定として登録されています。',author:'スタッフC',time:'本日 08:55'},
  {id:4,residentId:6,category:'生活',text:'生活記録のサンプルです。朝の状況を登録しています。',author:'スタッフA',time:'本日 07:50'},
  {id:5,residentId:3,category:'重要',text:'施設間で共有する連絡事項のサンプルです。',author:'スタッフC',time:'昨日 16:30'},
  {id:6,residentId:5,category:'健康',text:'経過確認用のサンプル記録です。',author:'スタッフB',time:'昨日 20:15'}
];

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const viewTitles = {dashboard:'施設ホーム',residents:'入居者情報',records:'申し送り・記録',ocr:'紙のOCR読取',schedule:'在所予定'};
let activeCategory = 'all';
let ocrImageSource = null;

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
function setOcrImage(source){
  if(ocrImageSource?.startsWith('blob:')) URL.revokeObjectURL(ocrImageSource);
  ocrImageSource=source; $('#ocrPreview').src=source; $('#uploadZone').classList.add('has-image');
  $('#sourceState').textContent='画像を選択済み'; $('#sourceState').classList.add('ready'); $('#runOcrButton').disabled=false;
  $('#ocrResult').hidden=true; $('#ocrPlaceholder').hidden=false; $('#ocrConfidence').textContent='待機中'; $('#ocrConfidence').classList.remove('ready');
}
function loadOcrFile(file){
  if(!file||!file.type.startsWith('image/')){showToast('画像ファイルを選択してください');return}
  if(file.size>12*1024*1024){showToast('画像は12MB以下にしてください');return}
  setOcrImage(URL.createObjectURL(file));
}
function createSamplePaper(){
  const canvas=document.createElement('canvas'); canvas.width=1000; canvas.height=700; const c=canvas.getContext('2d');
  c.fillStyle='#fffdf8';c.fillRect(0,0,canvas.width,canvas.height);c.strokeStyle='#9b9b91';c.lineWidth=2;c.strokeRect(35,35,930,630);
  c.fillStyle='#283330';c.font='bold 42px sans-serif';c.fillText('申し送り記録（デモ）',70,105);c.font='26px sans-serif';
  ['日付：2026年9月11日','入居者：デモ入居者A','分類：生活','記録：本日の申し送り事項のサンプルです。','確認者：スタッフA'].forEach((line,i)=>c.fillText(line,80,190+i*90));
  c.strokeStyle='#d5d5ca';for(let y=220;y<650;y+=90){c.beginPath();c.moveTo(65,y);c.lineTo(935,y);c.stroke()}
  setOcrImage(canvas.toDataURL('image/png')); showToast('サンプル帳票をセットしました');
}
async function runOcr(){
  if(!ocrImageSource)return;
  $('#runOcrButton').disabled=true; $('#ocrProgress').hidden=false; $('#ocrProgressBar').value=0; $('#ocrProgressLabel').textContent='OCRエンジンを準備中...';
  try{
    if(!window.Tesseract) throw new Error('OCRライブラリを読み込めませんでした');
    const result=await Tesseract.recognize(ocrImageSource,'jpn+eng',{logger:m=>{
      if(typeof m.progress==='number'){const p=Math.round(m.progress*100);$('#ocrProgressBar').value=p;$('#ocrProgressPercent').textContent=`${p}%`}
      if(m.status==='recognizing text')$('#ocrProgressLabel').textContent='文字を読み取っています...';
    }});
    const text=result.data.text.trim()||'文字を認識できませんでした。画像を撮り直すか、文章を直接修正してください。';
    $('#ocrText').value=text; $('#ocrResident').innerHTML=visibleResidents().map(r=>`<option value="${r.id}">${r.name}（${r.facility}）</option>`).join('');
    const match=residents.find(r=>text.includes(r.name));if(match)$('#ocrResident').value=String(match.id);
    $('#ocrCategory').value=text.includes('重要')?'重要':text.includes('健康')?'健康':'生活';
    const confidence=Math.round(result.data.confidence);$('#ocrConfidence').textContent=`認識精度 ${confidence}%`;$('#ocrConfidence').classList.add('ready');
    $('#ocrPlaceholder').hidden=true;$('#ocrResult').hidden=false;$('#ocrProgressLabel').textContent='読み取り完了';
  }catch(error){console.error(error);showToast('OCRに失敗しました。通信環境または画像を確認してください');$('#ocrProgressLabel').textContent='読み取りに失敗しました'}
  finally{$('#runOcrButton').disabled=false}
}
function saveOcrRecord(){
  const text=$('#ocrText').value.trim();if(!text){showToast('読み取り文章を入力してください');return}
  records.unshift({id:Date.now(),residentId:Number($('#ocrResident').value),category:$('#ocrCategory').value,text,author:'OCR取込・デモ管理者',time:'たった今'});
  renderAll();showView('records');showToast('OCR結果を記録に追加しました（デモ）');
}
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
$('#voiceButton').onclick=()=>{$('#recordText').value='音声から変換された申し送り内容のサンプルです。';showToast('音声入力のデモを反映しました')};
$('#menuButton').onclick=()=>$('#sidebar').classList.toggle('open');
$('#uploadZone').onclick=()=>$('#ocrFile').click();
$('#uploadZone').onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();$('#ocrFile').click()}};
$('#ocrFile').onchange=e=>loadOcrFile(e.target.files[0]);
$('#uploadZone').ondragover=e=>{e.preventDefault();$('#uploadZone').classList.add('dragover')};
$('#uploadZone').ondragleave=()=>$('#uploadZone').classList.remove('dragover');
$('#uploadZone').ondrop=e=>{e.preventDefault();$('#uploadZone').classList.remove('dragover');loadOcrFile(e.dataTransfer.files[0])};
$('#samplePaperButton').onclick=createSamplePaper;$('#runOcrButton').onclick=runOcr;$('#saveOcrButton').onclick=saveOcrRecord;
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeDrawer()});
renderAll();
