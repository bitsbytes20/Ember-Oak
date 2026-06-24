// ========== DB (localStorage) ==========
const DB = {
  get(k){try{return JSON.parse(localStorage.getItem(k)||'[]')}catch{return[]}},
  set(k,v){localStorage.setItem(k,JSON.stringify(v))},
  push(k,item){const a=DB.get(k);a.push(item);DB.set(k,a);return item},
  update(k,id,patch){const a=DB.get(k);const i=a.findIndex(x=>x.id===id);if(i>-1){a[i]={...a[i],...patch};DB.set(k,a)}},
  delete(k,id){DB.set(k,DB.get(k).filter(x=>x.id!==id))}
};

function uid(){return Math.random().toString(36).substr(2,6).toUpperCase()}
function fmtDate(s){if(!s)return'—';const d=new Date(s+'T00:00:00');return d.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}
function nowStr(){return new Date().toISOString()}

// seed demo data if empty
function seedData(){
  if(DB.get('tableBookings').length>0)return;
  const names=[['Sophie','Lawson'],['Marcus','Obi'],['Elena','Chu'],['Thomas','Barker'],['Priya','Nair'],['Oliver','Blake']];
  const times=['18:30','19:00','19:30','20:00','20:30'];
  const occasions=['Birthday','Anniversary','Date night','Business dinner','',''];
  const statuses=['confirmed','confirmed','confirmed','pending','confirmed','cancelled'];
  const dates=['2026-06-22','2026-06-23','2026-06-24','2026-06-25','2026-06-26','2026-06-27'];
  names.forEach(([fn,ln],i)=>{
    DB.push('tableBookings',{id:uid(),type:'table',firstName:fn,lastName:ln,email:`${fn.toLowerCase()}@email.com`,phone:'020 7000 0000',date:dates[i],time:times[i%5],guests:String((i%3)+2),occasion:occasions[i],diet:'',notes:'',addOns:[],status:statuses[i],created:nowStr(),ref:'REF-'+uid()});
  });
  DB.push('partyBookings',{id:uid(),type:'party',firstName:'Charlotte',lastName:'Reed',email:'charlotte@reed.co.uk',phone:'07700 000001',eventType:'Corporate dinner',date:'2026-07-10',time:'19:00',guests:'16–20',budget:'£90–£120 (tasting menu)',diet:'',notes:'Team dinner post AGM',addOns:['Wine pairing','Welcome reception'],status:'pending',created:nowStr(),ref:'ENQ-'+uid()});
  DB.push('partyBookings',{id:uid(),type:'party',firstName:'George',lastName:'Weston',email:'g.weston@example.com',phone:'07700 000002',eventType:'Birthday celebration',date:'2026-07-20',time:'18:30',guests:'21–24',budget:'£130+ (bespoke)',diet:'2 vegans',notes:'50th birthday surprise',addOns:['Celebration cake','Florist arrangement','Photography package'],status:'confirmed',created:nowStr(),ref:'ENQ-'+uid()});
  const avail={};
  const days=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  days.forEach(d=>{
    avail[d]={lunch:d!=='Mon'&&d!=='Sat',dinner:d!=='Mon'};
  });
  DB.set('availability',avail);
}

// ========== NAVIGATION ==========
function goPage(id){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById('page-'+id).classList.add('active');
  document.querySelectorAll('.nav-links a').forEach(a=>{
    a.classList.toggle('active',a.dataset.page===id);
  });
  document.getElementById('navLinks').classList.remove('open');
  window.scrollTo(0,0);
  if(id==='admin'){seedData();renderAdmin()}
}
function toggleMenu(){document.getElementById('navLinks').classList.toggle('open')}

