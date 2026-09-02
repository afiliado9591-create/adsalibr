import { db, FieldValue } from './_firebase.mjs';

const ALLOWED=new Set(['page_view','download_chatshop','signup_intent','signup','catalog_created','catalog_published','upgrade_intent','checkout_started','payment_approved','purchase']);
const clean=(v,max=180)=>String(v||'').trim().slice(0,max);

function cors(origin=''){
  const ok=origin==='https://alibr.com.br'||origin==='https://www.alibr.com.br'||origin.endsWith('.alibr.com.br')||origin==='https://adsalibr.netlify.app';
  return {'Access-Control-Allow-Origin':ok?origin:'https://alibr.com.br','Access-Control-Allow-Headers':'content-type','Access-Control-Allow-Methods':'POST,OPTIONS','Vary':'Origin','Cache-Control':'no-store'};
}

export async function handler(event){
  const headers=cors(clean(event.headers.origin||'',300));
  if(event.httpMethod==='OPTIONS') return {statusCode:204,headers,body:''};
  if(event.httpMethod!=='POST') return {statusCode:405,headers,body:'Método não permitido'};
  try{
    const body=JSON.parse(event.body||'{}');
    const clickId=clean(body.clickId,120);
    const action=clean(body.action,80);
    if(!clickId||!ALLOWED.has(action)) return {statusCode:400,headers,body:JSON.stringify({ok:false,error:'Ação inválida'})};
    const clickRef=db().collection('shopads_clicks').doc(clickId);
    const clickSnap=await clickRef.get();
    if(!clickSnap.exists) return {statusCode:404,headers,body:JSON.stringify({ok:false,error:'Clique não encontrado'})};
    const click=clickSnap.data()||{};
    const actionId=`${clickId}_${action}`.replace(/[^a-zA-Z0-9_-]/g,'_').slice(0,240);
    await db().collection('shopads_actions').doc(actionId).set({
      actionId,clickId,action,
      campaignId:click.campaignId||'',affiliateId:click.affiliateId||'',
      page:clean(body.page,1000),value:Number.isFinite(Number(body.value))?Number(body.value):null,
      metadata:body.metadata&&typeof body.metadata==='object'?body.metadata:{},
      createdAt:FieldValue.serverTimestamp(),source:'shopads'
    },{merge:false});
    return {statusCode:200,headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify({ok:true,affiliateId:click.affiliateId,campaignId:click.campaignId,action})};
  }catch(error){
    console.error('shopads action',error);
    return {statusCode:500,headers,body:JSON.stringify({ok:false,error:'Falha ao registrar ação'})};
  }
}
