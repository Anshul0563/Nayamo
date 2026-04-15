import { useEffect, useMemo, useState } from "react";
import axios from "axios";

export default function DashboardV3(){
 const [page,setPage]=useState('dashboard');
 const [data,setData]=useState({data:{},users:[],orders:[],products:[]});
 const [loading,setLoading]=useState(true);
 const token=localStorage.getItem('token');
 const api=axios.create({baseURL:'http://localhost:5000/api/admin',headers:{Authorization:`Bearer ${token}`}});
 const load=async()=>{try{setLoading(true);const [a,b,c,d]=await Promise.all([api.get('/dashboard'),api.get('/users'),api.get('/orders'),api.get('/products')]);setData({data:a.data.data,users:b.data.users,orders:c.data.orders,products:d.data.products});}finally{setLoading(false)}};
 useEffect(()=>{if(!token){window.location.href='/login';return;}load();},[]);
 const revenue = data.data.totalRevenue||0;
 const stats=[['Users',data.data.totalUsers||0],['Orders',data.data.totalOrders||0],['Products',data.data.totalProducts||0],['Revenue',`₹${revenue}`]];
 const filtered=useMemo(()=>data,[data]);
 const Card=({t,v})=><div className='rounded-3xl bg-white/5 border border-white/10 p-5 shadow-xl'><div className='text-zinc-400'>{t}</div><div className='text-3xl font-bold mt-2'>{v}</div></div>;
 const Table=({rows,cols})=><div className='rounded-3xl bg-white/5 border border-white/10 p-5 overflow-auto'><table className='w-full text-sm'><thead><tr className='text-zinc-400 border-b border-white/10'>{cols.map(c=><th key={c} className='text-left py-3'>{c}</th>)}</tr></thead><tbody>{rows.map((r,i)=><tr key={i} className='border-b border-white/5'>{cols.map(c=><td key={c} className='py-3'>{r[c]}</td>)}</tr>)}</tbody></table></div>;
 if(loading) return <div className='min-h-screen grid place-items-center bg-black text-white'>Loading...</div>;
 return <div className='min-h-screen bg-gradient-to-br from-black via-zinc-950 to-zinc-900 text-white flex'>
 <aside className='w-72 p-6 border-r border-white/10 hidden md:block'>
 <h1 className='text-3xl font-bold'>Nayamo 💎</h1><p className='text-zinc-400 text-sm'>Luxury Admin</p>
 <div className='grid gap-2 mt-8'>{['dashboard','users','orders','products'].map(m=><button key={m} onClick={()=>setPage(m)} className={`px-4 py-3 rounded-2xl text-left capitalize ${page===m?'bg-white text-black':'bg-white/5 hover:bg-white/10'}`}>{m}</button>)}</div>
 <button onClick={()=>{localStorage.removeItem('token');window.location.href='/login'}} className='w-full mt-8 bg-red-500 rounded-2xl p-3'>Logout</button>
 </aside>
 <main className='flex-1 p-6 md:p-8'>
 <div className='flex justify-between items-center gap-4 mb-6'><div><h2 className='text-4xl font-bold capitalize'>{page}</h2><p className='text-zinc-400'>Manage your store professionally</p></div><button onClick={load} className='px-4 py-3 rounded-2xl bg-white/10'>Refresh</button></div>
 {page==='dashboard' && <><div className='grid md:grid-cols-2 xl:grid-cols-4 gap-5'>{stats.map(s=><Card key={s[0]} t={s[0]} v={s[1]}/> )}</div><div className='grid lg:grid-cols-2 gap-6 mt-6'><div className='rounded-3xl bg-white/5 border border-white/10 p-5'><h3 className='text-xl font-semibold'>Recent Orders</h3>{(data.data.recentOrders||[]).map(o=><div key={o._id} className='mt-3 p-3 rounded-2xl bg-black/30'>{o.user?.name} • ₹{o.totalPrice} • {o.status}</div>)}</div><div className='rounded-3xl bg-white/5 border border-white/10 p-5'><h3 className='text-xl font-semibold'>Quick Actions</h3><div className='grid gap-3 mt-4'><button className='p-3 rounded-2xl bg-white/10'>Add Product</button><button className='p-3 rounded-2xl bg-white/10'>Manage Orders</button><button className='p-3 rounded-2xl bg-white/10'>Export Report</button></div></div></div></>}
 {page==='users' && <Table cols={['Name','Email','Role']} rows={filtered.users.map(u=>({Name:u.name,Email:u.email,Role:u.role}))}/>}
 {page==='orders' && <Table cols={['Customer','Amount','Status']} rows={filtered.orders.map(o=>({Customer:o.user?.name||'User',Amount:`₹${o.totalPrice}`,Status:o.status}))}/>}
 {page==='products' && <Table cols={['Title','Price','Stock','Category']} rows={filtered.products.map(p=>({Title:p.title,Price:`₹${p.price}`,Stock:p.stock,Category:p.category}))}/>}
 </main></div>
}
