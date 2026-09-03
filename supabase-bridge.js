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
      window.__sharedSupabase=client; window.__supabaseReady=Promise.resolve(client);
      window.dispatchEvent(new CustomEvent('mdkorim-supabase-ready')); return client;
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
  const originalDbSetAll=window.dbSetAll;
  if(typeof originalDbSetAll==='function')window.dbSetAll=function(t,arr){originalDbSetAll(t,arr); if(syncTables.has(table(t))&&Array.isArray(arr))ready.then(async c=>{for(const row of arr){const clean={...row};delete clean.id;delete clean.created_at;delete clean.updated_at;const {error}=await c.from(table(t)).insert({data:clean});if(error)console.error(error);}}).catch(console.error);};
})();