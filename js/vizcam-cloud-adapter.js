/* Integration scaffold; do not load until Supabase project and admin Auth exist.
 * Supply Supabase JS v2 client with public project URL and publishable key.
 */
export function makeVizcamCloud(client) {
  if (!client?.from || !client?.auth || !client?.rpc) throw new Error('Supabase client required');
  async function requireLogin() {
    const {data,error}=await client.auth.getUser();
    if(error || !data?.user)throw new Error('Verified administrator sign-in required');
    return data.user;
  }
  const local=q=>({
    id:q.id,customer:q.customer,date:q.quote_date,total:Number(q.total),
    status:q.status,paidAt:q.paid_at,rejectedAt:q.rejected_at,
    createdAt:q.created_at,updatedAt:q.updated_at,data:q.details
  });
  const cloud=q=>({
    id:q.id,customer:q.customer,quote_date:q.date,total:Number(q.total)||0,
    status:q.status||'pending',
    paid_at:q.status==='completed'?q.paidAt||new Date().toISOString():null,
    rejected_at:q.status==='rejected'?q.rejectedAt||new Date().toISOString():null,
    details:q.data||{}
  });
  return {
    async signInEmail(email,redirect='https://www.vizcam.in/admin.html'){
      const {error}=await client.auth.signInWithOtp({
        email,options:{emailRedirectTo:redirect,shouldCreateUser:false}
      });
      if(error)throw error;
    },
    async signOut(){const {error}=await client.auth.signOut();if(error)throw error;},
    async list(){
      await requireLogin();
      const {data,error}=await client.from('vizcam_quotations').select('*').order('created_at',{ascending:false});
      if(error)throw error;return (data||[]).map(local);
    },
    async nextNumber(date){
      await requireLogin();
      const {data,error}=await client.rpc('next_vizcam_quote_number',{p_quote_day:date});
      if(error)throw error;return data;
    },
    async save(q,{overwrite=false}={}){
      await requireLogin();
      const query=overwrite?client.from('vizcam_quotations').upsert(cloud(q),{onConflict:'id'}):client.from('vizcam_quotations').insert(cloud(q));
      const {data,error}=await query.select().single();
      if(error)throw error;return local(data);
    },
    async changeStatus(id,status){
      await requireLogin();
      if(!['pending','completed','rejected'].includes(status))throw new Error('Invalid status');
      const now=new Date().toISOString();
      const {data,error}=await client.from('vizcam_quotations')
        .update({status,updated_at:now,paid_at:status==='completed'?now:null,rejected_at:status==='rejected'?now:null})
        .eq('id',id).select().single();
      if(error)throw error;return local(data);
    }
  };
}
