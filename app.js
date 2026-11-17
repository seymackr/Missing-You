import { firebaseConfig } from './firebase-config.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js';
import { getFirestore, collection, doc, onSnapshot, getDocs, writeBatch, serverTimestamp, query, orderBy } from 'https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js';

const $ = (s, base=document) => base.querySelector(s);
const $$ = (s, base=document) => [...base.querySelectorAll(s)];
const DAYS = ['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'];
const MONTHS = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
const configured = !Object.values(firebaseConfig).some(v => !v || /BURAYA|PROJE_ID/.test(String(v)));
const state = { day: dateStart(new Date()), month: dateStart(new Date()), db:null, subs:[], dayMessages:new Map(), knownDays:new Map(), demo:!configured, toastTimeout:0, lastSend:0 };
const phones = $$('.phone');

function dateStart(date) { return new Date(date.getFullYear(),date.getMonth(),date.getDate(),12); }
function addDays(date,delta) { const d=dateStart(date); d.setDate(d.getDate()+delta); return d; }
function dateKey(date) {const d=dateStart(date);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
function parseDate(key) { const [y,m,d]=key.split('-').map(Number); return new Date(y,m-1,d,12); }
function prettyDate(date) { return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`; }
function monthDate(date) { return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`; }
function clock() {return new Intl.DateTimeFormat('tr-TR',{hour:'2-digit',minute:'2-digit'}).format(new Date());}
function isCurrentDay(date) {return dateKey(date)===dateKey(new Date());}
function toast(msg) {const el=$('#toast');el.textContent=msg;el.hidden=false;clearTimeout(state.toastTimeout);state.toastTimeout=setTimeout(()=>el.hidden=true,3900);}
function status(msg){$('#statusLine').textContent=msg;}
function showModal(id){$('#'+id).hidden=false; if(id==='searchModal')$('#searchInput').focus();}
function hideModal(id){$('#'+id).hidden=true;}
function demoMessages(offset) {if(offset === 0) return [{id:'demo1',text:'Bugün kendimi daha iyi hissettim. ☀️',timeLabel:'10:21'},{id:'demo2',text:'Uzun zamandır ertelediğim işi sonunda yaptım! ✅',timeLabel:'16:47'},{id:'demo3',text:'Akşam da güzel bir film izledim. Kendime zaman ayırmak iyi geldi.',timeLabel:'22:30'}];if(offset===-1)return [{id:'demo4',text:'Bugün biraz yorgundum...',timeLabel:'20:14'},{id:'demo5',text:'Ama yine de fena bir gün değildi.',timeLabel:'22:03'}];return [];}
function activeDate(offset) {return addDays(state.day,Number(offset));}
function renderPhone(phone) {
 const offset=Number(phone.dataset.offset),day=activeDate(offset),key=dateKey(day);
 $('.phone-date strong',phone).textContent=prettyDate(day);
 $('.phone-date small',phone).textContent=DAYS[day.getDay()];
 $('.phone-status span',phone).textContent=clock();
 const messages = state.demo ? demoMessages(offset):state.dayMessages.get(key)||[];
 const body=$('.chat-messages',phone);body.replaceChildren();
 messages.forEach(m=>{
  const bubble=document.createElement('article');bubble.className='bubble';
  const txt=document.createElement('span');txt.className='bubble-text';txt.textContent=m.text;bubble.append(txt);
  const meta=document.createElement('div');meta.className='bubble-meta';
  const time=document.createElement('span');time.textContent=m.createdAt?.toDate ? new Intl.DateTimeFormat('tr-TR',{hour:'2-digit',minute:'2-digit'}).format(m.createdAt.toDate()) : (m.timeLabel || '…');meta.append(time);bubble.append(meta);body.append(bubble);
 });
 $('.chat-empty',phone).hidden = messages.length>0;
 const composer=$('.composer',phone);
 composer.hidden=state.demo;
 $('.message-input',phone).placeholder=isCurrentDay(day)?'Bugünün mesajını yaz...':'Bu güne bir mesaj yaz...';
 $('.chat-area',phone).scrollTop=$('.chat-area',phone).scrollHeight;
}
function renderAllPhones(){phones.forEach(renderPhone);}
function renderCalendar(){
 const m=state.month, y=m.getFullYear(),mo=m.getMonth();
 $('#miniMonthLabel').textContent=monthDate(m);$('#topMonthLabel').textContent=monthDate(m);
 $('#datePicker').value=dateKey(state.day);$('#largeDatePicker').value=dateKey(state.day);
 const container=$('#calendarDays');container.replaceChildren();
 const pad=(new Date(y,mo,1).getDay()+6)%7;
 for(let i=0;i<pad;i++){const filler=document.createElement('span');filler.className='calendar-blank';container.append(filler);}
 const total=new Date(y,mo+1,0).getDate();
 for(let i=1;i<=total;i++){
   const date=new Date(y,mo,i,12),key=dateKey(date),b=document.createElement('button');
   b.type='button';b.textContent=String(i);b.setAttribute('aria-label',prettyDate(date));
   if(key===dateKey(state.day))b.classList.add('selected');
   if(key===dateKey(new Date()))b.classList.add('today');
   if((state.knownDays.get(key)||0)>0)b.classList.add('has-entry');
   b.addEventListener('click',()=>selectDate(date));container.append(b);
 }
}
function selectDate(date){state.day=dateStart(date);state.month=new Date(state.day.getFullYear(),state.day.getMonth(),1,12);renderCalendar();subscribeDays();}
function changeMonth(n){const first=new Date(state.day.getFullYear(),state.day.getMonth()+n,1,12);const last=new Date(first.getFullYear(),first.getMonth()+1,0).getDate();selectDate(new Date(first.getFullYear(),first.getMonth(),Math.min(state.day.getDate(),last),12));}
function changeDay(n){selectDate(addDays(state.day,n));}
function unsubscribeDays(){state.subs.forEach(fn=>fn());state.subs=[];}
function subscribeDays(){
 unsubscribeDays();state.dayMessages.clear();renderAllPhones();
 if(state.demo)return;
 phones.forEach(phone=>{
  const key=dateKey(activeDate(Number(phone.dataset.offset)));
  const q=query(collection(state.db,'days',key,'messages'),orderBy('createdAt','asc'));
  const unsub=onSnapshot(q,snap=>{
   state.dayMessages.set(key,snap.docs.map(d=>({id:d.id,...d.data()})));
   renderPhone(phone);
  },err=>{status('Mesajlar yüklenemedi. Firebase kurallarını kontrol et.'); console.error(err);});
  state.subs.push(unsub);
 });
}
async function addMessage(date,field,button){
 if(state.demo){toast('Önce Firebase kurulumunu tamamlamalısın.');return;}
 const message=field.value.trim();
 if(!message)return;
 if(message.length>1000){toast('Mesaj en fazla 1000 karakter olabilir.');return;}
 if(Date.now()-state.lastSend<4000){toast('Yeni mesaj için birkaç saniye bekle.');return;}
 button.disabled=true;
 try{
  const key=dateKey(date),batch=writeBatch(state.db),msgRef=doc(collection(state.db,'days',key,'messages'));
  batch.set(msgRef,{text:message,createdAt:serverTimestamp()});
  batch.set(doc(state.db,'days',key),{updatedAt:serverTimestamp()},{merge:true});
  await batch.commit();
  field.value='';field.style.height='';state.lastSend=Date.now();toast('Mesaj yayınlandı. Herkes görebilir.');
 }catch(err){console.error(err);toast('Mesaj gönderilemedi. Firestore Rules ve bağlantıyı kontrol et.');}
 finally{button.disabled=false;field.focus();}
}
async function fetchDaysIndex(){if(state.demo)return;try {const snap=await getDocs(collection(state.db,'days'));state.knownDays=new Map(snap.docs.map(d=>[d.id,1]));renderCalendar();} catch(err){console.error(err);}}
function attachEvents(){
 $('#monthPrev').addEventListener('click',()=>changeMonth(-1));$('#monthNext').addEventListener('click',()=>changeMonth(1));
 $('#calendarPrev').addEventListener('click',()=>changeMonth(-1));$('#calendarNext').addEventListener('click',()=>changeMonth(1));
 $('#dayPrev').addEventListener('click',()=>changeDay(-1));$('#dayNext').addEventListener('click',()=>changeDay(1));
 $('#monthPickerButton').addEventListener('click',()=>showModal('calendarModal'));
 $('#datePicker').addEventListener('change',e=>{if(e.target.value)selectDate(parseDate(e.target.value));});
 $('#goToDate').addEventListener('click',()=>{const key=$('#largeDatePicker').value;if(key){selectDate(parseDate(key));hideModal('calendarModal');}});
 $('#navCalendar').addEventListener('click',()=>showModal('calendarModal'));
 $('#navSearch').addEventListener('click',()=>showModal('searchModal'));
 $('#navDiary').addEventListener('click',()=>{ $$('.overlay').forEach(el=>el.hidden=true);selectDate(new Date());});
 $$('.overlay').forEach(ov=>ov.addEventListener('click',e=>{if(e.target===ov)ov.hidden=true;}));
 $$('[data-close]').forEach(b=>b.addEventListener('click',()=>hideModal(b.dataset.close)));
 document.addEventListener('keydown',e=>{if(e.key==='Escape')$$('.overlay').forEach(el=>el.hidden=true);});
 phones.forEach(phone=>{
  $('.phone-back',phone).addEventListener('click',()=>changeDay(-1));
  const forward=$('.phone-forward',phone);if(forward)forward.addEventListener('click',()=>changeDay(1));
  $('.composer',phone).addEventListener('submit',async e=>{e.preventDefault();await addMessage(activeDate(Number(phone.dataset.offset)),$('.message-input',phone),$('.send-button',phone));});
  const ta=$('.message-input',phone);ta.addEventListener('input',()=>{ta.style.height='';ta.style.height=Math.min(110,ta.scrollHeight)+'px';});
  ta.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();$('.composer',phone).requestSubmit();}});
 });
 $('#searchForm').addEventListener('submit',async e=>{
  e.preventDefault();const term=$('#searchInput').value.trim().toLocaleLowerCase('tr-TR'),results=$('#searchResults');
  if(term.length<2){results.textContent='En az iki harf yaz.';return;}
  if(state.demo){results.textContent='Gerçek arama için Firebase kurulumunu tamamla.';return;}
  results.textContent='Mesajlar aranıyor...';
  try{
   const days=await getDocs(collection(state.db,'days')),found=[];
   for(const day of days.docs){const msgs=await getDocs(collection(state.db,'days',day.id,'messages'));for(const m of msgs.docs){const d=m.data();if((d.text||'').toLocaleLowerCase('tr-TR').includes(term))found.push({day:day.id,...d});}}
   found.sort((a,b)=>b.day.localeCompare(a.day));results.replaceChildren();
   if(!found.length){results.textContent='Aradığın kelimeyi içeren mesaj bulunamadı.';return;}
   found.slice(0,100).forEach(item=>{const b=document.createElement('button');b.type='button';b.className='search-result';const date=document.createElement('strong');date.textContent=prettyDate(parseDate(item.day))+' · '+(item.createdAt?.toDate ? new Intl.DateTimeFormat('tr-TR',{hour:'2-digit',minute:'2-digit'}).format(item.createdAt.toDate()) : '');const content=document.createElement('span');content.textContent=item.text;b.append(date,content);b.addEventListener('click',()=>{hideModal('searchModal');selectDate(parseDate(item.day));});results.append(b);});
   if(found.length>100){const p=document.createElement('p');p.textContent=`İlk 100 sonuç gösteriliyor (toplam ${found.length}).`;results.append(p);}
  }catch(err){console.error(err);results.textContent='Arama başarısız. Bağlantıyı kontrol et.';}
 });
}
async function init(){
 attachEvents();state.month=new Date(state.day.getFullYear(),state.day.getMonth(),1,12);renderCalendar();renderAllPhones();
 if(state.demo){$('#setupBanner').hidden=false;status('Önizleme · Örnek mesajlar gösteriliyor; gerçek kayıt için Firebase kurulumu gerekli.');return;}
 try{
  const app=initializeApp(firebaseConfig);state.db=getFirestore(app);
  status('Herkese açık günlük · Mesajlar anlık paylaşılır. Giriş yapmadan yazabilirsin.');
  subscribeDays();await fetchDaysIndex();
  // Takvim noktalarını güncel tut: başka cihazda yeni mesaj eklenirse de görünür.
  state.indexUnsub=onSnapshot(collection(state.db,'days'),snap=>{state.knownDays=new Map(snap.docs.map(d=>[d.id,1]));renderCalendar();},console.error);
 }catch(err){console.error(err);status('Firebase bağlantısı kurulamadı. Firebase ayarlarını kontrol et.');}
}
init();
