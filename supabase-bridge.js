(function(){
  const SUPABASE_URL='https://etxdjknttfwaolpyoxfp.supabase.co';
  const SUPABASE_KEY='sb_publishable_scbgKsavJ9d--uD8Xxx7AQ_Jh0H8EkS';
  const map={reviews:'site_reviews',orders:'site_orders',team:'team_members'};
  const table=t=>map[t]||t;
  const syncTables=new Set(['services','portfolio','team_members','site_reviews','site_orders','contact_messages','team_messages']);
  const orderedTables=new Set([...syncTables]);
  let client=null;
  const ready=(async()=>{
    try{
      if(!window.supabase){
        await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';s.onload=resolve;s.onerror=reject;document.head.appendChild(s);});
      }
      client=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
      window.__sharedSupabase=client;
      window.__supabaseReady=Promise.resolve(client);
      window.dispatchEvent(new CustomEvent('mdkorim-supabase-ready'));
      console.log('MD Korim: shared Supabase connection ready');
      return client;
    }catch(e){console.error('MD Korim Supabase init failed',e);throw e;}
  })();
  window.__supabaseReady=ready;
  window.getRows=async function(t){
    const c=await ready; let q=c.from(table(t)).select('*');
    if(orderedTables.has(table(t))) q=q.order('created_at',{ascending:true});
    else if(t==='site_settings') q=q.order('key',{ascending:true});
    const {data,error}=await q;
    if(error){console.error('Supabase getRows '+t,error);return []}
    return data||[];
  };
  window.insertRow=async function(t,obj){
    const c=await ready; const clean={...obj};
    if(clean.tags && typeof clean.tags==='string'){try{clean.tags=JSON.parse(clean.tags)}catch{}}
    if(clean.id!==undefined && syncTables.has(table(t))) delete clean.id;
    const {data,error}=await c.from(table(t)).insert(clean).select().single();
    if(error){console.error('Supabase insertRow '+t,error);return null}
    return data?[data]:null;
  };
  window.updateRow=async function(t,id,obj){
    const c=await ready; const clean={...obj};
    if(clean.tags && typeof clean.tags==='string'){try{clean.tags=JSON.parse(clean.tags)}catch{}}
    const {data,error}=await c.from(table(t)).update(clean).eq('id',id).select().single();
    if(error){console.error('Supabase updateRow '+t,error);return null}
    return data?[data]:null;
  };
  window.deleteRow=async function(t,id){
    const c=await ready; const {error}=await c.from(table(t)).delete().eq('id',id);
    if(error){console.error('Supabase deleteRow '+t,error);return false}
    return true;
  };
  window.getSetting=async function(key){
    const c=await ready; const {data,error}=await c.from('site_settings').select('value').eq('key',key).maybeSingle();
    if(error){console.error('Supabase getSetting',error);return null}
    return data?data.value:null;
  };
  window.upsertSetting=async function(key,value){
    const c=await ready; const {data,error}=await c.from('site_settings').upsert({key,value,updated_at:new Date().toISOString()},{onConflict:'key'}).select().single();
    if(error){console.error('Supabase upsertSetting',error);return null}
    return data||null;
  };
  const originalDbSetAll=window.dbSetAll;
  if(typeof originalDbSetAll==='function'){
    window.dbSetAll=function(t,arr){
      originalDbSetAll(t,arr);
      if(syncTables.has(table(t)) && Array.isArray(arr)){
        ready.then(async c=>{
          for(const row of arr){
            const clean={...row};
            if(clean.tags && typeof clean.tags==='string'){try{clean.tags=JSON.parse(clean.tags)}catch{}}
            const {error}=await c.from(table(t)).upsert(clean,{onConflict:'id'});
            if(error) console.error('Supabase legacy sync '+t,error);
          }
        }).catch(e=>console.error('Supabase legacy sync init',e));
      }
    };
  }
})();