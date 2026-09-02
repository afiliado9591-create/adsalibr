import crypto from 'node:crypto';
import { db, FieldValue } from './_firebase.mjs';

const clean=(v,max=120)=>String(v||'').trim().slice(0,max);
const safeId=v=>/^[a-zA-Z0-9_-]{1,120}$/.test(v);

export async function handler(event){
  try{
    const q=event.queryStringParameters||{};
    const campaignId=clean(q.campaign||q.c,120);
    const affiliateId=clean(q.affiliate||q.a||q.ref,120);
    const targetRaw=clean(q.to,2000);
    if(!safeId(campaignId)||!safeId(affiliateId)||!targetRaw) return {statusCode:400,body:'Link ShopAds inválido'};
    let target;
    try{target=new URL(targetRaw)}catch{return {statusCode:400,body:'Destino inválido'}}
    if(target.protocol!=='https:'&&target.protocol!=='http:') return {statusCode:400,body:'Destino inválido'};

    const clickId=crypto.randomUUID();
    const ip=clean(event.headers['x-nf-client-connection-ip']||event.headers['x-forwarded-for']||'',200);
    const ua=clean(event.headers['user-agent']||'',500);
    const secret=process.env.CLICK_HASH_SECRET||'shopads';
    const visitorHash=crypto.createHmac('sha256',secret).update(`${ip}|${ua}`).digest('hex');

    await db().collection('shopads_clicks').doc(clickId).set({
      clickId,campaignId,affiliateId,target:target.toString(),visitorHash,
      userAgent:ua,createdAt:FieldValue.serverTimestamp(),
      source:'shopads'
    });

    target.searchParams.set('shopads_click',clickId);
    target.searchParams.set('shopads_campaign',campaignId);
    target.searchParams.set('shopads_affiliate',affiliateId);

    return {statusCode:302,headers:{Location:target.toString(),'Cache-Control':'no-store'},body:''};
  }catch(error){
    console.error('shopads click',error);
    return {statusCode:500,body:'Não foi possível registrar o clique'};
  }
}
