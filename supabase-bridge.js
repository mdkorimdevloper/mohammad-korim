(async function(){
  const SUPABASE_URL='https://etxdjknttfwaolpyoxfp.supabase.co';
  const SUPABASE_KEY='sb_publishable_scbgKsavJ9d--uD8Xxx7AQ_Jh0H8EkS';
  if(!window.supabase){
    await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';s.onload=resolve;s.onerror=reject;document.head.appendChild(s);});
  }
  const client=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
  const map={reviews:'site_reviews',orders:'site_orders',team:'team_members'};
  const table=t=>map[t]||t;
  window.getRows=async function(t){const {data,error}=await client.from(table(t)).select('*').order('created_at',{ascending:true});if(error){console.error(error);return []}return data||[]};
  window.insertRow=async function(t,obj){const {data,error}=await client.from(table(t)).insert(obj).select().single();if(error)console.error(error);return data||null};
  window.updateRow=async function(t,id,obj){const {data,error}=await client.from(table(t)).update(obj).eq('id',id).select().single();if(error)console.error(error);return data||null};
  window.deleteRow=async function(t,id){const {error}=await client.from(table(t)).delete().eq('id',id);if(error)console.error(error);return !error};
  window.getSetting=async function(key){const {data,error}=await client.from('site_settings').select('value').eq('key',key).maybeSingle();if(error){console.error(error);return null}return data?data.value:null};
  window.upsertSetting=async function(key,value){const {data,error}=await client.from('site_settings').upsert({key,value,updated_at:new Date().toISOString()},{onConflict:'key'}).select().single();if(error)console.error(error);return data||null};
  window.__sharedSupabase=client;
  console.log('MD Korim: shared Supabase connection ready');
})();