// ========== MENU TABS ==========
function switchMenu(btn,section){
  document.querySelectorAll('.menu-tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.menu-section').forEach(s=>s.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById(section).classList.add('active');
}

// ========== BOOKING ==========
let selectedTime={t:'',p:''};
function selectTime(el,prefix){
  document.querySelectorAll('#tableTimeGrid .time-slot').forEach(s=>s.classList.remove('selected'));
  el.classList.add('selected');
  selectedTime[prefix]=el.textContent.trim();
  document.getElementById(prefix+'-time').value=selectedTime[prefix];
}
function toggleAddOn(el){el.classList.toggle('selected')}

function getAddOns(wrap){
  return Array.from(wrap.querySelectorAll('.add-on.selected')).map(a=>a.querySelector('h4').textContent);
}

function submitBooking(type){
  const p=type==='table'?'t':'p';
  const fname=document.getElementById(p+'-fname').value.trim();
  const lname=document.getElementById(p+'-lname').value.trim();
  const email=document.getElementById(p+'-email').value.trim();
  const date=type==='table'?document.getElementById('t-date').value:document.getElementById('p-date').value;
  if(!fname||!lname||!email||!date){showToast('Please fill in all required fields','error');return}
  if(type==='table'&&!selectedTime.t){showToast('Please select a time slot','error');return}
  if(type==='party'&&!document.getElementById('p-type').value){showToast('Please select an event type','error');return}

  const ref=(type==='table'?'REF-':'ENQ-')+uid();
  const record={
    id:uid(),type,firstName:fname,lastName:lname,
    email,phone:document.getElementById(p+'-phone').value,
    date,status:'pending',created:nowStr(),ref,
    addOns:getAddOns(document.getElementById(p==='t'?'tableFormWrap':'partyFormWrap'))
  };
  if(type==='table'){
    Object.assign(record,{time:selectedTime.t,guests:document.getElementById('t-guests').value,occasion:document.getElementById('t-occasion').value,diet:document.getElementById('t-diet').value,notes:document.getElementById('t-notes').value});
    DB.push('tableBookings',record);
    document.getElementById('tableRef').textContent=ref;
    document.getElementById('tableFormWrap').style.display='none';
    document.getElementById('tableSuccess').style.display='block';
  }else{
    Object.assign(record,{eventType:document.getElementById('p-type').value,time:document.getElementById('p-time').value,guests:document.getElementById('p-guests').value,budget:document.getElementById('p-budget').value,diet:document.getElementById('p-diet').value,notes:document.getElementById('p-notes').value});
    DB.push('partyBookings',record);
    document.getElementById('partyRef').textContent=ref;
    document.getElementById('partyFormWrap').style.display='none';
    document.getElementById('partySuccess').style.display='block';
  }
  showToast('Booking confirmed! '+ref,'success');
}

function resetBooking(type){
  if(type==='table'){
    document.getElementById('tableFormWrap').style.display='block';
    document.getElementById('tableSuccess').style.display='none';
    selectedTime.t='';
    document.querySelectorAll('#tableTimeGrid .time-slot').forEach(s=>s.classList.remove('selected'));
    document.querySelectorAll('#tableFormWrap .add-on').forEach(a=>a.classList.remove('selected'));
    ['t-fname','t-lname','t-email','t-phone','t-date','t-notes'].forEach(id=>document.getElementById(id).value='');
  }else{
    document.getElementById('partyFormWrap').style.display='block';
    document.getElementById('partySuccess').style.display='none';
    document.querySelectorAll('#partyFormWrap .add-on').forEach(a=>a.classList.remove('selected'));
    ['p-fname','p-lname','p-email','p-phone','p-date','p-diet','p-notes'].forEach(id=>document.getElementById(id).value='');
  }
}

function submitContact(){
  const name=document.getElementById('c-name').value.trim();
  const email=document.getElementById('c-email').value.trim();
  const msg=document.getElementById('c-message').value.trim();
  if(!name||!email||!msg){showToast('Please fill in all fields','error');return}
  DB.push('messages',{id:uid(),name,email,subject:document.getElementById('c-subject').value,message:msg,created:nowStr(),read:false});
  showToast('Message sent — we\'ll be in touch soon','success');
  ['c-name','c-email','c-message'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('c-subject').value='';
}

// ========== ADMIN ==========
function renderAdmin(){renderDash();renderTableBookings();renderPartyBookings();renderMessages();renderAvailability()}

function switchAdminPanel(el,id){
  document.querySelectorAll('.admin-nav-item').forEach(n=>n.classList.remove('active'));
  document.querySelectorAll('.admin-panel').forEach(p=>p.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('panel-'+id).classList.add('active');
  renderAdmin();
}

function renderDash(){
  const tb=DB.get('tableBookings');
  const pb=DB.get('partyBookings');
  const ms=DB.get('messages');
  const confirmed=tb.filter(b=>b.status==='confirmed').length;
  document.getElementById('statsRow').innerHTML=`
    <div class="stat-card"><div class="stat-card-label">Table bookings</div><div class="stat-card-value gold">${tb.length}</div><div class="stat-card-sub">${confirmed} confirmed</div></div>
    <div class="stat-card"><div class="stat-card-label">Party enquiries</div><div class="stat-card-value gold">${pb.length}</div><div class="stat-card-sub">${pb.filter(b=>b.status==='confirmed').length} confirmed</div></div>
    <div class="stat-card"><div class="stat-card-label">Messages</div><div class="stat-card-value gold">${ms.length}</div><div class="stat-card-sub">${ms.filter(m=>!m.read).length} unread</div></div>
    <div class="stat-card"><div class="stat-card-label">Covers tonight</div><div class="stat-card-value gold">${tb.filter(b=>b.date===new Date().toISOString().split('T')[0]&&b.status==='confirmed').reduce((s,b)=>s+(+b.guests||0),0)}</div><div class="stat-card-sub">Today</div></div>
  `;
  const recent=tb.slice(-5).reverse();
  document.getElementById('recentTableList').innerHTML=recent.length?recent.map(b=>`<div style="display:grid;grid-template-columns:1fr auto auto;gap:0.5rem;align-items:center;padding:0.75rem 1rem;border-bottom:1px solid var(--border);font-size:0.85rem"><div><div style="font-weight:500">${b.firstName} ${b.lastName}</div><div style="font-size:0.78rem;color:var(--text3)">${fmtDate(b.date)} · ${b.time}</div></div><div style="font-size:0.8rem;color:var(--text2)">${b.guests} pax</div><span class="status-badge status-${b.status}">${b.status}</span></div>`).join(''):'<div class="empty-state">No bookings yet</div>';
  const days=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const counts={};days.forEach(d=>counts[d]=0);
  tb.forEach(b=>{const d=new Date(b.date+'T00:00:00');const name=days[d.getDay()===0?6:d.getDay()-1];if(counts[name]!==undefined)counts[name]++;});
  const max=Math.max(...Object.values(counts),1);
  document.getElementById('bookingChart').innerHTML=days.map(d=>`<div class="chart-row"><div class="chart-label">${d}</div><div class="chart-bar-bg"><div class="chart-bar-fill" style="width:${Math.round(counts[d]/max*100)}%"></div></div><div class="chart-val">${counts[d]}</div></div>`).join('');
}

function renderTableBookings(){
  const filter=document.getElementById('tFilter').value;
  let data=DB.get('tableBookings');
  if(filter!=='all')data=data.filter(b=>b.status===filter);
  document.getElementById('tableBookingsBody').innerHTML=data.length?data.map(b=>`
    <tr>
      <td><span style="font-family:monospace;font-size:0.78rem;color:var(--text3)">${b.ref}</span></td>
      <td><div style="font-weight:500">${b.firstName} ${b.lastName}</div><div style="font-size:0.78rem;color:var(--text3)">${b.email}</div></td>
      <td>${fmtDate(b.date)}</td><td>${b.time}</td><td>${b.guests}</td>
      <td>${b.occasion||'—'}</td>
      <td><span class="status-badge status-${b.status}">${b.status}</span></td>
      <td style="display:flex;gap:0.4rem;flex-wrap:wrap">
        <button class="action-btn" onclick="viewBooking('tableBookings','${b.id}')">View</button>
        ${b.status!=='confirmed'?`<button class="action-btn" onclick="changeStatus('tableBookings','${b.id}','confirmed')">Confirm</button>`:''}
        ${b.status!=='cancelled'?`<button class="action-btn danger" onclick="changeStatus('tableBookings','${b.id}','cancelled')">Cancel</button>`:''}
        <button class="action-btn danger" onclick="deleteRecord('tableBookings','${b.id}')">Delete</button>
      </td>
    </tr>`).join(''):'<tr><td colspan="8" class="empty-state">No bookings found</td></tr>';
}

function renderPartyBookings(){
  const data=DB.get('partyBookings');
  document.getElementById('partyBookingsBody').innerHTML=data.length?data.map(b=>`
    <tr>
      <td><span style="font-family:monospace;font-size:0.78rem;color:var(--text3)">${b.ref}</span></td>
      <td><div style="font-weight:500">${b.firstName} ${b.lastName}</div><div style="font-size:0.78rem;color:var(--text3)">${b.email}</div></td>
      <td>${b.eventType}</td><td>${fmtDate(b.date)}</td><td>${b.guests}</td><td>${b.budget||'—'}</td>
      <td><span class="status-badge status-${b.status}">${b.status}</span></td>
      <td style="display:flex;gap:0.4rem;flex-wrap:wrap">
        <button class="action-btn" onclick="viewBooking('partyBookings','${b.id}')">View</button>
        ${b.status!=='confirmed'?`<button class="action-btn" onclick="changeStatus('partyBookings','${b.id}','confirmed')">Confirm</button>`:''}
        ${b.status!=='cancelled'?`<button class="action-btn danger" onclick="changeStatus('partyBookings','${b.id}','cancelled')">Cancel</button>`:''}
        <button class="action-btn danger" onclick="deleteRecord('partyBookings','${b.id}')">Delete</button>
      </td>
    </tr>`).join(''):'<tr><td colspan="8" class="empty-state">No enquiries found</td></tr>';
}

function renderMessages(){
  const data=DB.get('messages');
  document.getElementById('messagesBody').innerHTML=data.length?data.map(m=>`
    <tr style="${!m.read?'background:rgba(201,168,76,0.04)':''}">
      <td><div style="font-weight:${m.read?400:500}">${m.name}</div></td>
      <td style="font-size:0.82rem;color:var(--text2)">${m.email}</td>
      <td>${m.subject||'—'}</td>
      <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:0.85rem;color:var(--text2)">${m.message}</td>
      <td style="font-size:0.78rem;color:var(--text3)">${new Date(m.created).toLocaleDateString('en-GB')}</td>
      <td style="display:flex;gap:0.4rem">
        <button class="action-btn" onclick="viewMessage('${m.id}')">View</button>
        <button class="action-btn danger" onclick="deleteRecord('messages','${m.id}')">Delete</button>
      </td>
    </tr>`).join(''):'<tr><td colspan="6" class="empty-state">No messages</td></tr>';
}

function renderAvailability(){
  const days=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const avail=DB.get('availability');
  if(!avail||Array.isArray(avail)){
    const a={};days.forEach(d=>{a[d]={lunch:d!=='Mon'&&d!=='Sat',dinner:d!=='Mon'}});
    DB.set('availability',a);
    return renderAvailability();
  }
  document.getElementById('availGrid').innerHTML=days.map(d=>`
    <div class="avail-day">
      <div class="avail-day-name">${d}</div>
      <div class="avail-slot ${avail[d]&&avail[d].lunch?'avail-open':'avail-closed'}" onclick="toggleAvail('${d}','lunch')">Lunch</div>
      <div class="avail-slot ${avail[d]&&avail[d].dinner?'avail-open':'avail-closed'}" onclick="toggleAvail('${d}','dinner')">Dinner</div>
    </div>`).join('');
}

function toggleAvail(day,slot){
  const avail=DB.get('availability');
  if(!avail[day])avail[day]={lunch:false,dinner:false};
  avail[day][slot]=!avail[day][slot];
  DB.set('availability',avail);
  renderAvailability();
  showToast(`${day} ${slot} ${avail[day][slot]?'opened':'closed'}`,'success');
}

// MODAL
let pendingAction=null;
function viewBooking(col,id){
  const b=DB.get(col).find(x=>x.id===id);if(!b)return;
  document.getElementById('modalTitle').textContent='Booking — '+b.ref;
  document.getElementById('modalBody').innerHTML=`
    <div class="modal-row">
      <div class="modal-field"><label>Guest</label><span>${b.firstName} ${b.lastName}</span></div>
      <div class="modal-field"><label>Status</label><span class="status-badge status-${b.status}">${b.status}</span></div>
    </div>
    <div class="modal-row">
      <div class="modal-field"><label>Email</label><span>${b.email}</span></div>
      <div class="modal-field"><label>Phone</label><span>${b.phone||'—'}</span></div>
    </div>
    <div class="modal-row">
      <div class="modal-field"><label>Date</label><span>${fmtDate(b.date)}</span></div>
      <div class="modal-field"><label>Time</label><span>${b.time||'—'}</span></div>
    </div>
    <div class="modal-row">
      <div class="modal-field"><label>Guests</label><span>${b.guests||b.eventType||'—'}</span></div>
      <div class="modal-field"><label>Occasion</label><span>${b.occasion||b.eventType||'—'}</span></div>
    </div>
    ${b.diet?`<div class="modal-field"><label>Dietary</label><span>${b.diet}</span></div>`:''}
    ${b.notes?`<div class="modal-field"><label>Notes</label><span>${b.notes}</span></div>`:''}
    ${b.addOns&&b.addOns.length?`<div class="modal-field"><label>Add-ons</label><span>${b.addOns.join(', ')}</span></div>`:''}
  `;
  document.getElementById('modalConfirmBtn').style.display='none';
  openModal();
}

function viewMessage(id){
  DB.update('messages',id,{read:true});
  const m=DB.get('messages').find(x=>x.id===id);if(!m)return;
  document.getElementById('modalTitle').textContent='Message from '+m.name;
  document.getElementById('modalBody').innerHTML=`
    <div class="modal-row">
      <div class="modal-field"><label>From</label><span>${m.name}</span></div>
      <div class="modal-field"><label>Email</label><span>${m.email}</span></div>
    </div>
    <div class="modal-field"><label>Subject</label><span>${m.subject||'—'}</span></div>
    <div class="modal-field"><label>Message</label><span style="white-space:pre-wrap;line-height:1.7">${m.message}</span></div>
    <div class="modal-field"><label>Received</label><span>${new Date(m.created).toLocaleString('en-GB')}</span></div>
  `;
  document.getElementById('modalConfirmBtn').style.display='none';
  openModal();
  renderMessages();
}

function changeStatus(col,id,status){
  pendingAction={col,id,patch:{status}};
  const b=DB.get(col).find(x=>x.id===id);
  document.getElementById('modalTitle').textContent='Confirm status change';
  document.getElementById('modalBody').innerHTML=`<p style="font-size:0.92rem;color:var(--text2);line-height:1.7">Set booking <strong style="color:var(--text)">${b.ref}</strong> for <strong style="color:var(--text)">${b.firstName} ${b.lastName}</strong> to <span class="status-badge status-${status}">${status}</span>?</p>`;
  document.getElementById('modalConfirmBtn').style.display='';
  openModal();
}

function confirmStatusChange(){
  if(!pendingAction)return;
  DB.update(pendingAction.col,pendingAction.id,pendingAction.patch);
  closeModal();
  showToast('Status updated','success');
  renderAdmin();
  pendingAction=null;
}

function deleteRecord(col,id){
  if(!confirm('Delete this record permanently?'))return;
  DB.delete(col,id);
  showToast('Record deleted','success');
  renderAdmin();
}

function openModal(){document.getElementById('modalOverlay').classList.remove('hidden')}
function closeModal(){document.getElementById('modalOverlay').classList.add('hidden');pendingAction=null}
document.getElementById('modalOverlay').addEventListener('click',e=>{if(e.target===document.getElementById('modalOverlay'))closeModal()});

// TOAST
let toastTimer;
function showToast(msg,type='success'){
  clearTimeout(toastTimer);
  const t=document.getElementById('toast');
  const i=document.getElementById('toastIcon');
  document.getElementById('toastMsg').textContent=msg;
  t.className='toast show '+(type||'success');
  i.textContent=type==='error'?'✕':'✓';
  toastTimer=setTimeout(()=>t.classList.remove('show'),3500);
}

// Init
(function(){
  const d=new Date();d.setDate(d.getDate()+1);
  const ds=d.toISOString().split('T')[0];
  const td=document.getElementById('t-date');
  const pd=document.getElementById('p-date');
  if(td){td.min=ds;td.value=ds}
  if(pd){pd.min=ds;pd.value=ds}
})();
