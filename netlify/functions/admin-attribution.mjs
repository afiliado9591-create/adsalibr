import { getAuth } from 'firebase-admin/auth';
import { db } from './_firebase.mjs';

function json(status,body){return {statusCode:status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'},body:JSON.stringify(body)}}

export async function handler(event){
  try{
    const token=String(event.headers.authorization||'').replace(/^Bearer\s+/i,'').trim();
    if(!token) return json(401,{ok:false,error:'Não autorizado'});
    const decoded=await getAuth().verifyIdToken(token);
    const adminEmail=String(process.env.ADMIN_EMAIL||'').trim().toLowerCase();
    if(!adminEmail||String(decoded.email||'').toLowerCase()!==adminEmail) return json(403,{ok:false,error:'Acesso somente do administrador'});

    const snap=await db().collection('shopads_actions').orderBy('createdAt','desc').limit(1000).get();
    const grouped={};
    for(const doc of snap.docs){
      const x=doc.data()||{};
      const affiliateId=String(x.affiliateId||'sem-divulgador');
      const campaignId=String(x.campaignId||'sem-campanha');
      const key=`${affiliateId}__${campaignId}`;
      if(!grouped[key]) grouped[key]={affiliateId,campaignId,total:0,actions:{}};
      grouped[key].total++;
      grouped[key].actions[x.action]=(grouped[key].actions[x.action]||0)+1;
    }
    return json(200,{ok:true,rows:Object.values(grouped).sort((a,b)=>b.total-a.total)});
  }catch(error){
    console.error('admin attribution',error);
    return json(500,{ok:false,error:'Falha ao consultar atribuição'});
  }
}
