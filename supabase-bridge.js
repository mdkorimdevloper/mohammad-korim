(function(){
  const SUPABASE_URL='https://ajnwfanzvdrjzpgnduhx.supabase.co';
  const SUPABASE_KEY='sb_publishable_m5aABZWO2OT6jQE8asfmpw_4c9ddAOj';
  const map={reviews:'site_reviews',orders:'site_orders',team:'team_members'};
  const table=t=>map[t]||t;
  const syncTables=new Set(['services','portfolio','team_members','site_reviews','site_orders','contact_messages','team_messages']);
  const ready=(async()=>{try{if(!window.supabase){await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';s.onload=resolve;s.onerror=reject;document.head.appendChild(s);});}const client=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);window.__sharedSupabase=client;window.__supabaseReady=Promise.resolve(client);return client;}catch(e){console.error('MD Korim Supabase init failed',e);throw e;}})();
  window.__supabaseReady=ready;
  const unpack=row=>row?Object.assign({},row.data||{},{id:row.id,created_at:row.created_at,updated_at:row.updated_at}):null;
  window.getRows=async function(t){const c=await ready;if(t==='site_settings'){const {data,error}=await c.from('site_settings').select('*').order('key');if(error){console.error(error);return []}return data||[];}const {data,error}=await c.from(table(t)).select('id,data,created_at,updated_at').order('created_at',{ascending:true});if(error){console.error('Supabase getRows '+t,error);return []}return(data||[]).map(unpack);};
  window.insertRow=async function(t,obj){const c=await ready;if(t==='site_settings'){const {data,error}=await c.from('site_settings').upsert({key:obj.key,value:obj.value||{},updated_at:new Date().toISOString()},{onConflict:'key'}).select().single();if(error){console.error(error);return null}return data;}const clean={...obj};delete clean.id;delete clean.created_at;delete clean.updated_at;const {data,error}=await c.from(table(t)).insert({data:clean}).select('id,data,created_at,updated_at').single();if(error){console.error('Supabase insertRow '+t,error);return null}return unpack(data);};
  window.updateRow=async function(t,id,obj){const c=await ready;if(t==='site_settings'){const {data,error}=await c.from('site_settings').update({value:obj.value||{},updated_at:new Date().toISOString()}).eq('key',id).select().single();if(error){console.error(error);return null}return data;}const clean={...obj};delete clean.id;delete clean.created_at;delete clean.updated_at;const {data,error}=await c.from(table(t)).update({data:clean,updated_at:new Date().toISOString()}).eq('id',id).select('id,data,created_at,updated_at').single();if(error){console.error('Supabase updateRow '+t,error);return null}return unpack(data);};
  window.deleteRow=async function(t,id){const c=await ready;const {error}=await c.from(table(t)).delete().eq('id',id);if(error){console.error(error);return false}return true;};
  window.getSetting=async function(key){const c=await ready;const {data,error}=await c.from('site_settings').select('value').eq('key',key).maybeSingle();if(error){console.error(error);return null}return data?data.value:null;};
  window.upsertSetting=async function(key,value){const c=await ready;const {data,error}=await c.from('site_settings').upsert({key,value,updated_at:new Date().toISOString()},{onConflict:'key'}).select().single();if(error){console.error(error);return null}return data;};
  const originalDbSetAll=window.dbSetAll;if(typeof originalDbSetAll==='function')window.dbSetAll=function(t,arr){originalDbSetAll(t,arr);if(syncTables.has(table(t))&&Array.isArray(arr))ready.then(async c=>{for(const row of arr){const clean={...row};delete clean.id;delete clean.created_at;delete clean.updated_at;const {error}=await c.from(table(t)).insert({data:clean});if(error)console.error(error);}}).catch(console.error);};

  const DEFAULT_PROFILE='https://i.postimg.cc/zGjXyqgJ/1789666143836-removebg-preview.png';
  const DEFAULT_ABOUT='https://i.postimg.cc/rs7BS7xF/file-000000003d948207ac0d1ae3ccdc0cc7.png';
  function setText(el,v){if(el&&v!==undefined)el.textContent=v;}
  function applySiteContent(c){
    c=c||{};
    const heroTitle=c.heroTitle||"I'm MD Korim";
    const heroImg=c.heroImage||DEFAULT_PROFILE;
    const aboutImg=c.aboutImage||DEFAULT_ABOUT;
    const hero=document.querySelector('.hero-text h1');if(hero)hero.textContent=heroTitle;
    document.querySelectorAll('.hero-img img').forEach(img=>{img.src=heroImg;img.removeAttribute('srcset');});
    const navLogo=document.querySelector('nav .logo');if(navLogo){navLogo.innerHTML=`<img class="md-nav-avatar" src="${heroImg}" alt="MD Korim"><span class="md-nav-name">MD Korim</span>`;}
    const about=document.querySelector('.about-img');if(about){about.src=aboutImg;about.removeAttribute('srcset');}
    const aboutIntro=document.querySelector('.about-intro p');if(aboutIntro&&c.aboutIntro)setText(aboutIntro,c.aboutIntro);
    const aboutPs=document.querySelectorAll('.about-intro p');if(aboutPs[1]&&c.aboutSecond)setText(aboutPs[1],c.aboutSecond);
    const stats=document.querySelectorAll('.about-stats .stat-box');if(stats.length>=3){if(c.projectsDone)setText(stats[0].querySelector('.stat-num'),c.projectsDone);if(c.webProjects)setText(stats[1].querySelector('.stat-num'),c.webProjects);if(c.softwareProjects)setText(stats[2].querySelector('.stat-num'),c.softwareProjects);}
    const journeys=document.querySelectorAll('.about-journey');if(journeys.length>=1){if(c.journeyText)setText(journeys[0].querySelector('p'),c.journeyText);const cards=journeys[0].querySelectorAll('.proj-card');if(cards.length>=3){if(c.journeyWeb)setText(cards[0].querySelector('.proj-num'),c.journeyWeb);if(c.journeySoftware)setText(cards[1].querySelector('.proj-num'),c.journeySoftware);if(c.journeySeo)setText(cards[2].querySelector('.proj-num'),c.journeySeo);}}if(journeys.length>=2&&c.visionText)setText(journeys[1].querySelector('p'),c.visionText);
  }
  function initRequestedDesign(){
    if(document.body.dataset.requestedDesign==='true')return;document.body.dataset.requestedDesign='true';
    const style=document.createElement('style');style.textContent=`
      nav .logo{display:flex!important;align-items:center!important;gap:8px!important;}
      nav .logo .md-nav-avatar{width:34px!important;height:34px!important;border-radius:50%!important;object-fit:cover!important;display:block!important;border:2px solid var(--green)!important;}
      nav .logo .md-nav-name{font-family:'Poppins',sans-serif!important;font-size:1rem!important;font-weight:800!important;color:var(--green)!important;line-height:1!important;}
      .hero-img{display:block!important;visibility:visible!important;opacity:1!important;}
      .hero-img img{display:block!important;visibility:visible!important;opacity:1!important;width:auto!important;max-width:100%!important;}
      .hero-text h1{font-size:clamp(1.6rem,4vw,2.6rem)!important;}
      .hero-text h1 span,.hero-role-line,.hero-eyebrow{display:none!important;}
      .why-card{display:block!important;}.why-icon{display:none!important;}
      #page-about>section{background:#1a7a3c!important;color:#fff!important;}
      #page-about .section-title h2,#page-about .section-title p,#page-about h2,#page-about h3,#page-about p,#page-about .subtitle,#page-about .stat-label,#page-about .about-journey p{color:#fff!important;}
      #page-about .about-header,#page-about .about-journey{color:#fff!important;}
      #page-about .stat-box,#page-about .proj-card{background:rgba(255,255,255,.12)!important;border-color:rgba(255,255,255,.25)!important;}
      footer{background:#1a7a3c!important;color:#eaf7ee!important;}
      .footer-brand h3,.footer-col h4{color:#fff!important;}.footer-brand p,.footer-col ul li a{color:#eaf7ee!important;}
      .footer-social a{background:rgba(255,255,255,.15)!important;color:#fff!important;}.footer-bottom{border-top-color:rgba(255,255,255,.25)!important;color:#d8f0df!important;}
      @media(max-width:600px){nav .logo .md-nav-avatar{width:32px!important;height:32px!important;}nav .logo .md-nav-name{font-size:.92rem!important;}}
    `;document.head.appendChild(style);
    const oldHeader=document.querySelector('.md-profile-header');if(oldHeader)oldHeader.remove();
    const footerTitle=document.querySelector('.footer-brand h3');setText(footerTitle,"I'm MD Korim");
    const footerBottom=document.querySelector('.footer-bottom');if(footerBottom){const spans=footerBottom.querySelectorAll('span');if(spans.length>1)setText(spans[1],"I'm MD Korim");}
  }
  async function loadSiteContent(){try{const c=await window.getSetting('siteContent');applySiteContent(c||{});}catch(e){console.error('siteContent load failed',e);}}
  ready.then(()=>{initRequestedDesign();return loadSiteContent();}).catch(console.error);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{initRequestedDesign();loadSiteContent();});else{initRequestedDesign();loadSiteContent();}
})();