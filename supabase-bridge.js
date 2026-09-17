(function(){
  const SUPABASE_URL='https://ajnwfanzvdrjzpgnduhx.supabase.co';
  const SUPABASE_KEY='sb_publishable_m5aABZWO2OT6jQE8asfmpw_4c9ddAOj';
  const map={reviews:'site_reviews',orders:'site_orders',team:'team_members'};
  const table=t=>map[t]||t;
  const syncTables=new Set(['services','portfolio','team_members','site_reviews','site_orders','contact_messages','team_messages']);
  const ready=(async()=>{
    try{
      if(!window.supabase){await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';s.onload=resolve;s.onerror=reject;document.head.appendChild(s);});}
      const client=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
      window.__sharedSupabase=client; window.__supabaseReady=Promise.resolve(client); window.dispatchEvent(new CustomEvent('mdkorim-supabase-ready')); return client;
    }catch(e){console.error('MD Korim Supabase init failed',e);throw e;}
  })();
  window.__supabaseReady=ready;
  const unpack=row=>row?Object.assign({},row.data||{},{id:row.id,created_at:row.created_at,updated_at:row.updated_at}):null;
  window.getRows=async function(t){
    const c=await ready;
    if(t==='site_settings'){const {data,error}=await c.from('site_settings').select('*').order('key'); if(error){console.error(error);return []} return data||[];}
    const {data,error}=await c.from(table(t)).select('id,data,created_at,updated_at').order('created_at',{ascending:true});
    if(error){console.error('Supabase getRows '+t,error);return []} return (data||[]).map(unpack);
  };
  window.insertRow=async function(t,obj){
    const c=await ready;
    if(t==='site_settings'){const {data,error}=await c.from('site_settings').upsert({key:obj.key,value:obj.value||{},updated_at:new Date().toISOString()},{onConflict:'key'}).select().single(); if(error){console.error(error);return null} return data;}
    const clean={...obj}; delete clean.id; delete clean.created_at; delete clean.updated_at;
    const {data,error}=await c.from(table(t)).insert({data:clean}).select('id,data,created_at,updated_at').single();
    if(error){console.error('Supabase insertRow '+t,error);return null} return unpack(data);
  };
  window.updateRow=async function(t,id,obj){
    const c=await ready;
    if(t==='site_settings'){const {data,error}=await c.from('site_settings').update({value:obj.value||{},updated_at:new Date().toISOString()}).eq('key',id).select().single(); if(error){console.error(error);return null} return data;}
    const clean={...obj}; delete clean.id; delete clean.created_at; delete clean.updated_at;
    const {data,error}=await c.from(table(t)).update({data:clean,updated_at:new Date().toISOString()}).eq('id',id).select('id,data,created_at,updated_at').single();
    if(error){console.error('Supabase updateRow '+t,error);return null} return unpack(data);
  };
  window.deleteRow=async function(t,id){const c=await ready; const {error}=await c.from(table(t)).delete().eq('id',id); if(error){console.error(error);return false} return true;};
  window.getSetting=async function(key){const c=await ready; const {data,error}=await c.from('site_settings').select('value').eq('key',key).maybeSingle(); if(error){console.error(error);return null} return data?data.value:null;};
  window.upsertSetting=async function(key,value){const c=await ready; const {data,error}=await c.from('site_settings').upsert({key,value,updated_at:new Date().toISOString()},{onConflict:'key'}).select().single(); if(error){console.error(error);return null} return data;};

  // Apply the new transparent profile image everywhere the old profile photo was used.
  const NEW_PROFILE_IMAGE='https://i.postimg.cc/zGjXyqgJ/1789666143836-removebg-preview.png';
  function applyNewProfileImage(){
    document.querySelectorAll('.hero-img img,.about-img,.team-avatar,.profile-image img,img[data-profile-image],img.profile-img,img.avatar').forEach(img=>{
      img.src=NEW_PROFILE_IMAGE;
      img.removeAttribute('srcset');
      img.setAttribute('data-profile-image','true');
    });
  }
  ready.then(applyNewProfileImage).catch(console.error);
  window.addEventListener('mdkorim-supabase-ready',applyNewProfileImage);
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',applyNewProfileImage); else applyNewProfileImage();
  const observer=new MutationObserver(applyNewProfileImage);
  observer.observe(document.documentElement,{childList:true,subtree:true});

  const originalDbSetAll=window.dbSetAll;
  if(typeof originalDbSetAll==='function')window.dbSetAll=function(t,arr){originalDbSetAll(t,arr); if(syncTables.has(table(t))&&Array.isArray(arr))ready.then(async c=>{for(const row of arr){const clean={...row};delete clean.id;delete clean.created_at;delete clean.updated_at;const {error}=await c.from(table(t)).insert({data:clean});if(error)console.error(error);}}).catch(console.error);};

  // Requested profile/header and hero customization.
  function initRequestedDesign(){
    if(document.body.dataset.requestedDesign==='true') return;
    document.body.dataset.requestedDesign='true';
    const style=document.createElement('style');
    style.textContent=`
      .md-profile-header{background:linear-gradient(135deg,#145e2e,#1a7a3c,#23a355);color:#fff;padding:14px 5%;box-shadow:0 4px 18px rgba(20,94,46,.22);position:relative;z-index:5;}
      .md-profile-inner{max-width:1200px;margin:0 auto;display:flex;align-items:center;justify-content:center;gap:14px;}
      .md-profile-avatar{width:62px;height:62px;object-fit:contain;display:block;flex-shrink:0;}
      .md-profile-name{font-family:'Poppins',sans-serif;font-size:1.35rem;font-weight:800;letter-spacing:-.3px;}
      .md-profile-sub{font-size:.76rem;opacity:.86;margin-top:2px;}
      .hero-img{display:none!important;}
      .hero-text h1{font-size:clamp(1.6rem,4vw,2.6rem)!important;}
      .hero-text h1 span{display:none!important;}
      .hero-role-line{display:none!important;}
      .hero-eyebrow{display:none!important;}
      .why-card{display:block!important;}
      .why-icon{display:none!important;}
      footer{background:#1a7a3c!important;color:#eaf7ee!important;}
      .footer-brand h3,.footer-col h4{color:#fff!important;}
      .footer-brand p,.footer-col ul li a{color:#eaf7ee!important;}
      .footer-social a{background:rgba(255,255,255,.15)!important;color:#fff!important;}
      .footer-bottom{border-top-color:rgba(255,255,255,.25)!important;color:#d8f0df!important;}
      @media(max-width:600px){.md-profile-inner{justify-content:flex-start;}.md-profile-avatar{width:54px;height:54px;}.md-profile-name{font-size:1.15rem;}.md-profile-sub{font-size:.7rem;}}
    `;
    document.head.appendChild(style);

    const nav=document.querySelector('nav');
    if(nav && !document.querySelector('.md-profile-header')){
      const header=document.createElement('div');
      header.className='md-profile-header';
      header.innerHTML=`<div class="md-profile-inner"><img class="md-profile-avatar" src="${NEW_PROFILE_IMAGE}" alt="MD Korim"><div><div class="md-profile-name">MD Korim</div><div class="md-profile-sub">Full Stack Developer</div></div></div>`;
      nav.insertAdjacentElement('afterend',header);
    }

    const hero=document.querySelector('.hero-text');
    if(hero){
      const h1=hero.querySelector('h1');
      if(h1) h1.innerHTML='I\'m MD Korim';
    }
    const footerTitle=document.querySelector('.footer-brand h3');
    if(footerTitle) footerTitle.textContent="I'm MD Korim";
    const footerBottom=document.querySelector('.footer-bottom');
    if(footerBottom){
      const spans=footerBottom.querySelectorAll('span');
      if(spans.length>1) spans[1].textContent="I'm MD Korim";
    }
    applyNewProfileImage();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',initRequestedDesign); else initRequestedDesign();
})();