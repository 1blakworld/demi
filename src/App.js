import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

// ─── SUPABASE ─────────────────────────────────────────────────────────────────
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);
const RESTAURANT_ID = "d17e42c0-e23b-4395-9b4a-78b1e60f5a71";
const ADMIN_EMAIL   = "admin@blakautomations.com";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const C = {
  bg:"#FFFFFF",      // page background — pure white
  surface:"#F7F7F7", // sidebar, input backgrounds — off-white
  card:"#FFFFFF",    // cards — white with border
  border:"#E4E4E7",  // borders — light grey
  accent:"#0A0A0B",  // PRIMARY ACCENT — pure black
  text:"#0A0A0B",    // body text — pure black
  muted:"#71717A",   // secondary text — medium grey
  success:"#16A34A", // green — slightly deeper for white bg
  danger:"#DC2626",  // red — slightly deeper for white bg
  info:"#2563EB",    // blue — slightly deeper for white bg
  purple:"#7C3AED",  // purple
  pink:"#DB2777",    // pink
  teal:"#0D9488",    // teal
  // Extra tokens for the white theme
  hover:"#F4F4F5",   // nav item hover
  divider:"#E4E4E7", // dividers
  subtle:"#FAFAFA",  // table alternating rows
};
const R = { card:12, input:8, pill:20 };

// Kitchen station colour map
const STATION = {
  grill:{ bg:"#FEF2F2", bd:"#FECACA", tx:"#DC2626" },
  bar:  { bg:"#EFF6FF", bd:"#BFDBFE", tx:"#2563EB" },
  fry:  { bg:"#FFFBEB", bd:"#FDE68A", tx:"#D97706" },
  hot:  { bg:"#F5F3FF", bd:"#DDD6FE", tx:"#7C3AED" },
};

function getStation(cat) {
  const n = (cat||"").toLowerCase();
  if (n.includes("burger")||n.includes("shawarma")||n.includes("sandwich")) return "grill";
  if (n.includes("rice")||n.includes("pasta")||n.includes("porridge"))      return "hot";
  if (n.includes("side"))                                                    return "fry";
  return "bar";
}

function timeAgo(d){
  const m=Math.floor((Date.now()-new Date(d))/60000);
  return m<1?"just now":m<60?`${m}m ago`:`${Math.floor(m/60)}h ago`;
}

function safeNum(v,fallback=0){
  const n=Number(v);
  return isNaN(n)?fallback:n;
}

function ConfirmBtn({ label, confirmMsg, onConfirm, variant="danger", size="sm" }) {
  const [confirming,setConfirming]=useState(false);
  if(confirming) return (
    <div style={{display:"flex",gap:4,alignItems:"center"}}>
      <span style={{fontSize:11,color:"#EF4444"}}>Sure?</span>
      <Btn label="Yes" onClick={()=>{setConfirming(false);onConfirm();}} variant="danger" size={size}/>
      <Btn label="No" onClick={()=>setConfirming(false)} variant="ghost" size={size}/>
    </div>
  );
  return <Btn label={label} onClick={()=>setConfirming(true)} variant={variant} size={size}/>;
}

const ROLE_MODULES = {
  admin:   ["overview","orders","kitchen","dispatch","loyalty","menu","inventory","analytics","campaigns","tables","reports","bot","settings","admin"],
  owner:   ["overview","orders","kitchen","dispatch","loyalty","menu","inventory","analytics","campaigns","tables","reports","bot","settings"],
  manager: ["overview","orders","kitchen","dispatch","loyalty","menu","inventory","analytics"],
  kitchen: ["kitchen"],
  cashier: ["overview","orders","menu"],
};

const ALL_MODULES = [
  { id:"overview",   icon:"◈", label:"Overview"   },
  { id:"orders",     icon:"◎", label:"Orders"      },
  { id:"kitchen",    icon:"⊡", label:"Kitchen"     },
  { id:"dispatch",   icon:"◉", label:"Dispatch"    },
  { id:"loyalty",    icon:"◇", label:"Loyalty"     },
  { id:"menu",       icon:"≡", label:"Menu"        },
  { id:"inventory",  icon:"⊟", label:"Inventory"   },
  { id:"analytics",  icon:"∿", label:"Analytics"   },
  { id:"campaigns",  icon:"⚡", label:"Campaigns"   },
  { id:"tables",     icon:"⊞", label:"Tables & QR" },
  { id:"reports",    icon:"⊕", label:"Reports"     },
  { id:"bot",        icon:"⌘", label:"Bot Setup"   },
  { id:"settings",   icon:"⊗", label:"Settings"    },
  { id:"admin",      icon:"★", label:"Admin"        },
];

const PLANS = {
  starter:    { price:49000,  label:"Starter",    color:"#2563EB", features:["WhatsApp bot","Kitchen display","Basic analytics","1 branch"] },
  growth:     { price:89000,  label:"Growth",     color:"#0A0A0B", features:["Full suite","Loyalty","Inventory","Campaigns","Tables & QR","Reports"] },
  enterprise: { price:149000, label:"Enterprise", color:"#7C3AED", features:["3 branches","Admin panel","Priority support","Multi-location"] },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:#FFFFFF;color:#0A0A0B;font-family:'Sora',sans-serif;min-height:100vh;}
  ::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-track{background:#F7F7F7;}::-webkit-scrollbar-thumb{background:#D4D4D8;border-radius:2px;}
  @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes pulse{0%,100%{border-color:#DC2626}50%{border-color:#DC262660}}
  @keyframes notif{0%{opacity:0;transform:translateY(-10px)}10%{opacity:1;transform:translateY(0)}85%{opacity:1}100%{opacity:0}}
  .fade-in{animation:fadeIn .3s ease forwards;}
  .urgent{animation:pulse 1.5s ease-in-out infinite;}
  .notif{animation:notif 4s ease forwards;}
  @media print{.no-print{display:none!important}}
  .sidebar{transition:width .22s cubic-bezier(.4,0,.2,1);}
  .sidebar-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:499;}
  .sidebar-overlay.open{display:block;}
  .topbar{display:none;}
  @media(max-width:768px){
    .topbar{display:flex!important;}
    .sidebar{position:fixed!important;top:0;left:0;height:100vh!important;z-index:500;transform:translateX(-100%);transition:transform .25s ease!important;}
    .sidebar.mobile-open{transform:translateX(0);}
    .main-content{margin-left:0!important;padding:16px 14px!important;}
  }
`;

// ─── PRIMITIVES ───────────────────────────────────────────────────────────────
function Chip({ color, label }) {
  const p = {
    green: {bg:"#DCFCE7",tx:C.success},
    amber: {bg:"#F4F4F5", tx:C.accent },
    blue:  {bg:"#DBEAFE",   tx:C.info   },
    purple:{bg:"#EDE9FE", tx:C.purple },
    red:   {bg:"#FEE2E2", tx:C.danger },
    gray:  {bg:`${C.muted}20`,  tx:C.muted  },
    teal:  {bg:"#CCFBF1",   tx:C.teal   },
  };
  const s = p[color]||p.gray;
  return <span style={{background:s.bg,color:s.tx,fontSize:11,fontWeight:600,padding:"3px 9px",borderRadius:R.pill,whiteSpace:"nowrap"}}>{label}</span>;
}

function StatCard({ icon, label, value, sub, color=C.accent, onClick }) {
  return (
    <div onClick={onClick} style={{background:"#FFFFFF",border:`1px solid ${C.border}`,borderRadius:R.card,padding:"18px 20px",cursor:onClick?"pointer":"default",display:"flex",flexDirection:"column",gap:8,boxShadow:"0 1px 3px rgba(0,0,0,.06)"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <span style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:".08em",fontWeight:500}}>{label}</span>
        <span style={{fontSize:18,color}}>{icon}</span>
      </div>
      <div style={{fontSize:26,fontWeight:600,color:C.text,fontFamily:"'Space Mono',monospace"}}>{value}</div>
      {sub&&<div style={{fontSize:12,color:C.muted}}>{sub}</div>}
    </div>
  );
}

function Toggle({ on, set }) {
  return (
    <div onClick={()=>set(!on)} style={{width:40,height:22,borderRadius:11,background:on?C.accent:"#D4D4D8",cursor:"pointer",position:"relative",transition:"background .2s",flexShrink:0}}>
      <div style={{position:"absolute",top:3,left:on?21:3,width:16,height:16,borderRadius:"50%",background:"#fff",transition:"left .2s"}}/>
    </div>
  );
}

function Spin({ size=28 }) {
  return <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:60}}><div style={{width:size,height:size,border:`2px solid ${C.border}`,borderTopColor:C.accent,borderRadius:"50%",animation:"spin .7s linear infinite"}}/></div>;
}

function Empty({ icon="⊕", msg, action, onAction }) {
  return (
    <div style={{textAlign:"center",padding:"48px 20px",color:C.muted}}>
      <div style={{fontSize:36,opacity:.15,marginBottom:12}}>{icon}</div>
      <div style={{fontSize:13,marginBottom:action?16:0}}>{msg}</div>
      {action&&<button onClick={onAction} style={{padding:"8px 20px",borderRadius:R.input,background:C.accent,color:"#000",border:"none",cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"'Sora',sans-serif"}}>{action}</button>}
    </div>
  );
}

function Modal({ title, onClose, children, width=480 }) {
  useEffect(()=>{
    const handler=(e)=>{ if(e.key==="Escape") onClose(); };
    window.addEventListener("keydown",handler);
    return ()=>window.removeEventListener("keydown",handler);
  },[onClose]);
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:24}}>
      <div style={{background:"#FFFFFF",border:`1px solid ${C.border}`,borderRadius:16,width:"100%",maxWidth:width,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 8px 40px rgba(0,0,0,.12)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"18px 22px",borderBottom:`1px solid ${C.border}`,position:"sticky",top:0,background:"#FFFFFF",zIndex:1}}>
          <span style={{fontWeight:600,fontSize:15}}>{title}</span>
          <button onClick={onClose} style={{background:"none",border:"none",color:C.muted,fontSize:20,cursor:"pointer",lineHeight:1}}>×</button>
        </div>
        <div style={{padding:22}}>{children}</div>
      </div>
    </div>
  );
}

function Inp({ label, value, onChange, placeholder, type="text", note, disabled }) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:5}}>
      {label&&<label style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:".06em"}}>{label}</label>}
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} disabled={disabled}
        style={{width:"100%",padding:"10px 13px",background:disabled?"#F7F7F7":"#FFFFFF",border:`1px solid ${C.border}`,borderRadius:R.input,color:disabled?C.muted:C.text,fontSize:13,fontFamily:"'Sora',sans-serif",outline:"none",opacity:disabled?.6:1}}/>
      {note&&<div style={{fontSize:11,color:C.muted}}>{note}</div>}
    </div>
  );
}

function Sel({ label, value, onChange, options }) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:5}}>
      {label&&<label style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:".06em"}}>{label}</label>}
      <select value={value} onChange={e=>onChange(e.target.value)}
        style={{width:"100%",padding:"10px 13px",background:"#FFFFFF",border:`1px solid ${C.border}`,borderRadius:R.input,color:C.text,fontSize:13,fontFamily:"'Sora',sans-serif",outline:"none"}}>
        {options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function Btn({ label, onClick, disabled, loading, variant="primary", size="md", icon }) {
  const base={fontFamily:"'Sora',sans-serif",border:"none",cursor:disabled||loading?"default":"pointer",display:"flex",alignItems:"center",gap:6,justifyContent:"center",fontWeight:600,transition:"opacity .15s"};
  const sz={md:{padding:"10px 16px",fontSize:13,borderRadius:R.input},sm:{padding:"5px 11px",fontSize:11,borderRadius:6},lg:{padding:"13px 22px",fontSize:14,borderRadius:R.input}};
  const v={
    primary:{background:disabled||loading?C.border:C.accent,color:disabled||loading?C.muted:"#FFFFFF"},
    ghost:{background:"transparent",color:C.muted,border:`1px solid ${C.border}`,},
    danger:{background:"#FEE2E2",color:C.danger,border:`1px solid ${C.danger}30`},
    success:{background:"#DCFCE7",color:C.success,border:`1px solid ${C.success}30`},
    info:{background:"#DBEAFE",color:C.info,border:`1px solid ${C.info}30`},
  };
  return <button onClick={!disabled&&!loading?onClick:undefined} style={{...base,...sz[size],...v[variant],opacity:disabled||loading?.6:1}}>{icon&&<span>{icon}</span>}{loading?"Saving...":label}</button>;
}

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
function NBar({ notifs, online }) {
  const n=notifs[0];
  return (
    <>
      {!online&&<div style={{position:"fixed",top:0,left:0,right:0,zIndex:3000,background:"#DC2626",color:"#FFFFFF",textAlign:"center",fontSize:12,fontWeight:500,padding:"6px"}}>⚠ Connection lost — reconnecting...</div>}
      {n&&(()=>{ const col={success:C.success,error:C.danger,info:C.info,order:C.accent}[n.type]||C.accent; return <div className="notif" style={{position:"fixed",top:online?16:38,right:16,zIndex:2000,background:"#FFFFFF",border:`1px solid ${C.border}`,borderLeft:`3px solid ${col}`,borderRadius:R.card,padding:"11px 18px",maxWidth:340,fontSize:13,fontWeight:500,boxShadow:"0 4px 12px rgba(0,0,0,.08)"}}>{n.msg}</div>; })()}
    </>
  );
}

function useOnline() {
  const [online,setOnline]=useState(navigator.onLine);
  useEffect(()=>{
    const on=()=>setOnline(true);
    const off=()=>setOnline(false);
    window.addEventListener("online",on);
    window.addEventListener("offline",off);
    return ()=>{ window.removeEventListener("online",on); window.removeEventListener("offline",off); };
  },[]);
  return online;
}

function useNotifs() {
  const [notifs,setNotifs]=useState([]);
  const notify=useCallback((msg,type="success")=>{
    const id=Date.now();
    setNotifs(p=>[{id,msg,type},...p].slice(0,1));
    if(type==="order"){
      try{const a=new(window.AudioContext||window.webkitAudioContext)(),o=a.createOscillator(),g=a.createGain();o.connect(g);g.connect(a.destination);o.frequency.setValueAtTime(880,a.currentTime);o.frequency.setValueAtTime(660,a.currentTime+.12);g.gain.setValueAtTime(.25,a.currentTime);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+.5);o.start();o.stop(a.currentTime+.5);}catch(e){}
    }
    setTimeout(()=>setNotifs(p=>p.filter(x=>x.id!==id)),4500);
  },[]);
  return {notifs,notify};
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────
function useAuth() {
  const [user,setUser]=useState(null);
  const [role,setRole]=useState("owner");
  const [loading,setLoading]=useState(true);
  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{
      setUser(session?.user||null);
      if(session?.user?.email===ADMIN_EMAIL) setRole("admin");
      setLoading(false);
    });
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_,s)=>{
      setUser(s?.user||null);
      if(s?.user?.email===ADMIN_EMAIL) setRole("admin");
    });
    return ()=>subscription?.unsubscribe();
  },[]);
  const signIn=async(e,p)=>supabase.auth.signInWithPassword({email:e,password:p});
  const signUp=async(e,p)=>supabase.auth.signUp({email:e,password:p});
  const signOut=async()=>supabase.auth.signOut();
  return {user,role,loading,signIn,signUp,signOut};
}

// ─── DATA HOOKS ───────────────────────────────────────────────────────────────
// ─── GLOBAL ORDERS STORE — single subscription shared across all modules ─────
// Call this ONCE in App() and pass orders down. Never call useOrders in modules.
function useOrders(notify) {
  const [orders,setOrders]=useState([]);
  const [allOrders,setAllOrders]=useState([]); // full history for analytics
  const [loading,setLoading]=useState(true);
  const [hasMore,setHasMore]=useState(false);
  const PAGE=100; // load most recent 100, fetch more on demand

  useEffect(()=>{
    fetchOrders();
    // Single channel for the entire app
    const ch=supabase.channel("orders-global")
      .on("postgres_changes",{event:"*",schema:"public",table:"orders",filter:`restaurant_id=eq.${RESTAURANT_ID}`},
        p=>{
          fetchOrders();
          if(p.eventType==="INSERT"&&notify){
            // Activate audio — needs prior user interaction on mobile
            try{
              const ctx=new(window.AudioContext||window.webkitAudioContext)();
              if(ctx.state==="suspended") ctx.resume();
              const o=ctx.createOscillator(),g=ctx.createGain();
              o.connect(g);g.connect(ctx.destination);
              o.frequency.setValueAtTime(880,ctx.currentTime);
              o.frequency.setValueAtTime(660,ctx.currentTime+.12);
              g.gain.setValueAtTime(.25,ctx.currentTime);
              g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.5);
              o.start();o.stop(ctx.currentTime+.5);
            }catch(e){}
            notify(`New order ${p.new.order_number||""}!`,"order");
          }
        })
      .subscribe();
    return ()=>supabase.removeChannel(ch);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  async function fetchOrders(){
    // Recent orders (paginated) — used for kitchen, orders list, overview
    const {data,error}=await supabase.from("orders")
      .select("*").eq("restaurant_id",RESTAURANT_ID)
      .order("created_at",{ascending:false}).limit(PAGE);
    if(!error&&data){
      setOrders(data.map(o=>({...o,total:o.total||0}))); // null-safe total
      setHasMore(data.length===PAGE);
    }
    setLoading(false);
  }

  async function fetchAllOrders(){
    // Full history — called lazily by Analytics/Reports only
    const {data}=await supabase.from("orders")
      .select("*").eq("restaurant_id",RESTAURANT_ID)
      .order("created_at",{ascending:false});
    if(data) setAllOrders(data.map(o=>({...o,total:o.total||0})));
    return data||[];
  }

  async function loadMore(){
    const {data}=await supabase.from("orders")
      .select("*").eq("restaurant_id",RESTAURANT_ID)
      .order("created_at",{ascending:false})
      .range(orders.length, orders.length+PAGE-1);
    if(data&&data.length){
      setOrders(p=>[...p,...data.map(o=>({...o,total:o.total||0}))]);
      setHasMore(data.length===PAGE);
    }
  }

  const updateStatus=async(id,status)=>{
    // Optimistic update — update local state immediately, then sync
    setOrders(p=>p.map(o=>o.id===id?{...o,status,updated_at:new Date().toISOString()}:o));
    await supabase.from("orders").update({status,updated_at:new Date().toISOString()}).eq("id",id);
  };

  const updateOrderItems=async(id,items,total)=>{
    setOrders(p=>p.map(o=>o.id===id?{...o,items,total}:o));
    await supabase.from("orders").update({items,total,updated_at:new Date().toISOString()}).eq("id",id);
  };

  const createOrder=async d=>{
    // Collision-proof order number: timestamp + random digit
    const ts=Date.now().toString().slice(-5);
    const rand=Math.floor(Math.random()*10);
    const order_number=`#G${ts}${rand}`;
    const {data,error}=await supabase.from("orders")
      .insert({...d,order_number,restaurant_id:RESTAURANT_ID}).select().single();
    return {data,error};
  };

  return {orders,allOrders,loading,hasMore,updateStatus,updateOrderItems,createOrder,loadMore,fetchAllOrders,refetch:fetchOrders};
}

function useRiders(notify) {
  const [riders,setRiders]=useState([]);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{
    fetchRiders();
    const ch=supabase.channel(`riders-ch-${Date.now()}`)
      .on("postgres_changes",{event:"*",schema:"public",table:"riders",filter:`restaurant_id=eq.${RESTAURANT_ID}`},()=>fetchRiders())
      .subscribe();
    return ()=>supabase.removeChannel(ch);
  },[]);
  async function fetchRiders(){const {data}=await supabase.from("riders").select("*").eq("restaurant_id",RESTAURANT_ID).order("name");if(data)setRiders(data);setLoading(false);}
  const updateStatus=async(id,status,orderId=null)=>supabase.from("riders").update({status,current_order_id:orderId}).eq("id",id);
  const addRider=async d=>{const r=await supabase.from("riders").insert({...d,restaurant_id:RESTAURANT_ID}).select().single();if(notify&&!r.error)notify(`${d.name} added`);await fetchRiders();return r;};
  const deleteRider=async id=>{await supabase.from("riders").delete().eq("id",id);if(notify)notify("Rider removed","info");await fetchRiders();};
  return {riders,loading,updateStatus,addRider,deleteRider};
}

function useCustomers(notify) {
  const [customers,setCustomers]=useState([]);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{fetchCustomers();},[]);
  async function fetchCustomers(){const {data}=await supabase.from("customers").select("*").eq("restaurant_id",RESTAURANT_ID).order("total_spend",{ascending:false});if(data)setCustomers(data);setLoading(false);}
  const addCustomer=async d=>{const r=await supabase.from("customers").insert({...d,restaurant_id:RESTAURANT_ID}).select().single();if(notify&&!r.error)notify(`${d.name} added`);await fetchCustomers();return r;};
  const updatePoints=async(id,points)=>{await supabase.from("customers").update({points}).eq("id",id);if(notify)notify("Points updated");await fetchCustomers();};
  return {customers,loading,addCustomer,updatePoints};
}

function useMenu(notify) {
  const [cats,setCats]=useState([]);
  const [items,setItems]=useState([]);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{fetchMenu();},[]);
  async function fetchMenu(){
    const [cr,ir]=await Promise.all([
      supabase.from("menu_categories").select("*").eq("restaurant_id",RESTAURANT_ID).order("sort_order"),
      supabase.from("menu_items").select("*,menu_categories(name)").eq("restaurant_id",RESTAURANT_ID).order("name"),
    ]);
    if(cr.data)setCats(cr.data);
    if(ir.data)setItems(ir.data);
    setLoading(false);
  }
  const addItem=async d=>{const r=await supabase.from("menu_items").insert({...d,restaurant_id:RESTAURANT_ID}).select().single();if(notify&&!r.error)notify(`${d.name} added`);await fetchMenu();return r;};
  const updateItem=async(id,d)=>{await supabase.from("menu_items").update(d).eq("id",id);if(notify)notify("Item updated");await fetchMenu();};
  const deleteItem=async(id,name)=>{await supabase.from("menu_items").delete().eq("id",id);if(notify)notify(`${name} removed`,"info");await fetchMenu();};
  const addCat=async name=>{const r=await supabase.from("menu_categories").insert({name,restaurant_id:RESTAURANT_ID,sort_order:cats.length+1}).select().single();if(notify&&!r.error)notify(`"${name}" added`);await fetchMenu();return r;};
  return {cats,items,loading,addItem,updateItem,deleteItem,addCat};
}

function useInventory(notify) {
  const [inv,setInv]=useState([]);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{fetchInventory();},[]);
  async function fetchInventory(){const {data}=await supabase.from("inventory").select("*").eq("restaurant_id",RESTAURANT_ID).order("name");if(data)setInv(data);setLoading(false);}
  const addIng=async d=>{const r=await supabase.from("inventory").insert({...d,restaurant_id:RESTAURANT_ID}).select().single();if(notify&&!r.error)notify(`${d.name} added`);await fetchInventory();return r;};
  const updateQty=async(id,qty,name,thr,prevQty)=>{
    await supabase.from("inventory").update({quantity:qty,updated_at:new Date().toISOString()}).eq("id",id);
    // Only alert when first crossing the threshold, not on every sub-threshold update
    if(qty<=thr&&prevQty>thr&&notify) notify(`⚠ Low stock: ${name}`,"error");
    else if(notify) notify("Stock updated");
    await fetchInventory();
  };
  const deleteIng=async id=>{await supabase.from("inventory").delete().eq("id",id);await fetchInventory();};
  return {inv,loading,addIng,updateQty,deleteIng};
}

function useRestaurant() {
  const [restaurant,setRestaurant]=useState(null);
  const [staff,setStaff]=useState([]);
  useEffect(()=>{
    supabase.from("restaurants").select("*").eq("id",RESTAURANT_ID).single().then(({data})=>{if(data)setRestaurant(data);});
    supabase.from("staff").select("*").eq("restaurant_id",RESTAURANT_ID).then(({data})=>{if(data)setStaff(data);});
  },[]);
  const updateRestaurant=async d=>supabase.from("restaurants").update(d).eq("id",RESTAURANT_ID);
  const addStaff=async d=>{await supabase.from("staff").insert({...d,restaurant_id:RESTAURANT_ID});const {data}=await supabase.from("staff").select("*").eq("restaurant_id",RESTAURANT_ID);if(data)setStaff(data);};
  const removeStaff=async id=>{await supabase.from("staff").delete().eq("id",id);const {data}=await supabase.from("staff").select("*").eq("restaurant_id",RESTAURANT_ID);if(data)setStaff(data);};
  return {restaurant,staff,updateRestaurant,addStaff,removeStaff};
}

// ─── RECEIPT ──────────────────────────────────────────────────────────────────
function Receipt({ order, restaurant, onClose }) {
  const items=Array.isArray(order.items)?order.items:[];
  return (
    <Modal title="Receipt" onClose={onClose} width={400}>
      <div id="receipt-body">
        <div style={{textAlign:"center",marginBottom:16}}>
          <div style={{fontSize:18,fontWeight:700,color:C.accent,marginBottom:2}}>{restaurant?.name||"Gogi Restaurant"}</div>
          <div style={{fontSize:11,color:C.muted}}>Lagos · 24 Hours</div>
        </div>
        <div style={{borderTop:"1px dashed #D4D4D8",borderBottom:`1px dashed ${C.border}`,padding:"10px 0",marginBottom:14}}>
          {[["Order",order.order_number],["Type",order.type],order.table_number&&["Table",order.table_number],["Customer",order.customer_name||"Walk-in"],["Time",new Date(order.created_at).toLocaleString("en-GB",{hour:"2-digit",minute:"2-digit",day:"2-digit",month:"short"})]].filter(Boolean).map(([k,v])=>(
            <div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
              <span style={{color:C.muted}}>{k}</span><span style={{fontFamily:"'Space Mono',monospace"}}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{marginBottom:14}}>
          {items.map((it,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:"5px 0",borderBottom:`1px solid ${C.border}`}}>
              <span>{it.qty||1}× {it.name}</span>
              <span style={{fontFamily:"'Space Mono',monospace"}}>₦{((it.price||0)*(it.qty||1)).toLocaleString()}</span>
            </div>
          ))}
        </div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:15,fontWeight:700,padding:"10px 0",borderTop:`2px solid ${C.border}`}}>
          <span>TOTAL</span><span style={{color:C.accent,fontFamily:"'Space Mono',monospace"}}>₦{order.total.toLocaleString()}</span>
        </div>
        <div style={{textAlign:"center",marginTop:16,fontSize:11,color:C.muted}}>Thank you!<br/>Powered by Demi · demi-alpha.vercel.app</div>
      </div>
      <div style={{display:"flex",gap:10,marginTop:18}} className="no-print">
        <Btn label="Close" onClick={onClose} variant="ghost"/>
        <Btn label="🖨 Print" onClick={()=>window.print()} icon=""/>
      </div>
    </Modal>
  );
}

// ─── NEW ORDER MODAL ──────────────────────────────────────────────────────────
function NewOrder({ onClose, onDone, notify, createOrder }) {
  const {cats,items}=useMenu();
  const [name,setName]=useState("");
  const [phone,setPhone]=useState("");
  const [type,setType]=useState("dine-in");
  const [table,setTable]=useState("");
  const [cart,setCart]=useState([]);
  const [catF,setCatF]=useState("All");
  const [saving,setSaving]=useState(false);
  const [deliveryFee,setDeliveryFee]=useState("0");
  const [deliveryAddr,setDeliveryAddr]=useState("");

  const add=item=>setCart(p=>{const ex=p.find(c=>c.id===item.id);return ex?p.map(c=>c.id===item.id?{...c,qty:c.qty+1}:c):[...p,{...item,qty:1,catName:item.menu_categories?.name||""}];});
  const adj=(id,d)=>setCart(p=>p.map(c=>c.id===id?{...c,qty:Math.max(1,c.qty+d)}:c));
  const rem=id=>setCart(p=>p.filter(c=>c.id!==id));
  const fee=safeNum(deliveryFee,0);
  const subtotal=cart.reduce((s,c)=>s+c.price*c.qty,0);
  const total=subtotal+fee;

  async function submit() {
    if(!cart.length) return;
    setSaving(true);
    // Use timestamp + random to avoid race conditions, then format nicely
    const ts=Date.now().toString().slice(-6);
    const num=`#G${ts}`;
    const {error}=await createOrder({
      customer_name:name||"Walk-in",customer_phone:phone||null,
      items:cart.map(c=>({name:c.name,qty:c.qty,price:c.price,station:getStation(c.catName)})),
      total,subtotal,delivery_fee:fee>0?fee:null,
      delivery_address:deliveryAddr||null,
      status:"new",type,table_number:table||null,
    });
    setSaving(false);
    if(!error){notify(`Order ${num} created`);onDone();onClose();}
    else notify("Failed to create order","error");
  }

  return (
    <Modal title="New Order" onClose={onClose} width={740}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <Inp label="Customer name" value={name} onChange={setName} placeholder="Walk-in"/>
          <Inp label="Phone (optional)" value={phone} onChange={setPhone} placeholder="+234 XXX XXX XXXX"/>
          <div>
            <label style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:".06em",display:"block",marginBottom:6}}>Order type</label>
            <div style={{display:"flex",gap:8}}>
              {["dine-in","pickup","delivery"].map(t=>(
                <button key={t} onClick={()=>setType(t)} style={{flex:1,padding:"9px",borderRadius:R.input,border:`1px solid ${type===t?C.accent:C.border}`,background:type===t?"#F4F4F5":"#F7F7F7",color:type===t?C.accent:C.muted,fontSize:12,cursor:"pointer",fontFamily:"'Sora',sans-serif",textTransform:"capitalize"}}>{t}</button>
              ))}
            </div>
          </div>
          {type==="dine-in"&&<Inp label="Table" value={table} onChange={setTable} placeholder="e.g. T3"/>}
          {type==="delivery"&&<Inp label="Delivery fee (₦)" value={deliveryFee} onChange={setDeliveryFee} type="number" placeholder="0" note="Added to order total"/>}
          {type==="delivery"&&<Inp label="Delivery address" value={deliveryAddr} onChange={setDeliveryAddr} placeholder="Customer area / full address"/>}
          <div style={{borderTop:`1px solid ${C.border}`,paddingTop:12}}>
            <div style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:".06em",marginBottom:8}}>Cart</div>
            {!cart.length?<div style={{fontSize:13,color:C.muted,padding:"6px 0"}}>No items yet</div>
              :cart.map(c=>(
                <div key={c.id} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderBottom:`1px solid ${C.border}`}}>
                  <div style={{flex:1}}><div style={{fontSize:13,fontWeight:500}}>{c.name}</div><div style={{fontSize:11,color:C.muted}}>₦{c.price.toLocaleString()}</div></div>
                  <button onClick={()=>adj(c.id,-1)} style={{width:22,height:22,borderRadius:4,border:`1px solid ${C.border}`,background:"#F7F7F7",color:C.muted,cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
                  <span style={{fontSize:13,fontWeight:600,minWidth:16,textAlign:"center"}}>{c.qty}</span>
                  <button onClick={()=>adj(c.id,1)} style={{width:22,height:22,borderRadius:4,border:`1px solid ${C.border}`,background:"#F7F7F7",color:C.muted,cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
                  <span style={{fontSize:12,fontFamily:"'Space Mono',monospace",color:C.accent,minWidth:70,textAlign:"right"}}>₦{(c.price*c.qty).toLocaleString()}</span>
                  <button onClick={()=>rem(c.id)} style={{width:20,height:20,borderRadius:4,background:"#FEE2E2",border:"none",color:C.danger,cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
                </div>
              ))
            }
            {cart.length>0&&<div style={{display:"flex",justifyContent:"space-between",padding:"10px 0",fontWeight:600,fontSize:14}}><span>Total</span><span style={{fontFamily:"'Space Mono',monospace",color:C.accent}}>₦{total.toLocaleString()}</span></div>}
          </div>
          <Btn label="Create Order" onClick={submit} disabled={!cart.length} loading={saving} size="lg"/>
        </div>
        <div>
          <div style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:".06em",marginBottom:8}}>Menu — tap to add</div>
          <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:10}}>
            {["All",...cats.map(c=>c.name)].map(n=>(
              <button key={n} onClick={()=>setCatF(n)} style={{padding:"3px 9px",borderRadius:R.pill,border:`1px solid ${catF===n?C.accent:C.border}`,background:catF===n?C.accent:"transparent",color:catF===n?"#FFFFFF":C.muted,fontSize:11,cursor:"pointer",fontFamily:"'Sora',sans-serif"}}>{n}</button>
            ))}
          </div>
          <div style={{maxHeight:440,overflowY:"auto",display:"flex",flexDirection:"column",gap:3}}>
            {cats.filter(c=>catF==="All"||c.name===catF).map(cat=>{
              const ci=items.filter(i=>i.category_id===cat.id&&i.available!==false);
              if(!ci.length) return null;
              return (
                <div key={cat.id}>
                  {catF==="All"&&<div style={{fontSize:10,color:C.accent,fontWeight:600,textTransform:"uppercase",letterSpacing:".08em",padding:"7px 0 3px"}}>{cat.name}</div>}
                  {ci.map(item=>(
                    <button key={item.id} onClick={()=>add(item)} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 11px",background:"#F7F7F7",border:`1px solid ${C.border}`,borderRadius:R.input,marginBottom:3,cursor:"pointer",textAlign:"left",fontFamily:"'Sora',sans-serif"}}>
                      <span style={{fontSize:13,color:C.text}}>{item.name}</span>
                      <span style={{fontSize:12,color:C.accent,fontFamily:"'Space Mono',monospace",flexShrink:0,marginLeft:8}}>₦{item.price.toLocaleString()}</span>
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ─── OVERVIEW ─────────────────────────────────────────────────────────────────
function Overview({ orders, ordersLoading:loading, updateOrderStatus:updateStatus, createOrder, notify, goTo }) {
  const {riders}=useRiders();
  const {restaurant}=useRestaurant();
  const [showNew,setShowNew]=useState(false);
  const [receipt,setReceipt]=useState(null);

  const today=new Date().toDateString();
  const tod=orders.filter(o=>new Date(o.created_at).toDateString()===today);
  const active=orders.filter(o=>["new","preparing","ready"].includes(o.status));
  const rev=tod.reduce((s,o)=>s+(o.total||0),0);
  const hr=new Date().getHours();


  const days=Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-6+i);return d.toDateString();});
  const chart=days.map(day=>({lb:new Date(day).toLocaleDateString("en-GB",{weekday:"short"}),v:orders.filter(o=>new Date(o.created_at).toDateString()===day).reduce((s,o)=>s+(o.total||0),0)}));
  const maxV=Math.max(...chart.map(d=>d.v),1);

  return (
    <div className="fade-in" style={{display:"flex",flexDirection:"column",gap:22}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <h1 style={{fontSize:21,fontWeight:600,marginBottom:3}}>Good {hr<12?"morning":hr<17?"afternoon":"evening"}, {restaurant?.name||"Gogi"} 🔥</h1>
          <p style={{color:C.muted,fontSize:13}}>{new Date().toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"})}</p>
        </div>
        <Btn label="+ New Order" onClick={()=>setShowNew(true)} icon="◎"/>
      </div>
      {loading?<Spin/>:(
        <>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12}}>
            <StatCard icon="₦" label="Revenue today"  value={`₦${Math.round(rev/1000)}K`}     sub={`${tod.length} orders`}   onClick={()=>goTo("analytics")}/>
            <StatCard icon="◎" label="Active orders"  value={active.length}                    sub="Need attention" color={C.info}    onClick={()=>goTo("orders")}/>
            <StatCard icon="◉" label="Riders"         value={`${riders.filter(r=>r.status==="delivering").length}/${riders.length}`} sub={`${riders.filter(r=>r.status==="available").length} available`} color={C.success} onClick={()=>goTo("dispatch")}/>
            <StatCard icon="◇" label="Total orders"   value={orders.length}                    sub="All time"       color={C.purple}  onClick={()=>goTo("analytics")}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <div style={{background:"#FFFFFF",border:`1px solid ${C.border}`,borderRadius:R.card,padding:18,boxShadow:"0 1px 3px rgba(0,0,0,.05)"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
                <span style={{fontWeight:500,fontSize:14}}>Active orders</span>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <div style={{width:6,height:6,borderRadius:"50%",background:C.success}}/>
                  <span style={{fontSize:11,color:C.success}}>Live</span>
                </div>
              </div>
              {!active.length?<Empty msg="No active orders" action="Create one" onAction={()=>setShowNew(true)}/>
                :active.slice(0,5).map(o=>(
                  <div key={o.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 0",borderBottom:`1px solid ${C.border}`}}>
                    <div>
                      <div style={{fontSize:13,fontWeight:500,marginBottom:1}}>{o.customer_name||"Walk-in"}</div>
                      <div style={{fontSize:11,color:C.muted,fontFamily:"'Space Mono',monospace"}}>{o.order_number} · {timeAgo(o.created_at)}</div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontSize:12,fontFamily:"'Space Mono',monospace"}}>₦{o.total.toLocaleString()}</span>
                      <Chip color={o.status==="new"?"blue":o.status==="preparing"?"amber":"green"} label={o.status}/>
                      <button onClick={()=>setReceipt(o)} style={{width:24,height:24,borderRadius:4,background:"#F7F7F7",border:`1px solid ${C.border}`,color:C.muted,cursor:"pointer",fontSize:11,display:"flex",alignItems:"center",justifyContent:"center"}}>🖨</button>
                    </div>
                  </div>
                ))
              }
            </div>
            <div style={{background:"#FFFFFF",border:`1px solid ${C.border}`,borderRadius:R.card,padding:18,boxShadow:"0 1px 3px rgba(0,0,0,.05)"}}>
              <div style={{fontWeight:500,fontSize:14,marginBottom:14}}>Revenue — last 7 days</div>
              <div style={{display:"flex",alignItems:"flex-end",gap:8,height:130}}>
                {chart.map((d,i)=>(
                  <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                    <div style={{fontSize:9,color:C.muted,fontFamily:"'Space Mono',monospace"}}>{d.v?`₦${Math.round(d.v/1000)}K`:""}</div>
                    <div style={{width:"100%",background:i===6?"#0A0A0B":"#D4D4D8",borderRadius:"3px 3px 0 0",height:`${Math.max((d.v/maxV)*100,4)}%`,transition:"height .5s"}}/>
                    <div style={{fontSize:10,color:i===6?C.accent:C.muted,fontWeight:i===6?600:400}}>{d.lb}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
      {showNew&&<NewOrder onClose={()=>setShowNew(false)} onDone={()=>{}} notify={notify} createOrder={createOrder}/>}
      {receipt&&<Receipt order={receipt} restaurant={restaurant} onClose={()=>setReceipt(null)}/>}
    </div>
  );
}

// ─── ORDERS ───────────────────────────────────────────────────────────────────
// ─── EDIT ORDER MODAL ────────────────────────────────────────────────────────
function EditOrderModal({ order, onClose, onSaved, updateOrderItems, notify }) {
  const {cats,items}=useMenu();
  const [cart,setCart]=useState(Array.isArray(order.items)?[...order.items]:[]);
  const [saving,setSaving]=useState(false);
  const total=cart.reduce((s,c)=>s+(c.price||0)*(c.qty||1),0);

  const adj=(name,d)=>setCart(p=>p.map(c=>c.name===name?{...c,qty:Math.max(1,(c.qty||1)+d)}:c));
  const rem=name=>setCart(p=>p.filter(c=>c.name!==name));
  const addItem=item=>{
    setCart(p=>{const ex=p.find(c=>c.name===item.name);
    return ex?p.map(c=>c.name===item.name?{...c,qty:(c.qty||1)+1}:c):[...p,{name:item.name,price:item.price,qty:1,station:getStation(item.menu_categories?.name||"")}];});
  };

  async function save(){
    if(!cart.length){notify("Cart cannot be empty","error");return;}
    setSaving(true);
    await updateOrderItems(order.id,cart,total);
    setSaving(false);onSaved(order);
  }

  return (
    <Modal title={`Edit Order ${order.order_number}`} onClose={onClose} width={700}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
        <div>
          <div style={{fontSize:12,color:C.muted,textTransform:"uppercase",letterSpacing:".06em",marginBottom:8}}>Current items</div>
          {cart.map(c=>(
            <div key={c.name} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderBottom:`1px solid ${C.border}`}}>
              <div style={{flex:1}}><div style={{fontSize:13,fontWeight:500}}>{c.name}</div><div style={{fontSize:11,color:C.muted}}>₦{(c.price||0).toLocaleString()}</div></div>
              <button onClick={()=>adj(c.name,-1)} style={{width:22,height:22,borderRadius:4,border:`1px solid ${C.border}`,background:"#F7F7F7",cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
              <span style={{fontSize:13,fontWeight:600,minWidth:16,textAlign:"center"}}>{c.qty||1}</span>
              <button onClick={()=>adj(c.name,1)} style={{width:22,height:22,borderRadius:4,border:`1px solid ${C.border}`,background:"#F7F7F7",cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
              <ConfirmBtn label="×" onConfirm={()=>rem(c.name)} variant="danger" size="sm"/>
            </div>
          ))}
          <div style={{display:"flex",justifyContent:"space-between",padding:"12px 0",fontWeight:600,fontSize:14}}>
            <span>New total</span>
            <span style={{fontFamily:"'Space Mono',monospace"}}>₦{total.toLocaleString()}</span>
          </div>
          <div style={{display:"flex",gap:8,marginTop:4}}>
            <Btn label="Cancel" onClick={onClose} variant="ghost"/>
            <Btn label="Save Changes" onClick={save} loading={saving} disabled={!cart.length}/>
          </div>
        </div>
        <div>
          <div style={{fontSize:12,color:C.muted,textTransform:"uppercase",letterSpacing:".06em",marginBottom:8}}>Add items</div>
          <div style={{maxHeight:400,overflowY:"auto",display:"flex",flexDirection:"column",gap:3}}>
            {cats.map(cat=>{
              const ci=items.filter(i=>i.category_id===cat.id&&i.available!==false);
              if(!ci.length) return null;
              return (
                <div key={cat.id}>
                  <div style={{fontSize:10,color:C.accent,fontWeight:600,textTransform:"uppercase",letterSpacing:".08em",padding:"7px 0 3px"}}>{cat.name}</div>
                  {ci.map(item=>(
                    <button key={item.id} onClick={()=>addItem(item)} style={{width:"100%",display:"flex",justifyContent:"space-between",padding:"7px 10px",background:"#F7F7F7",border:`1px solid ${C.border}`,borderRadius:R.input,marginBottom:3,cursor:"pointer",fontFamily:"'Sora',sans-serif",textAlign:"left"}}>
                      <span style={{fontSize:12}}>{item.name}</span>
                      <span style={{fontSize:12,color:C.accent,fontFamily:"'Space Mono',monospace"}}>₦{item.price.toLocaleString()}</span>
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
}

function OrdersModule({ orders, ordersLoading:loading, updateOrderStatus:updateStatus, createOrder, updateOrderItems, loadMore, hasMore, notify }) {
  const {restaurant}=useRestaurant();
  const [filter,setFilter]=useState("all");
  const [search,setSearch]=useState("");
  const [showNew,setShowNew]=useState(false);
  const [receipt,setReceipt]=useState(null);
  const [editOrder,setEditOrder]=useState(null);
  const opts=["all","new","preparing","ready","delivered","cancelled"];
  const list=(filter==="all"?orders:orders.filter(o=>o.status===filter))
    .filter(o=>!search||
      o.order_number?.toLowerCase().includes(search.toLowerCase())||
      o.customer_name?.toLowerCase().includes(search.toLowerCase())||
      o.customer_phone?.includes(search)
    );
  return (
    <div className="fade-in" style={{display:"flex",flexDirection:"column",gap:18}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div><h1 style={{fontSize:20,fontWeight:600,marginBottom:3}}>Orders</h1><p style={{color:C.muted,fontSize:13}}>{orders.length} total · {orders.filter(o=>["new","preparing","ready"].includes(o.status)).length} active</p></div>
        <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, phone, order #..." style={{padding:"6px 12px",borderRadius:R.input,border:`1px solid ${C.border}`,background:"#FFFFFF",color:C.text,fontSize:12,fontFamily:"'Sora',sans-serif",outline:"none",minWidth:200}}/>
          <div style={{display:"flex",gap:4}}>
            {opts.map(f=><button key={f} onClick={()=>setFilter(f)} style={{padding:"5px 11px",borderRadius:R.pill,border:`1px solid ${filter===f?C.accent:C.border}`,background:filter===f?"#F4F4F5":"transparent",color:filter===f?C.accent:C.muted,fontSize:11,cursor:"pointer",fontFamily:"'Sora',sans-serif",textTransform:"capitalize"}}>{f}</button>)}
          </div>
          <Btn label="+ New Order" onClick={()=>setShowNew(true)}/>
        </div>
      </div>
      {loading?<Spin/>:!list.length?<Empty msg="No orders found" action="Create one" onAction={()=>setShowNew(true)}/>:(
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {list.map(o=>(
            <div key={o.id} style={{background:"#FFFFFF",border:`1px solid ${C.border}`,borderRadius:R.input,padding:"13px 18px",display:"flex",alignItems:"center",gap:12}}>
              <div style={{fontFamily:"'Space Mono',monospace",fontSize:12,color:C.accent,minWidth:64}}>{o.order_number}</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:500,fontSize:13,marginBottom:2}}>{o.customer_name||"Walk-in"}</div>
                <div style={{fontSize:11,color:C.muted}}>{Array.isArray(o.items)?o.items.map(i=>`${i.qty}× ${i.name}`).join(", ").slice(0,55):"—"}</div>
              </div>
              <Chip color={o.type==="delivery"?"blue":o.type==="pickup"?"amber":"purple"} label={o.type}/>
              <div style={{fontFamily:"'Space Mono',monospace",fontSize:13,fontWeight:600,minWidth:76,textAlign:"right"}}>₦{o.total.toLocaleString()}</div>
              <select value={o.status} onChange={e=>updateStatus(o.id,e.target.value)} style={{padding:"5px 9px",borderRadius:6,border:`1px solid ${C.border}`,background:"#FFFFFF",color:C.text,fontSize:11,cursor:"pointer",fontFamily:"'Sora',sans-serif",outline:"none"}}>
                {["new","preparing","ready","delivered","cancelled"].map(s=><option key={s} value={s}>{s}</option>)}
              </select>
              <div style={{fontSize:11,color:C.muted,minWidth:52,textAlign:"right"}}>{timeAgo(o.created_at)}</div>
              <button onClick={()=>setEditOrder(o)} title="Edit order" style={{width:26,height:26,borderRadius:6,background:"#F7F7F7",border:`1px solid ${C.border}`,color:C.muted,cursor:"pointer",fontSize:11,display:"flex",alignItems:"center",justifyContent:"center"}}>✎</button>
              <button onClick={()=>setReceipt(o)} title="Print receipt" style={{width:26,height:26,borderRadius:6,background:"#F7F7F7",border:`1px solid ${C.border}`,color:C.muted,cursor:"pointer",fontSize:11,display:"flex",alignItems:"center",justifyContent:"center"}}>🖨</button>
            </div>
          ))}
          {hasMore&&<div style={{textAlign:"center",padding:"16px 0"}}><Btn label="Load older orders" onClick={loadMore} variant="ghost"/></div>}
        </div>
      )}
      {showNew&&<NewOrder onClose={()=>setShowNew(false)} onDone={()=>{}} notify={notify} createOrder={createOrder}/>}
      {receipt&&<Receipt order={receipt} restaurant={restaurant} onClose={()=>setReceipt(null)}/>}
      {editOrder&&<EditOrderModal order={editOrder} onClose={()=>setEditOrder(null)} onSaved={o=>{setEditOrder(null);notify("Order updated");}} updateOrderItems={updateOrderItems} notify={notify}/>}
    </div>
  );
}

// ─── KITCHEN ──────────────────────────────────────────────────────────────────
function Kitchen({ orders, ordersLoading:loading, updateOrderStatus:updateStatus, notify }) {
  const [stF,setStF]=useState("all");
  const [clock,setClock]=useState(new Date());
  const [soundReady,setSoundReady]=useState(false);
  useEffect(()=>{const t=setInterval(()=>setClock(new Date()),1000);return()=>clearInterval(t);},[]);
  function activateSound(){
    try{
      const ctx=new(window.AudioContext||window.webkitAudioContext)();
      ctx.resume().then(()=>{
        const o=ctx.createOscillator(),g=ctx.createGain();
        o.connect(g);g.connect(ctx.destination);
        g.gain.setValueAtTime(.1,ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.2);
        o.frequency.value=660;o.start();o.stop(ctx.currentTime+.2);
        setSoundReady(true);
      });
    }catch(e){setSoundReady(true);}
  }

  const kOrders=orders.filter(o=>["new","preparing","ready"].includes(o.status));
  const bump=useCallback(async(id,st)=>{
    const next=st==="new"?"preparing":st==="preparing"?"ready":"delivered";
    await updateStatus(id,next);
  },[updateStatus]);

  const disp=stF==="all"?kOrders:kOrders.filter(o=>Array.isArray(o.items)&&o.items.some(i=>(i.station||"grill")===stF));
  const cols=[{lb:"New",col:C.info,list:disp.filter(o=>o.status==="new")},{lb:"Preparing",col:C.accent,list:disp.filter(o=>o.status==="preparing")},{lb:"Ready",col:C.success,list:disp.filter(o=>o.status==="ready")}];

  function Ticket({order}) {
    const items=Array.isArray(order.items)?order.items:[];
    const age=Math.floor((Date.now()-new Date(order.created_at))/60000);
    const urgent=age>=12&&order.status!=="ready";
    const ready=order.status==="ready";
    return (
      <div className={urgent&&!ready?"urgent":""} style={{background:"#FFFFFF",border:ready?`2px solid ${C.success}`:urgent?`2px solid ${C.danger}`:`1px solid ${C.border}`,borderRadius:R.card,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,.06)"}}>
        <div style={{background:ready?"#F0FDF4":urgent?"#FEF2F2":"#F7F7F7",padding:"11px 14px",borderBottom:`1px solid ${C.border}`}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
            <span style={{fontFamily:"'Space Mono',monospace",fontSize:13,fontWeight:700,color:ready?C.success:urgent?C.danger:C.accent}}>{order.order_number}</span>
            <span style={{fontSize:11,fontFamily:"'Space Mono',monospace",color:urgent&&!ready?C.danger:C.muted}}>{age===0?"just now":`${age}m`}</span>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:13,fontWeight:500}}>{order.table_number?`Table ${order.table_number}`:order.customer_name||"Walk-in"}</span>
            <Chip color={order.type==="delivery"?"blue":order.type==="pickup"?"amber":"purple"} label={order.type}/>
          </div>
        </div>
        <div style={{padding:"11px 14px",display:"flex",flexDirection:"column",gap:8}}>
          {!items.length?<div style={{fontSize:12,color:C.muted}}>No item details</div>
            :items.map((it,i)=>{
              const st=STATION[it.station||"grill"]||STATION.grill;
              return(
                <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                  <div style={{width:22,height:22,borderRadius:5,flexShrink:0,background:st.bg,border:`1px solid ${st.bd}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:st.tx}}>{it.qty||1}</div>
                  <div style={{flex:1}}><div style={{fontSize:13,fontWeight:500}}>{it.name}</div>{it.mods?.length>0&&<div style={{fontSize:11,color:C.accent,marginTop:1}}>{it.mods.join(", ")}</div>}</div>
                  <span style={{fontSize:10,padding:"2px 5px",borderRadius:4,background:st.bg,color:st.tx,textTransform:"uppercase",fontWeight:600}}>{it.station||"grill"}</span>
                </div>
              );
            })
          }
        </div>
        <div style={{padding:"9px 14px",borderTop:`1px solid ${C.border}`}}>
          <button onClick={()=>bump(order.id,order.status)} style={{width:"100%",padding:"9px",borderRadius:R.input,background:ready?"#DCFCE7":"#F4F4F5",border:`1px solid ${ready?C.success:C.accent}`,color:ready?C.success:C.accent,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'Sora',sans-serif"}}>
            {ready?"✓ Bump — Collected":order.status==="new"?"Start Preparing":"Mark Ready"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{display:"flex",flexDirection:"column",gap:14}}>
      {!soundReady&&<div onClick={activateSound} style={{padding:"10px 16px",background:"#FFFBEB",border:`1px solid #FDE68A`,borderRadius:R.input,marginBottom:12,cursor:"pointer",display:"flex",alignItems:"center",gap:10}}>
        <span style={{fontSize:16}}>🔔</span>
        <span style={{fontSize:13,color:"#92400E",fontWeight:500}}>Tap here to activate order sound alerts — required on mobile/tablet</span>
      </div>}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div><h1 style={{fontSize:20,fontWeight:600,marginBottom:2}}>Kitchen Display</h1><p style={{color:C.muted,fontSize:12}}>{kOrders.length} active · {cols[0].list.length} new · {cols[1].list.length} cooking · {cols[2].list.length} ready</p></div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{display:"flex",gap:4}}>
            {["all","grill","bar","fry","hot"].map(s=><button key={s} onClick={()=>setStF(s)} style={{padding:"4px 10px",borderRadius:R.pill,fontSize:11,fontWeight:500,border:`1px solid ${stF===s?C.accent:C.border}`,background:stF===s?"#F4F4F5":"transparent",color:stF===s?C.accent:C.muted,cursor:"pointer",fontFamily:"'Sora',sans-serif",textTransform:"capitalize"}}>{s}</button>)}
          </div>
          <div style={{fontFamily:"'Space Mono',monospace",fontSize:17,fontWeight:700,color:C.accent}}>{clock.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}</div>
        </div>
      </div>
      {loading?<Spin/>:!kOrders.length?(
        <div style={{textAlign:"center",padding:"60px 20px",background:"#FFFFFF",borderRadius:R.card,border:`1px solid ${C.border}`,boxShadow:"0 1px 3px rgba(0,0,0,.05)"}}>
          <div style={{fontSize:32,opacity:.15,marginBottom:12}}>✓</div>
          <div style={{fontSize:16,fontWeight:500,marginBottom:4}}>Kitchen clear</div>
          <div style={{fontSize:13,color:C.muted}}>No active tickets — all orders are delivered or cancelled.</div>
        </div>
      ):(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14}}>
          {cols.map(col=>(
            <div key={col.lb}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                <div style={{width:7,height:7,borderRadius:"50%",background:col.col}}/>
                <span style={{fontSize:11,fontWeight:600,color:col.col,textTransform:"uppercase",letterSpacing:".08em"}}>{col.lb}</span>
                <span style={{fontSize:11,color:C.muted}}>({col.list.length})</span>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:9}}>
                {!col.list.length?<div style={{fontSize:12,color:C.muted,padding:"18px 0",textAlign:"center"}}>—</div>
                  :col.list.map(o=><Ticket key={o.id} order={o}/>)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── DISPATCH ─────────────────────────────────────────────────────────────────
function Dispatch({ notify, orders=[] }) {
  const {riders,loading,updateStatus,addRider,deleteRider}=useRiders(notify);
  // orders passed from parent via useOrders in App()
  const [showAdd,setShowAdd]=useState(false);
  const [nr,setNr]=useState({name:"",phone:""});
  const [saving,setSaving]=useState(false);

  async function add(){if(!nr.name.trim())return;setSaving(true);await addRider({name:nr.name.trim(),phone:nr.phone.trim(),status:"available"});setNr({name:"",phone:""});setSaving(false);setShowAdd(false);}

  return (
    <div className="fade-in" style={{display:"flex",flexDirection:"column",gap:18}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div><h1 style={{fontSize:20,fontWeight:600,marginBottom:3}}>Dispatch</h1><p style={{color:C.muted,fontSize:13}}>Real-time rider tracking</p></div>
        <Btn label="+ Add Rider" onClick={()=>setShowAdd(true)}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12}}>
        <StatCard icon="◉" label="On delivery" value={riders.filter(r=>r.status==="delivering").length} color={C.info}/>
        <StatCard icon="✓" label="Available"   value={riders.filter(r=>r.status==="available").length} color={C.success}/>
        <StatCard icon="⊘" label="Offline"     value={riders.filter(r=>r.status==="offline").length}   color={C.muted}/>
        <StatCard icon="◎" label="Fleet size"  value={riders.length} color={C.accent}/>
      </div>
      {loading?<Spin/>:(
        <div style={{background:"#FFFFFF",border:`1px solid ${C.border}`,borderRadius:R.card,padding:18,boxShadow:"0 1px 3px rgba(0,0,0,.05)"}}>
          <div style={{fontWeight:500,fontSize:14,marginBottom:14}}>Rider board</div>
          {!riders.length?<Empty msg="No riders yet" action="Add first rider" onAction={()=>setShowAdd(true)}/>
            :riders.map(rider=>{
              const ro=rider.current_order_id?orders.find(o=>o.id===rider.current_order_id):null;
              return(
                <div key={rider.id} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 0",borderBottom:`1px solid ${C.border}`}}>
                  <div style={{width:34,height:34,borderRadius:"50%",background:"#0A0A0B",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:600,fontSize:13,color:"#FFFFFF"}}>{rider.name[0]}</div>
                  <div style={{flex:1}}><div style={{fontWeight:500,fontSize:13}}>{rider.name}</div><div style={{fontSize:11,color:C.muted}}>{rider.phone||"No phone"}{ro?` · ${ro.order_number}`:""}</div></div>
                  <Chip color={rider.status==="available"?"green":rider.status==="delivering"?"blue":"gray"} label={rider.status==="delivering"?"● on delivery":rider.status}/>
                  <div style={{display:"flex",gap:5}}>
                    {rider.status==="delivering"&&<Btn label="Returned" onClick={()=>updateStatus(rider.id,"available",null)} variant="success" size="sm"/>}
                    {rider.status==="available"&&<Btn label="Set offline" onClick={()=>updateStatus(rider.id,"offline")} variant="ghost" size="sm"/>}
                    {rider.status==="offline"&&<Btn label="Set available" onClick={()=>updateStatus(rider.id,"available")} variant="success" size="sm"/>}
                    <ConfirmBtn label="Remove" confirmMsg="Remove this rider?" onConfirm={()=>deleteRider(rider.id)} variant="danger" size="sm"/>
                  </div>
                </div>
              );
            })
          }
        </div>
      )}
      {showAdd&&<Modal title="Add Rider" onClose={()=>setShowAdd(false)} width={380}><div style={{display:"flex",flexDirection:"column",gap:14}}><Inp label="Name" value={nr.name} onChange={v=>setNr({...nr,name:v})} placeholder="e.g. Emeka"/><Inp label="Phone" value={nr.phone} onChange={v=>setNr({...nr,phone:v})} placeholder="+234 XXX XXX XXXX"/><div style={{display:"flex",gap:8}}><Btn label="Cancel" onClick={()=>setShowAdd(false)} variant="ghost"/><Btn label="Add Rider" onClick={add} disabled={!nr.name.trim()} loading={saving}/></div></div></Modal>}
    </div>
  );
}

// ─── LOYALTY ──────────────────────────────────────────────────────────────────
function Loyalty({ notify }) {
  const {customers,loading,addCustomer,updatePoints}=useCustomers(notify);
  const [showAdd,setShowAdd]=useState(false);
  const [editC,setEditC]=useState(null);
  const [nc,setNc]=useState({name:"",phone:""});
  const [ep,setEp]=useState("");
  const [saving,setSaving]=useState(false);
  const [csearch,setCsearch]=useState("");
  const [tierF,setTierF]=useState("All");

  async function add(){if(!nc.phone)return;setSaving(true);await addCustomer({...nc,points:0,tier:"New",total_spend:0,visit_count:0});setNc({name:"",phone:""});setSaving(false);setShowAdd(false);}
  async function editPts(){if(!editC||!ep)return;setSaving(true);await updatePoints(editC.id,parseInt(ep));setSaving(false);setEditC(null);}

  return (
    <div className="fade-in" style={{display:"flex",flexDirection:"column",gap:18}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div><h1 style={{fontSize:20,fontWeight:600,marginBottom:3}}>Loyalty & CRM</h1><p style={{color:C.muted,fontSize:13}}>{customers.length} members</p></div>
        <Btn label="+ Add Customer" onClick={()=>setShowAdd(true)}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12}}>
        <StatCard icon="★" label="VIP"         value={customers.filter(c=>c.tier==="VIP").length}     sub="₦100K+ spent"  color={C.accent}/>
        <StatCard icon="◇" label="Regular"     value={customers.filter(c=>c.tier==="Regular").length} sub="Active"         color={C.info}/>
        <StatCard icon="₦" label="Total spend" value={`₦${Math.round(customers.reduce((s,c)=>s+(c.total_spend||0),0)/1000)}K`} sub="All time" color={C.purple}/>
        <StatCard icon="+" label="Members"     value={customers.length} sub="All time"                color={C.success}/>
      </div>
      {loading?<Spin/>:(
        <div style={{background:"#FFFFFF",border:`1px solid ${C.border}`,borderRadius:R.card,padding:18,boxShadow:"0 1px 3px rgba(0,0,0,.05)"}}>
          <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:14,flexWrap:"wrap"}}>
            <span style={{fontWeight:500,fontSize:14}}>Customer profiles</span>
            <input value={csearch} onChange={e=>setCsearch(e.target.value)} placeholder="Search name or phone..." style={{flex:1,minWidth:160,padding:"6px 11px",borderRadius:R.input,border:`1px solid ${C.border}`,background:"#FFFFFF",color:C.text,fontSize:12,fontFamily:"'Sora',sans-serif",outline:"none"}}/>
            {["All","VIP","Regular","New"].map(t=><button key={t} onClick={()=>setTierF(t)} style={{padding:"4px 10px",borderRadius:R.pill,border:`1px solid ${tierF===t?C.accent:C.border}`,background:tierF===t?C.accent:"transparent",color:tierF===t?"#FFFFFF":C.muted,fontSize:11,cursor:"pointer",fontFamily:"'Sora',sans-serif"}}>{t}</button>)}
          </div>
          {!customers.length?<Empty msg="No customers yet — they appear after their first WhatsApp order"/>
            :customers.filter(c=>(tierF==="All"||c.tier===tierF)&&(!csearch||c.name?.toLowerCase().includes(csearch.toLowerCase())||c.phone?.includes(csearch))).map((c,i)=>(
              <div key={c.id} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 0",borderBottom:i<customers.length-1?`1px solid ${C.border}`:"none"}}>
                <div style={{width:34,height:34,borderRadius:"50%",background:c.tier==="VIP"?"#F4F4F5":"#EFF6FF",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:600,fontSize:12,color:c.tier==="VIP"?C.accent:C.info}}>{(c.name||"?").split(" ").map(p=>p[0]).join("").slice(0,2)}</div>
                <div style={{flex:1}}><div style={{fontWeight:500,fontSize:13,marginBottom:1}}>{c.name||"Unknown"}</div><div style={{fontSize:11,color:C.muted}}>{c.visit_count||0} visits · {c.phone}</div></div>
                <div style={{textAlign:"right",display:"flex",alignItems:"center",gap:10}}>
                  <div><div style={{fontSize:12,fontFamily:"'Space Mono',monospace",marginBottom:4}}>{(c.points||0).toLocaleString()} pts</div><Chip color={c.tier==="VIP"?"amber":c.tier==="Regular"?"blue":"green"} label={c.tier}/></div>
                  <Btn label="Edit pts" onClick={()=>{setEditC(c);setEp(String(c.points||0));}} variant="ghost" size="sm"/>
                </div>
              </div>
            ))
          }
        </div>
      )}
      {showAdd&&<Modal title="Add Customer" onClose={()=>setShowAdd(false)} width={380}><div style={{display:"flex",flexDirection:"column",gap:14}}><Inp label="Name" value={nc.name} onChange={v=>setNc({...nc,name:v})} placeholder="Full name"/><Inp label="Phone" value={nc.phone} onChange={v=>setNc({...nc,phone:v})} placeholder="+234 XXX XXX XXXX"/><div style={{display:"flex",gap:8}}><Btn label="Cancel" onClick={()=>setShowAdd(false)} variant="ghost"/><Btn label="Add" onClick={add} disabled={!nc.phone} loading={saving}/></div></div></Modal>}
      {editC&&<Modal title={`Edit Points — ${editC.name}`} onClose={()=>setEditC(null)} width={340}><div style={{display:"flex",flexDirection:"column",gap:14}}><Inp label="Points balance" value={ep} onChange={setEp} type="number"/><div style={{fontSize:12,color:C.muted}}>Current: {(editC.points||0).toLocaleString()} pts</div><div style={{display:"flex",gap:8}}><Btn label="Cancel" onClick={()=>setEditC(null)} variant="ghost"/><Btn label="Update" onClick={editPts} loading={saving}/></div></div></Modal>}
    </div>
  );
}

// ─── MENU ─────────────────────────────────────────────────────────────────────
function MenuModule({ notify }) {
  const {cats,items,loading,addItem,updateItem,deleteItem,addCat}=useMenu(notify);
  const [activeCat,setActiveCat]=useState(null);
  const [showAI,setShowAI]=useState(false);
  const [editItem,setEditItem]=useState(null);
  const [editForm,setEditForm]=useState({name:"",price:"",description:""});
  useEffect(()=>{ if(editItem) setEditForm({name:editItem.name,price:String(editItem.price),description:editItem.description||""}); },[editItem]);
  const [showAC,setShowAC]=useState(false);
  const [ni,setNi]=useState({name:"",price:"",description:"",category_id:""});
  const [nc,setNc]=useState("");
  const [saving,setSaving]=useState(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(()=>{if(cats.length&&!activeCat)setActiveCat(cats[0].id);},[cats]);

  const filtered=activeCat?items.filter(i=>i.category_id===activeCat):items;
  async function addI(){if(!ni.name||!ni.price)return;setSaving(true);await addItem({name:ni.name.trim(),price:safeNum(ni.price,0),description:ni.description||null,category_id:ni.category_id||activeCat,available:true});setNi({name:"",price:"",description:"",category_id:""});setSaving(false);setShowAI(false);}
  async function addC(){if(!nc.trim())return;setSaving(true);await addCat(nc.trim());setNc("");setSaving(false);setShowAC(false);}

  return (
    <div className="fade-in" style={{display:"flex",flexDirection:"column",gap:18}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div><h1 style={{fontSize:20,fontWeight:600,marginBottom:3}}>Menu</h1><p style={{color:C.muted,fontSize:13}}>{items.length} items · {cats.length} categories</p></div>
        <div style={{display:"flex",gap:8}}><Btn label="+ Category" onClick={()=>setShowAC(true)} variant="ghost"/><Btn label="+ Add Item" onClick={()=>setShowAI(true)}/></div>
      </div>
      {loading?<Spin/>:(
        <>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            {cats.map(c=><button key={c.id} onClick={()=>setActiveCat(c.id)} style={{padding:"5px 13px",borderRadius:R.pill,border:`1px solid ${activeCat===c.id?C.accent:C.border}`,background:activeCat===c.id?C.accent:"transparent",color:activeCat===c.id?"#FFFFFF":C.muted,fontSize:12,cursor:"pointer",fontFamily:"'Sora',sans-serif"}}>{c.name} ({items.filter(i=>i.category_id===c.id).length})</button>)}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))",gap:10}}>
            {filtered.map(item=>(
              <div key={item.id} style={{background:"#FFFFFF",border:`1px solid ${C.border}`,borderRadius:R.card,padding:14,boxShadow:"0 1px 3px rgba(0,0,0,.05)"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><div style={{fontWeight:500,fontSize:13,flex:1}}>{item.name}</div><Chip color={item.available?"green":"red"} label={item.available?"On":"Off"}/></div>
                {item.description&&<div style={{fontSize:11,color:C.muted,marginBottom:7,lineHeight:1.4}}>{item.description.slice(0,55)}{item.description.length>55?"...":""}</div>}
                <div style={{fontSize:18,fontWeight:600,fontFamily:"'Space Mono',monospace",color:C.accent,marginBottom:10}}>₦{item.price.toLocaleString()}</div>
                <div style={{display:"flex",gap:5}}>
                  <button onClick={()=>updateItem(item.id,{available:!item.available})} style={{flex:1,padding:"5px",borderRadius:6,border:`1px solid ${C.border}`,background:"transparent",color:C.muted,fontSize:11,cursor:"pointer",fontFamily:"'Sora',sans-serif"}}>{item.available?"Mark Off":"Mark On"}</button>
                  <Btn label="Edit" onClick={()=>setEditItem(item)} variant="ghost" size="sm"/>
                  <ConfirmBtn label="Delete" confirmMsg="Delete this item?" onConfirm={()=>deleteItem(item.id,item.name)} variant="danger" size="sm"/>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      {editItem&&<Modal title={`Edit — ${editItem.name}`} onClose={()=>setEditItem(null)} width={420}><div style={{display:"flex",flexDirection:"column",gap:14}}><Inp label="Item name" value={editItem.name} onChange={v=>setEditItem({...editItem,name:v})} placeholder="Item name"/><Inp label="Price (₦)" value={String(editItem.price)} onChange={v=>setEditItem({...editItem,price:safeNum(v,editItem.price)})} type="number" placeholder="10000"/><Inp label="Description" value={editItem.description||""} onChange={v=>setEditItem({...editItem,description:v})} placeholder="Brief description"/><div style={{display:"flex",gap:8}}><Btn label="Cancel" onClick={()=>setEditItem(null)} variant="ghost"/><Btn label="Save Changes" onClick={async()=>{setSaving(true);await updateItem(editItem.id,{name:editItem.name,price:editItem.price,description:editItem.description});setSaving(false);setEditItem(null);}} loading={saving}/></div></div></Modal>}
      {showAI&&<Modal title="Add Menu Item" onClose={()=>setShowAI(false)} width={420}><div style={{display:"flex",flexDirection:"column",gap:14}}><Inp label="Item name" value={ni.name} onChange={v=>setNi({...ni,name:v})} placeholder="e.g. Smash Burger"/><Inp label="Price (₦)" value={ni.price} onChange={v=>setNi({...ni,price:v})} type="number" placeholder="10000"/><Inp label="Description (optional)" value={ni.description} onChange={v=>setNi({...ni,description:v})} placeholder="Brief description"/><Sel label="Category" value={ni.category_id||activeCat||""} onChange={v=>setNi({...ni,category_id:v})} options={cats.map(c=>({value:c.id,label:c.name}))}/><div style={{display:"flex",gap:8}}><Btn label="Cancel" onClick={()=>setShowAI(false)} variant="ghost"/><Btn label="Add to Menu" onClick={addI} disabled={!ni.name||!ni.price} loading={saving}/></div></div></Modal>}
      {showAC&&<Modal title="Add Category" onClose={()=>setShowAC(false)} width={340}><div style={{display:"flex",flexDirection:"column",gap:14}}><Inp label="Category name" value={nc} onChange={setNc} placeholder="e.g. Desserts"/><div style={{display:"flex",gap:8}}><Btn label="Cancel" onClick={()=>setShowAC(false)} variant="ghost"/><Btn label="Add" onClick={addC} disabled={!nc.trim()} loading={saving}/></div></div></Modal>}
      {editItem&&<Modal title={`Edit — ${editItem.name}`} onClose={()=>setEditItem(null)} width={420}><div style={{display:"flex",flexDirection:"column",gap:14}}><Inp label="Item name" value={editForm.name} onChange={v=>setEditForm({...editForm,name:v})} placeholder="Item name"/><Inp label="Price (₦)" value={editForm.price} onChange={v=>setEditForm({...editForm,price:v})} type="number" placeholder="10000"/><Inp label="Description" value={editForm.description} onChange={v=>setEditForm({...editForm,description:v})} placeholder="Brief description"/><div style={{display:"flex",gap:8}}><Btn label="Cancel" onClick={()=>setEditItem(null)} variant="ghost"/><Btn label="Save Changes" onClick={async()=>{if(!editForm.name||!editForm.price)return;setSaving(true);await updateItem(editItem.id,{name:editForm.name.trim(),price:safeNum(editForm.price,0),description:editForm.description||null});setSaving(false);setEditItem(null);}} disabled={!editForm.name||!editForm.price} loading={saving}/></div></div></Modal>}
    </div>
  );
}

// ─── INVENTORY ────────────────────────────────────────────────────────────────
function Inventory({ notify }) {
  const {inv,loading,addIng,updateQty,deleteIng}=useInventory(notify);
  const [showAdd,setShowAdd]=useState(false);
  const [editing,setEditing]=useState(null);
  const [ni,setNi]=useState({name:"",quantity:"",unit:"kg",threshold:""});
  const [nq,setNq]=useState("");
  const [saving,setSaving]=useState(false);
  const low=inv.filter(i=>i.quantity<=i.threshold);

  async function add(){if(!ni.name||!ni.quantity)return;setSaving(true);await addIng({name:ni.name,quantity:parseFloat(ni.quantity),unit:ni.unit,threshold:parseFloat(ni.threshold)||2});setNi({name:"",quantity:"",unit:"kg",threshold:""});setSaving(false);setShowAdd(false);}
  async function upd(){if(!editing||!nq)return;setSaving(true);await updateQty(editing.id,parseFloat(nq),editing.name,editing.threshold,editing.quantity);setSaving(false);setEditing(null);}

  return (
    <div className="fade-in" style={{display:"flex",flexDirection:"column",gap:18}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div><h1 style={{fontSize:20,fontWeight:600,marginBottom:3}}>Inventory</h1><p style={{color:C.muted,fontSize:13}}>{inv.length} ingredients · {low.length} low stock</p></div>
        <Btn label="+ Add Ingredient" onClick={()=>setShowAdd(true)}/>
      </div>
      {low.length>0&&<div style={{padding:"12px 16px",background:"#FEF2F2",border:`1px solid #FECACA`,borderRadius:R.card}}><div style={{fontSize:12,fontWeight:500,color:"#DC2626",marginBottom:3}}>⚠ Low stock alert</div><div style={{fontSize:11,color:C.muted}}>{low.map(i=>`${i.name} (${i.quantity}${i.unit})`).join(" · ")}</div></div>}
      {loading?<Spin/>:!inv.length?<Empty msg="No ingredients tracked" action="Add first ingredient" onAction={()=>setShowAdd(true)}/>:(
        <div style={{background:"#FFFFFF",border:`1px solid ${C.border}`,borderRadius:R.card,overflow:"hidden"}}>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 100px",gap:10,padding:"10px 18px",background:"#F7F7F7",borderBottom:`1px solid ${C.border}`}}>
            {["Ingredient","Qty","Unit","Threshold",""].map(h=><div key={h} style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:".07em",fontWeight:500}}>{h}</div>)}
          </div>
          {inv.map(item=>{
            const isLow=item.quantity<=item.threshold;
            return(
              <div key={item.id} style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 100px",gap:10,padding:"11px 18px",borderBottom:`1px solid ${C.border}`,alignItems:"center"}}>
                <div style={{fontWeight:500,fontSize:13,color:isLow?C.danger:C.text}}>{item.name}{isLow&&<span style={{marginLeft:6,fontSize:10,color:C.danger}}>⚠</span>}</div>
                <div style={{fontFamily:"'Space Mono',monospace",fontSize:13,color:isLow?C.danger:C.text}}>{item.quantity}</div>
                <div style={{fontSize:12,color:C.muted}}>{item.unit}</div>
                <div style={{fontSize:12,color:C.muted}}>{item.threshold}</div>
                <div style={{display:"flex",gap:4}}><Btn label="Update" onClick={()=>{setEditing(item);setNq(String(item.quantity));}} variant="ghost" size="sm"/><ConfirmBtn label="×" confirmMsg="Remove ingredient?" onConfirm={()=>deleteIng(item.id)} variant="danger" size="sm"/></div>
              </div>
            );
          })}
        </div>
      )}
      {showAdd&&<Modal title="Add Ingredient" onClose={()=>setShowAdd(false)} width={400}><div style={{display:"flex",flexDirection:"column",gap:14}}><Inp label="Name" value={ni.name} onChange={v=>setNi({...ni,name:v})} placeholder="e.g. Beef"/><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><Inp label="Quantity" value={ni.quantity} onChange={v=>setNi({...ni,quantity:v})} type="number" placeholder="10"/><Sel label="Unit" value={ni.unit} onChange={v=>setNi({...ni,unit:v})} options={["kg","g","L","units","bottles","bags"].map(u=>({value:u,label:u}))}/></div><Inp label="Low stock threshold" value={ni.threshold} onChange={v=>setNi({...ni,threshold:v})} type="number" placeholder="2" note="Alert fires when quantity drops to this level"/><div style={{display:"flex",gap:8}}><Btn label="Cancel" onClick={()=>setShowAdd(false)} variant="ghost"/><Btn label="Add" onClick={add} disabled={!ni.name||!ni.quantity} loading={saving}/></div></div></Modal>}
      {editing&&<Modal title={`Update — ${editing.name}`} onClose={()=>setEditing(null)} width={340}><div style={{display:"flex",flexDirection:"column",gap:14}}><Inp label={`New quantity (${editing.unit})`} value={nq} onChange={setNq} type="number"/><div style={{fontSize:11,color:C.muted}}>Current: {editing.quantity}{editing.unit} · Threshold: {editing.threshold}</div><div style={{display:"flex",gap:8}}><Btn label="Cancel" onClick={()=>setEditing(null)} variant="ghost"/><Btn label="Update Stock" onClick={upd} loading={saving}/></div></div></Modal>}
    </div>
  );
}

// ─── ANALYTICS ────────────────────────────────────────────────────────────────
function Analytics({ orders:passedOrders=[], fetchAllOrders }) {
  const [fullOrders,setFullOrders]=useState(passedOrders);
  const [loading,setLoading]=useState(false);
  const [range,setRange]=useState("7d");
  const [customFrom,setCustomFrom]=useState("");
  const [customTo,setCustomTo]=useState("");

  useEffect(()=>{
    if(fetchAllOrders&&range!=="7d"){
      setLoading(true);
      fetchAllOrders().then(d=>{if(d)setFullOrders(d);setLoading(false);});
    } else {
      setFullOrders(passedOrders);
    }
  },[range]); // eslint-disable-line react-hooks/exhaustive-deps

  // Filter orders by selected range
  const now=new Date();
  const filteredOrders=fullOrders.filter(o=>{
    const d=new Date(o.created_at);
    if(range==="7d")  return d>=new Date(now-7*86400000);
    if(range==="30d") return d>=new Date(now-30*86400000);
    if(range==="90d") return d>=new Date(now-90*86400000);
    if(range==="custom"&&customFrom&&customTo)
      return d>=new Date(customFrom)&&d<=new Date(customTo+"T23:59:59");
    return true;
  });
  // orders = filteredOrders (scoped above)
  const chartDays=range==="7d"?7:range==="30d"?30:range==="90d"?90:30;
  const days=Array.from({length:Math.min(chartDays,30)},(_,i)=>{const d=new Date();d.setDate(d.getDate()-(Math.min(chartDays,30)-1-i));return d.toDateString();});
  const orders=filteredOrders; // use filtered set for all calculations
  const total=orders.reduce((s,o)=>s+(o.total||0),0);
  const chart=days.map(day=>({lb:new Date(day).toLocaleDateString("en-GB",{weekday:"short"}),v:orders.filter(o=>new Date(o.created_at).toDateString()===day).reduce((s,o)=>s+(o.total||0),0)}));
  const maxV=Math.max(...chart.map(d=>d.v),1);
  const ic={};orders.forEach(o=>{if(Array.isArray(o.items))o.items.forEach(i=>{ic[i.name]=(ic[i.name]||0)+(i.qty||1);});});
  const top=Object.entries(ic).sort(([,a],[,b])=>b-a).slice(0,8);

  return (
    <div className="fade-in" style={{display:"flex",flexDirection:"column",gap:18}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
        <div><h1 style={{fontSize:20,fontWeight:600,marginBottom:3}}>Analytics</h1><p style={{color:C.muted,fontSize:13}}>₦{total.toLocaleString()} · {orders.length} orders · {range==="custom"?"custom range":range==="7d"?"last 7 days":range==="30d"?"last 30 days":"last 90 days"}</p></div>
        <div style={{display:"flex",gap:5,flexWrap:"wrap",alignItems:"center"}}>
          {["7d","30d","90d","custom"].map(r=><button key={r} onClick={()=>setRange(r)} style={{padding:"5px 12px",borderRadius:R.pill,border:`1px solid ${range===r?C.accent:C.border}`,background:range===r?C.accent:"transparent",color:range===r?"#FFFFFF":C.muted,fontSize:11,cursor:"pointer",fontFamily:"'Sora',sans-serif"}}>{r==="7d"?"7 days":r==="30d"?"30 days":r==="90d"?"90 days":"Custom"}</button>)}
          {range==="custom"&&<>
            <input type="date" value={customFrom} onChange={e=>setCustomFrom(e.target.value)} style={{padding:"4px 8px",borderRadius:R.input,border:`1px solid ${C.border}`,background:"#FFFFFF",color:C.text,fontSize:11,fontFamily:"'Sora',sans-serif",outline:"none"}}/>
            <span style={{fontSize:11,color:C.muted}}>to</span>
            <input type="date" value={customTo} onChange={e=>setCustomTo(e.target.value)} style={{padding:"4px 8px",borderRadius:R.input,border:`1px solid ${C.border}`,background:"#FFFFFF",color:C.text,fontSize:11,fontFamily:"'Sora',sans-serif",outline:"none"}}/>
          </>}
        </div>
      </div>
      {loading?<Spin/>:(
        <>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12}}>
            <StatCard icon="₦" label="Total revenue" value={`₦${Math.round(total/1000)}K`} sub="All time"/>
            <StatCard icon="◎" label="Total orders"  value={orders.length} color={C.info}/>
            <StatCard icon="✓" label="Delivered"     value={orders.filter(o=>o.status==="delivered").length} color={C.success}/>
            <StatCard icon="⊘" label="Cancelled"     value={orders.filter(o=>o.status==="cancelled").length} color={C.danger}/>
          </div>
          <div style={{background:"#FFFFFF",border:`1px solid ${C.border}`,borderRadius:R.card,padding:18,boxShadow:"0 1px 3px rgba(0,0,0,.05)"}}>
            <div style={{fontWeight:500,fontSize:14,marginBottom:18}}>Daily revenue — last 7 days</div>
            <div style={{display:"flex",alignItems:"flex-end",gap:10,height:150}}>
              {chart.map((d,i)=>(
                <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                  <div style={{fontSize:9,color:C.muted,fontFamily:"'Space Mono',monospace"}}>{d.v?`₦${Math.round(d.v/1000)}K`:""}</div>
                  <div style={{width:"100%",background:i===6?"#0A0A0B":"#D4D4D8",borderRadius:"3px 3px 0 0",height:`${(d.v/maxV)*100}%`,minHeight:4}}/>
                  <div style={{fontSize:10,color:i===6?C.accent:C.muted,fontWeight:i===6?600:400}}>{d.lb}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <div style={{background:"#FFFFFF",border:`1px solid ${C.border}`,borderRadius:R.card,padding:18,boxShadow:"0 1px 3px rgba(0,0,0,.05)"}}>
              <div style={{fontWeight:500,fontSize:14,marginBottom:12}}>Top selling items</div>
              {!top.length?<Empty msg="Orders will show here"/>
                :top.map(([name,count],i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderBottom:i<top.length-1?`1px solid ${C.border}`:"none"}}>
                    <div style={{width:18,height:18,borderRadius:3,background:"#F4F4F5",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:C.accent,fontWeight:600}}>{i+1}</div>
                    <div style={{flex:1,fontSize:12}}>{name}</div>
                    <div style={{fontSize:12,fontFamily:"'Space Mono',monospace",color:C.success}}>{count}×</div>
                  </div>
                ))
              }
            </div>
            <div style={{background:"#FFFFFF",border:`1px solid ${C.border}`,borderRadius:R.card,padding:18,boxShadow:"0 1px 3px rgba(0,0,0,.05)"}}>
              <div style={{fontWeight:500,fontSize:14,marginBottom:12}}>By order type</div>
              {["delivery","pickup","dine-in"].map((t,i)=>{
                const tv=orders.filter(o=>o.type===t).reduce((s,o)=>s+(o.total||0),0);
                return(
                  <div key={t} style={{marginBottom:12}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:5,fontSize:12}}>
                      <span style={{textTransform:"capitalize"}}>{t}</span>
                      <span style={{fontFamily:"'Space Mono',monospace",color:C.accent}}>₦{Math.round(tv/1000)}K</span>
                    </div>
                    <div style={{height:5,background:C.border,borderRadius:3,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${total?tv/total*100:0}%`,background:[C.info,C.accent,C.purple][i],borderRadius:3}}/>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── CAMPAIGNS ────────────────────────────────────────────────────────────────
function Campaigns({ notify }) {
  const {customers}=useCustomers();
  const [msg,setMsg]=useState("");
  const [aud,setAud]=useState("all");
  const [sending,setSending]=useState(false);
  const [history,setHistory]=useState([]);
  const [histLoading,setHistLoading]=useState(true);
  useEffect(()=>{
    supabase.from("campaigns").select("*")
      .eq("restaurant_id",RESTAURANT_ID)
      .order("sent_at",{ascending:false}).limit(20)
      .then(({data})=>{
        if(data) setHistory(data.map(c=>({
          id:c.id, msg:c.message, aud:c.audience,
          count:c.recipient_count,
          time:new Date(c.sent_at).toLocaleString("en-GB",{hour:"2-digit",minute:"2-digit",day:"2-digit",month:"short"})
        })));
        setHistLoading(false);
      });
  },[]);

  const opts=[
    {v:"all",lb:"All customers",count:customers.length},
    {v:"vip",lb:"VIP only",count:customers.filter(c=>c.tier==="VIP").length},
    {v:"inactive",lb:"Inactive 21+ days",count:customers.filter(c=>c.last_visit&&(Date.now()-new Date(c.last_visit))>21*86400000).length},
    {v:"new",lb:"New customers",count:customers.filter(c=>c.tier==="New").length},
  ];
  const sel=opts.find(o=>o.v===aud);

  async function send(){
    if(!msg.trim()||!sel?.count)return;
    setSending(true);
    // Save to Supabase campaigns table
    await supabase.from("campaigns").insert({restaurant_id:RESTAURANT_ID,message:msg.trim(),audience:sel.lb,recipient_count:sel.count});
    await new Promise(r=>setTimeout(r,1200));
    setHistory(p=>[{id:Date.now(),msg:msg.trim(),aud:sel.lb,count:sel.count,time:new Date().toLocaleString("en-GB",{hour:"2-digit",minute:"2-digit",day:"2-digit",month:"short"})},...p]);
    setMsg("");setSending(false);
    notify(`Campaign sent to ${sel.count} contacts`);
  }

  return (
    <div className="fade-in" style={{display:"flex",flexDirection:"column",gap:18}}>
      <div><h1 style={{fontSize:20,fontWeight:600,marginBottom:3}}>Campaigns</h1><p style={{color:C.muted,fontSize:13}}>Send WhatsApp messages to customer segments</p></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
        <div style={{background:"#FFFFFF",border:`1px solid ${C.border}`,borderRadius:R.card,padding:20,display:"flex",flexDirection:"column",gap:14}}>
          <div style={{fontWeight:500,fontSize:14}}>New campaign</div>
          <div>
            <label style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:".06em",display:"block",marginBottom:7}}>Audience</label>
            {opts.map(o=>(
              <button key={o.v} onClick={()=>setAud(o.v)} style={{width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 12px",borderRadius:R.input,border:`1px solid ${aud===o.v?C.accent:C.border}`,background:aud===o.v?"#F4F4F5":"#FFFFFF",cursor:"pointer",fontFamily:"'Sora',sans-serif",marginBottom:5}}>
                <span style={{fontSize:13,color:aud===o.v?C.accent:C.text}}>{o.lb}</span>
                <span style={{fontSize:11,color:C.muted,fontFamily:"'Space Mono',monospace"}}>{o.count}</span>
              </button>
            ))}
          </div>
          <div>
            <label style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:".06em",display:"block",marginBottom:5}}>Message</label>
            <textarea value={msg} onChange={e=>setMsg(e.target.value)} placeholder="Hi {name}! 🔥 Special offer just for you..." rows={4}
              style={{width:"100%",padding:"10px 13px",background:"#FFFFFF",border:`1px solid ${C.border}`,borderRadius:R.input,color:C.text,fontSize:13,fontFamily:"'Sora',sans-serif",outline:"none",resize:"vertical"}}/>
            <div style={{fontSize:10,color:C.muted,marginTop:3}}>Use {"{name}"} to personalise</div>
          </div>
          <Btn label={`Send to ${sel?.count||0} contacts`} onClick={send} disabled={!msg.trim()||!sel?.count} loading={sending}/>
          <div style={{padding:"10px 12px",background:"#EFF6FF",border:`1px solid #BFDBFE`,borderRadius:R.input,fontSize:11,color:C.muted}}>Sent via WhatsApp Business API through your n8n workflow.</div>
        </div>
        <div style={{background:"#FFFFFF",border:`1px solid ${C.border}`,borderRadius:R.card,padding:20}}>
          <div style={{fontWeight:500,fontSize:14,marginBottom:14}}>Campaign history</div>
          {histLoading?<Spin size={20}/>:!history.length?<Empty icon="⚡" msg="No campaigns sent yet"/>
            :history.map(c=>(
              <div key={c.id} style={{padding:"11px 0",borderBottom:`1px solid ${C.border}`}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                  <Chip color="green" label={`${c.count} sent`}/><span style={{fontSize:10,color:C.muted}}>{c.time}</span>
                </div>
                <div style={{fontSize:12,fontWeight:500,marginBottom:3}}>{c.aud}</div>
                <div style={{fontSize:11,color:C.muted,lineHeight:1.5}}>{c.msg.slice(0,80)}{c.msg.length>80?"...":""}</div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}

// ─── TABLES & QR ─────────────────────────────────────────────────────────────
function Tables({ notify }) {
  const {restaurant}=useRestaurant();
  const [tables,setTables]=useState([]);
  const [loading,setLoading]=useState(true);
  const [showAdd,setShowAdd]=useState(false);
  const [newName,setNewName]=useState("");

  useEffect(()=>{
    supabase.from("restaurant_tables").select("*").eq("restaurant_id",RESTAURANT_ID).order("name").then(({data})=>{
      // Only use real Supabase data — no fake fallback that mixes with real rows
      setTables(data||[]);
      setLoading(false);
    });
  },[]);

  const waNum=(restaurant?.whatsapp_number||"+2349010000000").replace(/\D/g,"");
  const qrUrl=code=>`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(`https://wa.me/${waNum}?text=Hi%2C+I+want+to+order+from+${code}`)}&size=180x180&bgcolor=18181B&color=F5A623`;

  async function add(){
    if(!newName.trim())return;
    const code=newName.trim().replace(/\s+/g,"").toUpperCase();
    const {data}=await supabase.from("restaurant_tables").insert({restaurant_id:RESTAURANT_ID,name:newName.trim(),table_code:code,active:true}).select().single();
    if(data)setTables(p=>[...p,data]);
    setNewName("");setShowAdd(false);notify(`${newName} added`);
  }

  async function toggle(id,active){await supabase.from("restaurant_tables").update({active}).eq("id",id);setTables(p=>p.map(t=>t.id===id?{...t,active}:t));}
  async function remove(id,name){await supabase.from("restaurant_tables").delete().eq("id",id);setTables(p=>p.filter(t=>t.id!==id));notify(`${name} removed`,"info");}

  return (
    <div className="fade-in" style={{display:"flex",flexDirection:"column",gap:18}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div><h1 style={{fontSize:20,fontWeight:600,marginBottom:3}}>Tables & QR Codes</h1><p style={{color:C.muted,fontSize:13}}>{tables.length} tables · Scan to order on WhatsApp</p></div>
        <div style={{display:"flex",gap:8}}><Btn label="🖨 Print All" onClick={()=>window.print()} variant="ghost"/><Btn label="+ Add Table" onClick={()=>setShowAdd(true)}/></div>
      </div>
      <div style={{padding:"11px 14px",background:"#EFF6FF",border:`1px solid #BFDBFE`,borderRadius:R.input,fontSize:12,color:C.muted}}>Each QR code opens WhatsApp pre-loaded with your ordering number and table. Print and laminate for each table.</div>
      {loading?<Spin/>:(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))",gap:12}}>
          {tables.map(t=>(
            <div key={t.id} style={{background:"#FFFFFF",border:`1px solid ${C.border}`,borderRadius:R.card,padding:14,boxShadow:"0 1px 3px rgba(0,0,0,.05)",textAlign:"center"}}>
              <div style={{fontWeight:600,fontSize:14,marginBottom:10,color:C.accent}}>{t.name}</div>
              <img src={qrUrl(t.table_code)} alt={`QR ${t.name}`} style={{width:130,height:130,borderRadius:8,marginBottom:10}} onError={e=>{e.target.style.display="none";}}/>
              <div style={{fontSize:10,color:C.muted,marginBottom:10}}>wa.me/{waNum}</div>
              <div style={{display:"flex",gap:5,justifyContent:"center"}}>
                <Btn label={t.active?"Active":"Inactive"} onClick={()=>toggle(t.id,!t.active)} variant={t.active?"success":"ghost"} size="sm"/>
                <ConfirmBtn label="×" confirmMsg="Remove this table?" onConfirm={()=>remove(t.id,t.name)} variant="danger" size="sm"/>
              </div>
            </div>
          ))}
        </div>
      )}
      {showAdd&&<Modal title="Add Table" onClose={()=>setShowAdd(false)} width={340}><div style={{display:"flex",flexDirection:"column",gap:14}}><Inp label="Table name" value={newName} onChange={setNewName} placeholder="e.g. Table 11 or VIP Booth"/><div style={{display:"flex",gap:8}}><Btn label="Cancel" onClick={()=>setShowAdd(false)} variant="ghost"/><Btn label="Add Table" onClick={add} disabled={!newName.trim()}/></div></div></Modal>}
    </div>
  );
}

// ─── REPORTS ─────────────────────────────────────────────────────────────────
function Reports({ orders=[], notify }) {
  const loading=false;
  const {riders}=useRiders();
  const [reportPeriod,setReportPeriod]=useState("today");

  // Compute period bounds
  const now=new Date();
  const startOf=(unit)=>{
    const d=new Date(now);
    if(unit==="today"){d.setHours(0,0,0,0);return d;}
    if(unit==="week"){d.setDate(d.getDate()-d.getDay());d.setHours(0,0,0,0);return d;}
    if(unit==="month"){d.setDate(1);d.setHours(0,0,0,0);return d;}
    return d;
  };
  const periodStart=startOf(reportPeriod);
  const tod=orders.filter(o=>new Date(o.created_at)>=periodStart);
  const rev=tod.reduce((s,o)=>s+(o.total||0),0);
  const ic={};tod.forEach(o=>{if(Array.isArray(o.items))o.items.forEach(i=>{ic[i.name]=(ic[i.name]||0)+(i.qty||1);});});
  const top=Object.entries(ic).sort(([,a],[,b])=>b-a)[0];
  const peak=(()=>{const h={};tod.forEach(o=>{const hr=new Date(o.created_at).getHours();h[hr]=(h[hr]||0)+1;});const p=Object.entries(h).sort(([,a],[,b])=>b-a)[0];return p?`${p[0]}:00`:"—";})();
  const periodLabel=reportPeriod==="today"?new Date().toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"}):reportPeriod==="week"?"This week":reportPeriod==="month"?"This month":"Period";

  const rpt=`📊 ${reportPeriod==="today"?"DAILY":reportPeriod==="week"?"WEEKLY":"MONTHLY"} REPORT — ${periodLabel}\n\nRevenue:    ₦${rev.toLocaleString()}\nOrders:     ${tod.length}\nDelivered:  ${tod.filter(o=>o.status==="delivered").length}\nTop item:   ${top?top[0]:"—"}\nPeak hour:  ${peak}\nRiders out: ${riders.filter(r=>r.status==="delivering").length}\n\nPowered by Demi 🔥 demi-alpha.vercel.app`;

  function copy(){navigator.clipboard.writeText(rpt).then(()=>notify("Report copied — paste to WhatsApp"));}

  return (
    <div className="fade-in" style={{display:"flex",flexDirection:"column",gap:18}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
        <div><h1 style={{fontSize:20,fontWeight:600,marginBottom:3}}>Reports</h1><p style={{color:C.muted,fontSize:13}}>{periodLabel}</p></div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <div style={{display:"flex",gap:4}}>
            {["today","week","month"].map(p=><button key={p} onClick={()=>setReportPeriod(p)} style={{padding:"5px 12px",borderRadius:R.pill,border:`1px solid ${reportPeriod===p?C.accent:C.border}`,background:reportPeriod===p?C.accent:"transparent",color:reportPeriod===p?"#FFFFFF":C.muted,fontSize:11,cursor:"pointer",fontFamily:"'Sora',sans-serif",textTransform:"capitalize"}}>{p==="today"?"Today":p==="week"?"This week":"This month"}</button>)}
          </div>
          <Btn label="📋 Copy & Send" onClick={copy}/>
        </div>
      </div>
      {loading?<Spin/>:(
        <>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12}}>
            <StatCard icon="₦" label={reportPeriod==="today"?"Revenue today":reportPeriod==="week"?"Revenue this week":"Revenue this month"} value={`₦${Math.round(rev/1000)}K`} sub={`${tod.length} orders`}/>
            <StatCard icon="✓" label="Delivered"       value={tod.filter(o=>o.status==="delivered").length} color={C.success}/>
            <StatCard icon="★" label="Top item"        value={(top?top[0]:"—").slice(0,12)} color={C.accent}/>
            <StatCard icon="⏱" label="Peak hour"       value={peak} color={C.purple}/>
          </div>
          <div style={{background:"#FFFFFF",border:`1px solid ${C.border}`,borderRadius:R.card,padding:18,boxShadow:"0 1px 3px rgba(0,0,0,.05)"}}>
            <div style={{fontWeight:500,fontSize:14,marginBottom:14}}>Report preview</div>
            <pre style={{background:"#F7F7F7",borderRadius:R.input,padding:18,fontFamily:"'Space Mono',monospace",fontSize:12,lineHeight:2,color:C.text,whiteSpace:"pre-wrap"}}>{rpt}</pre>
          </div>
          <div style={{background:"#FFFFFF",border:`1px solid ${C.border}`,borderRadius:R.card,padding:18,boxShadow:"0 1px 3px rgba(0,0,0,.05)"}}>
            <div style={{fontWeight:500,fontSize:14,marginBottom:8}}>Automated morning reports</div>
            <div style={{fontSize:12,color:C.muted,lineHeight:1.7,marginBottom:12}}>Set up your n8n workflow to send this report automatically every morning at 8am via WhatsApp.</div>
            <div style={{padding:"10px 14px",background:"#F4F4F5",border:`1px solid ${C.accent}30`,borderRadius:R.input,fontSize:11,color:C.accent}}>n8n: Schedule trigger (8am) → Supabase query → Format → WhatsApp API send</div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── BOT SETUP ────────────────────────────────────────────────────────────────
function BotSetup() {
  const [botOn,setBotOn]=useState(true);
  const [upsellOn,setUpsellOn]=useState(true);
  const [igOn,setIgOn]=useState(true);
  const [reviewOn,setReviewOn]=useState(false);
  return (
    <div className="fade-in" style={{display:"flex",flexDirection:"column",gap:18}}>
      <div><h1 style={{fontSize:20,fontWeight:600,marginBottom:3}}>Bot Setup</h1><p style={{color:C.muted,fontSize:13}}>WhatsApp bot · Instagram DM · Review collection</p></div>
      {[
        {label:"WhatsApp ordering bot",sub:"n8n · Supabase connected · Meta WhatsApp API",on:botOn,set:setBotOn,status:true,note:"✓ Connected to Supabase. New orders appear on kitchen display in real time.",noteColor:C.success},
        {label:"Smart upsell engine",sub:"Drink-only and food-only order detection",on:upsellOn,set:setUpsellOn},
        {label:"Instagram DM redirector",sub:"Keyword detection → WhatsApp redirect",on:igOn,set:setIgOn,note:"Connect your Meta Developer App to activate.",noteColor:C.pink},
        {label:"Review collection",sub:"Auto WhatsApp 30min after delivery → Google review",on:reviewOn,set:setReviewOn,note:reviewOn?"4★/5★ → Google review link · 3★ or below → private complaint to owner":undefined,noteColor:C.success},
      ].map((s,i)=>(
        <div key={i} style={{background:"#FFFFFF",border:`1px solid ${C.border}`,borderRadius:R.card,padding:18,boxShadow:"0 1px 3px rgba(0,0,0,.05)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:s.note?12:0}}>
            <div><div style={{fontWeight:500,fontSize:14,marginBottom:2}}>{s.label}</div><div style={{fontSize:11,color:C.muted}}>{s.sub}</div></div>
            <div style={{display:"flex",alignItems:"center",gap:10}}><Chip color={s.on?"green":"gray"} label={s.on?"● Active":"Off"}/><Toggle on={s.on} set={s.set}/></div>
          </div>
          {s.note&&<div style={{padding:"9px 12px",background:`${s.noteColor}10`,border:`1px solid ${s.noteColor}30`,borderRadius:R.input,fontSize:11,color:s.noteColor}}>{s.note}</div>}
          {s.on&&s.label.includes("upsell")&&(
            <div style={{marginTop:12,display:"flex",flexDirection:"column",gap:6}}>
              {[
                {t:"Drinks only ordered",s:"Suggests Smash Burger, Wings or Sides",r:"38%"},
                {t:"Food only ordered",s:"Suggests Smoothie, Milkshake or Cocktail",r:"42%"},
                {t:"Shawarma ordered",s:"Adds sausage for ₦500",r:"61%"},
                {t:"Order under ₦10,000",s:"Suggests Plantain Sticks or Sweet Potato Flats",r:"31%"},
                {t:"Late night (10pm–4am)",s:"Suggests Straw-Booty or POP That",r:"44%"},
                {t:"High value order",s:"Suggests Cocoa Fudge Bar or Banana Bread",r:"29%"},
              ].map((u,j)=>(
                <div key={j} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 11px",background:"#F7F7F7",borderRadius:R.input}}>
                  <div style={{width:6,height:6,borderRadius:"50%",background:C.success,flexShrink:0}}/>
                  <div style={{flex:1,fontSize:12}}><span style={{fontWeight:500}}>{u.t}</span><span style={{color:C.muted}}> — {u.s}</span></div>
                  <Chip color="green" label={`${u.r} accept`}/>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── SETTINGS ─────────────────────────────────────────────────────────────────
function Settings({ notify, user, signOut }) {
  const {restaurant,staff,updateRestaurant,addStaff,removeStaff}=useRestaurant();
  const [form,setForm]=useState({name:"",whatsapp_number:"",owner_phone:"",plan:""});
  const [saving,setSaving]=useState(false);
  const [showAS,setShowAS]=useState(false);
  const [ns,setNs]=useState({name:"",email:"",role:"cashier"});
  useEffect(()=>{if(restaurant)setForm({name:restaurant.name||"",whatsapp_number:restaurant.whatsapp_number||"",owner_phone:restaurant.owner_phone||"",plan:restaurant.plan||"starter"});},[restaurant]);

  async function save(){setSaving(true);await updateRestaurant({name:form.name,whatsapp_number:form.whatsapp_number,owner_phone:form.owner_phone});notify("Settings saved");setSaving(false);}
  async function addS(){await addStaff(ns);setNs({name:"",email:"",role:"cashier"});setShowAS(false);notify(`${ns.name} added`);}

  const plan=PLANS[form.plan]||PLANS.starter;

  return (
    <div className="fade-in" style={{display:"flex",flexDirection:"column",gap:18}}>
      <div><h1 style={{fontSize:20,fontWeight:600,marginBottom:3}}>Settings</h1><p style={{color:C.muted,fontSize:13}}>Restaurant configuration and team management</p></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <div style={{background:"#FFFFFF",border:`1px solid ${C.border}`,borderRadius:R.card,padding:20,display:"flex",flexDirection:"column",gap:14}}>
          <div style={{fontWeight:500,fontSize:14}}>Restaurant details</div>
          <Inp label="Restaurant name" value={form.name} onChange={v=>setForm({...form,name:v})} placeholder="Gogi Restaurant"/>
          <Inp label="WhatsApp ordering number" value={form.whatsapp_number} onChange={v=>setForm({...form,whatsapp_number:v})} placeholder="+234 901 XXX XXXX"/>
          <Inp label="Owner phone" value={form.owner_phone} onChange={v=>setForm({...form,owner_phone:v})} placeholder="+234 XXX XXX XXXX"/>
          <Btn label="Save Settings" onClick={save} loading={saving}/>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={{background:"#FFFFFF",border:`1px solid ${C.border}`,borderRadius:R.card,padding:20}}>
            <div style={{fontWeight:500,fontSize:14,marginBottom:10}}>Current plan</div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 14px",background:"#F7F7F7",borderRadius:R.input,marginBottom:10}}>
              <div><div style={{fontWeight:600,fontSize:14,color:plan.color,textTransform:"capitalize"}}>{plan.label}</div><div style={{fontSize:11,color:C.muted}}>₦{plan.price.toLocaleString()}/month</div></div>
              <Chip color="green" label="Active"/>
            </div>
            {plan.features.map(f=><div key={f} style={{fontSize:11,color:C.muted,padding:"3px 0",borderBottom:`1px solid ${C.border}`}}>✓ {f}</div>)}
          </div>
          <div style={{background:"#FFFFFF",border:`1px solid ${C.border}`,borderRadius:R.card,padding:20}}>
            <div style={{fontWeight:500,fontSize:14,marginBottom:6}}>Account</div>
            <div style={{fontSize:12,color:C.muted,marginBottom:14}}>{user?.email||"Not signed in"}</div>
            <Btn label="Sign out" onClick={signOut} variant="ghost"/>
          </div>
        </div>
      </div>
      <div style={{background:"#FFFFFF",border:`1px solid ${C.border}`,borderRadius:R.card,padding:20}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{fontWeight:500,fontSize:14}}>Staff accounts</div>
          <Btn label="+ Add Staff" onClick={()=>setShowAS(true)}/>
        </div>
        {!staff.length?<Empty msg="No staff accounts yet" action="Add first staff member" onAction={()=>setShowAS(true)}/>
          :staff.map((s,i)=>(
            <div key={s.id||i} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:`1px solid ${C.border}`}}>
              <div style={{width:30,height:30,borderRadius:"50%",background:"#DBEAFE",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:600,color:C.info}}>{(s.name||"?")[0]}</div>
              <div style={{flex:1}}><div style={{fontSize:13,fontWeight:500}}>{s.name}</div><div style={{fontSize:11,color:C.muted}}>{s.email}</div></div>
              <Chip color="blue" label={s.role}/>
              <ConfirmBtn label="Remove" confirmMsg="Remove staff member?" onConfirm={()=>removeStaff(s.id)} variant="danger" size="sm"/>
            </div>
          ))
        }
      </div>
      {showAS&&<Modal title="Add Staff Member" onClose={()=>setShowAS(false)} width={400}><div style={{display:"flex",flexDirection:"column",gap:14}}><Inp label="Name" value={ns.name} onChange={v=>setNs({...ns,name:v})} placeholder="Staff name"/><Inp label="Email" value={ns.email} onChange={v=>setNs({...ns,email:v})} placeholder="staff@restaurant.com" type="email"/><Sel label="Role" value={ns.role} onChange={v=>setNs({...ns,role:v})} options={[{value:"manager",label:"Manager — full access"},{value:"kitchen",label:"Kitchen — kitchen display only"},{value:"cashier",label:"Cashier — orders and menu"}]}/><div style={{display:"flex",gap:8}}><Btn label="Cancel" onClick={()=>setShowAS(false)} variant="ghost"/><Btn label="Add Staff" onClick={addS} disabled={!ns.name||!ns.email}/></div></div></Modal>}
    </div>
  );
}

// ─── ADMIN ────────────────────────────────────────────────────────────────────
function Admin({ orders=[] }) {
  const [restaurants,setRestaurants]=useState([]);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    supabase.from("restaurants").select("*").order("created_at",{ascending:false}).then(({data})=>{
      setRestaurants(data||[{id:RESTAURANT_ID,name:"Gogi Restaurant",plan:"growth"}]);
      setLoading(false);
    });
  },[]);

  const totalRev=(orders||[]).reduce((s,o)=>s+(o.total||0),0);

  return (
    <div className="fade-in" style={{display:"flex",flexDirection:"column",gap:18}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:8,height:8,borderRadius:"50%",background:C.accent}}/>
        <div><h1 style={{fontSize:20,fontWeight:600,marginBottom:2}}>Blak Automations — Admin</h1><p style={{color:C.muted,fontSize:13}}>Platform overview · {restaurants.length} restaurants</p></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12}}>
        <StatCard icon="◎" label="Restaurants" value={restaurants.length}                  sub="On platform"  color={C.accent}/>
        <StatCard icon="₦" label="Revenue"     value={`₦${Math.round(totalRev/1000)}K`}   sub="All clients"  color={C.success}/>
        <StatCard icon="◇" label="Orders"      value={(orders||[]).length}                       sub="All clients"  color={C.info}/>
        <StatCard icon="★" label="Active"       value={restaurants.filter(r=>r.plan!=="trial").length} sub="Live" color={C.purple}/>
      </div>
      {loading?<Spin/>:(
        <div style={{background:"#FFFFFF",border:`1px solid ${C.border}`,borderRadius:R.card,padding:20}}>
          <div style={{fontWeight:500,fontSize:14,marginBottom:14}}>All restaurants</div>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",gap:10,padding:"8px 0 10px",borderBottom:`1px solid ${C.border}`,marginBottom:6}}>
            {["Restaurant","Plan","Restaurant ID","Status"].map(h=><div key={h} style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:".07em",fontWeight:500}}>{h}</div>)}
          </div>
          {restaurants.map((r,i)=>(
            <div key={r.id||i} style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",gap:10,padding:"11px 0",borderBottom:`1px solid ${C.border}`,alignItems:"center"}}>
              <div style={{fontWeight:500,fontSize:13}}>{r.name}</div>
              <Chip color={r.plan==="enterprise"?"purple":r.plan==="growth"?"amber":"blue"} label={r.plan||"starter"}/>
              <div style={{fontSize:10,color:C.muted,fontFamily:"'Space Mono',monospace"}}>{r.id?.slice(0,8)}...</div>
              <Chip color="green" label="active"/>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── AUTH SCREEN ──────────────────────────────────────────────────────────────
function AuthScreen() {
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [err,setErr]=useState("");
  const [loading,setLoading]=useState(false);
  const {signIn}=useAuth();

  async function submit(){
    if(!email||!password){setErr("Please enter your email and password.");return;}
    setLoading(true);setErr("");
    const {error}=await signIn(email,password);
    setLoading(false);
    if(error){
      const msg=error.message;
      if(msg.includes("Invalid login")||msg.includes("invalid_credentials"))
        setErr("Incorrect email or password. Check your credentials and try again.");
      else if(msg.includes("Email not confirmed"))
        setErr("Please check your email and click the confirmation link first.");
      else if(msg.includes("Too many"))
        setErr("Too many attempts. Please wait a minute and try again.");
      else setErr(msg);
    }
    // On success, onAuthStateChange in useAuth() fires and logs them in automatically
  }

  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:24,background:"#F7F7F7"}}>
      <div style={{width:"100%",maxWidth:400}}>

        {/* Logo */}
        <div style={{textAlign:"center",marginBottom:40}}>
          <div style={{fontSize:40,fontWeight:700,letterSpacing:"-.04em",color:C.text,marginBottom:6}}>
            <span style={{color:C.accent}}>demi</span>
          </div>
          <p style={{color:C.muted,fontSize:13}}>Restaurant operating system</p>
        </div>

        {/* Login card */}
        <div style={{background:"#FFFFFF",border:`1px solid ${C.border}`,borderRadius:16,padding:32,display:"flex",flexDirection:"column",gap:16,boxShadow:"0 4px 24px rgba(0,0,0,.08)"}}>
          <div>
            <div style={{fontSize:17,fontWeight:600,marginBottom:4}}>Sign in to your dashboard</div>
            <div style={{fontSize:13,color:C.muted}}>Access is by invitation only. Contact Blak Automations to request access.</div>
          </div>

          {err&&(
            <div style={{fontSize:13,color:C.danger,padding:"10px 14px",background:"#FEE2E2",borderRadius:8,border:`1px solid ${C.danger}30`,lineHeight:1.5}}>
              {err}
            </div>
          )}

          <Inp label="Email address" value={email} onChange={setEmail} placeholder="you@restaurant.com" type="email"/>
          <Inp label="Password" value={password} onChange={setPassword} placeholder="••••••••" type="password"/>

          <Btn label="Sign in" onClick={submit} loading={loading} size="lg"/>

          <button onClick={async()=>{
            if(!email){setErr("Enter your email address above first.");return;}
            setLoading(true);setErr("");
            const {error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo:window.location.origin});
            setLoading(false);
            if(error)setErr(error.message);
            else setErr(""); // show success via success state
            alert(`Password reset email sent to ${email}. Check your inbox.`);
          }} style={{background:"none",border:"none",color:C.muted,fontSize:12,cursor:"pointer",fontFamily:"'Sora',sans-serif",textDecoration:"underline"}}>
            Forgot your password?
          </button>
        </div>

        {/* Powered by */}
        <div style={{marginTop:20,textAlign:"center"}}>
          <div style={{fontSize:11,color:C.muted}}>
            Powered by <span style={{color:C.accent}}>Demi</span> · demi-alpha.vercel.app
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
class ErrorBoundary extends React.Component {
  constructor(props){super(props);this.state={hasError:false,error:null};}
  static getDerivedStateFromError(error){return {hasError:true,error};}
  render(){
    if(this.state.hasError) return (
      <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16,padding:24,background:"#F7F7F7",color:"#0A0A0B"}}>
        <div style={{fontSize:40,opacity:.2}}>⊘</div>
        <div style={{fontSize:18,fontWeight:500}}>Something went wrong</div>
        <div style={{fontSize:13,color:"#71717A",maxWidth:400,textAlign:"center"}}>{this.state.error?.message||"An unexpected error occurred."}</div>
        <button onClick={()=>window.location.reload()} style={{padding:"10px 24px",borderRadius:8,background:C.accent,color:"#FFFFFF",border:"none",cursor:"pointer",fontWeight:600,fontSize:13}}>Reload app</button>
      </div>
    );
    return this.props.children;
  }
}

export default function App() {
  const {user,role,loading:authLoading,signOut}=useAuth();
  const [active,setActive]=useState("overview");
  const {notifs,notify}=useNotifs();
  const online=useOnline();
  const [collapsed,setCollapsed]=useState(false);
  const [mobileOpen,setMobileOpen]=useState(false);
  const ordersCtx=useOrders(notify);
  const {orders,loading:ordersLoading,updateStatus:updateOrderStatus,createOrder,updateOrderItems,loadMore,hasMore,fetchAllOrders}=ordersCtx;
  const {restaurant}=useRestaurant();
  const kCount=orders.filter(o=>["new","preparing"].includes(o.status)).length;

  if(authLoading) return <><style>{css}</style><div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}><Spin/></div></>;
  if(!user) return <><style>{css}</style><AuthScreen/></>;

  const mods=ALL_MODULES.filter(m=>(ROLE_MODULES[role]||ROLE_MODULES.owner).includes(m.id));

  function render() {
    const op={orders,ordersLoading,updateOrderStatus,createOrder,updateOrderItems,loadMore,hasMore,fetchAllOrders,notify};
    switch(active){
      case "overview":  return <Overview  {...op} goTo={setActive}/>;
      case "orders":    return <OrdersModule {...op}/>;
      case "kitchen":   return <Kitchen   {...op}/>;
      case "dispatch":  return <Dispatch  notify={notify}/>;
      case "loyalty":   return <Loyalty   notify={notify}/>;
      case "menu":      return <MenuModule notify={notify} orders={orders}/>;
      case "inventory": return <Inventory notify={notify}/>;
      case "analytics": return <Analytics orders={orders} fetchAllOrders={fetchAllOrders}/>;
      case "campaigns": return <Campaigns notify={notify}/>;
      case "tables":    return <Tables    notify={notify}/>;
      case "reports":   return <Reports   orders={orders} notify={notify}/>;
      case "bot":       return <BotSetup/>;
      case "settings":  return <Settings  notify={notify} user={user} signOut={signOut}/>;
      case "admin":     return <Admin     orders={orders}/>;
      default: return null;
    }
  }

  return (
    <ErrorBoundary>
    <><style>{css}</style>
    <NBar notifs={notifs} online={online}/>

    {/* Mobile overlay — closes sidebar when tapping outside */}
    <div
      className={`sidebar-overlay${mobileOpen?" open":""}`}
      onClick={()=>setMobileOpen(false)}
    />

    <div style={{display:"flex",minHeight:"100vh"}}>

      {/* ── SIDEBAR ── */}
      <div
        className={`sidebar${mobileOpen?" mobile-open":""}`}
        style={{
          width: collapsed ? 56 : 220,
          background:"#FFFFFF",
          borderRight:`1px solid ${C.border}`,
          display:"flex",
          flexDirection:"column",
          flexShrink:0,
          position:"sticky",
          top:0,
          height:"100vh",
          overflowY:"auto",
          overflowX:"hidden",
        }}
      >
        {/* Logo + collapse toggle */}
        <div style={{
          display:"flex",
          alignItems:"center",
          justifyContent: collapsed ? "center" : "space-between",
          padding: collapsed ? "18px 0" : "18px 14px 16px 18px",
          borderBottom:`1px solid ${C.border}`,
          minHeight:60,
        }}>
          {!collapsed&&(
            <div>
              <div style={{fontSize:20,fontWeight:700,letterSpacing:"-.03em",color:C.text}}>
                <span style={{color:C.accent}}>demi</span>
              </div>
              <div style={{fontSize:10,color:C.muted,marginTop:1}}>{restaurant?.name||"Gogi Restaurant"}</div>
            </div>
          )}
          <button
            onClick={()=>setCollapsed(c=>!c)}
            title={collapsed?"Expand sidebar":"Collapse sidebar"}
            style={{
              width:28,height:28,borderRadius:6,
              background:"transparent",
              border:`1px solid ${C.border}`,
              color:"#71717A",cursor:"pointer",
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:14,flexShrink:0,
              transition:"background .15s",
            }}
          >
            {collapsed ? "›" : "‹"}
          </button>
        </div>

        {/* Nav items */}
        <nav style={{flex:1,padding:"10px 6px",display:"flex",flexDirection:"column",gap:1,overflowY:"auto"}}>
          {mods.map(m=>(
            <button
              key={m.id}
              onClick={()=>{ setActive(m.id); setMobileOpen(false); }}
              title={collapsed ? m.label : undefined}
              style={{
                display:"flex",
                alignItems:"center",
                gap: collapsed ? 0 : 9,
                padding: collapsed ? "10px 0" : "9px 11px",
                justifyContent: collapsed ? "center" : "flex-start",
                borderRadius:R.input,
                border:"none",
                background:active===m.id?C.accent:"transparent",
                color:active===m.id?"#FFFFFF":C.muted,
                fontSize:12,cursor:"pointer",
                fontFamily:"'Sora',sans-serif",
                textAlign:"left",
                fontWeight:active===m.id?500:400,
                width:"100%",
                transition:"background .15s,color .15s",
                position:"relative",
              }}
            >
              <span style={{fontSize:15,width:18,textAlign:"center",flexShrink:0}}>{m.icon}</span>
              {!collapsed&&<span style={{flex:1,whiteSpace:"nowrap",overflow:"hidden"}}>{m.label}</span>}
              {!collapsed&&m.id==="kitchen"&&kCount>0&&(
                <span style={{background:C.danger,color:"#FFFFFF",fontSize:9,fontWeight:600,padding:"1px 5px",borderRadius:8}}>{kCount}</span>
              )}
              {!collapsed&&m.id==="admin"&&(
                <span style={{background:C.accent,color:"#FFFFFF",fontSize:9,fontWeight:600,padding:"1px 5px",borderRadius:8}}>BA</span>
              )}
              {/* Show badge dot on icon even when collapsed */}
              {collapsed&&m.id==="kitchen"&&kCount>0&&(
                <span style={{position:"absolute",top:6,right:6,width:7,height:7,borderRadius:"50%",background:"#DC2626"}}/>
              )}
            </button>
          ))}
        </nav>

        {/* User info footer — hide labels when collapsed */}
        <div style={{padding:"10px 6px",borderTop:`1px solid ${C.border}`}}>
          <div style={{
            display:"flex",alignItems:"center",
            gap: collapsed ? 0 : 9,
            justifyContent: collapsed ? "center" : "flex-start",
            padding: collapsed ? "8px 0" : "8px 10px",
          }}>
            <div style={{
              width:28,height:28,borderRadius:"50%",
              background:C.accent,
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:11,color:"#FFFFFF",fontWeight:600,flexShrink:0,
            }}>
              {(restaurant?.name||"G")[0]}
            </div>
            {!collapsed&&(
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:11,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                  {restaurant?.name||"Gogi Restaurant"}
                </div>
                <div style={{fontSize:10,color:C.muted,textTransform:"capitalize"}}>
                  {restaurant?.plan||"growth"} plan
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>

        {/* Mobile top bar — only visible on small screens */}
        <div style={{
          display:"none",
          alignItems:"center",
          gap:12,
          padding:"12px 16px",
          background:"#FFFFFF",
          borderBottom:`1px solid ${C.border}`,
          position:"sticky",
          top:0,
          zIndex:400,
        }} className="topbar">
          <button
            onClick={()=>setMobileOpen(o=>!o)}
            style={{
              width:36,height:36,borderRadius:R.input,
              background:"#FFFFFF",border:`1px solid ${C.border}`,
              color:"#0A0A0B",cursor:"pointer",fontSize:16,
              display:"flex",alignItems:"center",justifyContent:"center",
              flexShrink:0,
            }}
          >
            {mobileOpen ? "×" : "☰"}
          </button>
          <div style={{fontSize:16,fontWeight:700,letterSpacing:"-.03em",color:C.text}}>
            <span style={{color:C.accent}}>demi</span>
          </div>
          <div style={{flex:1}}/>
          {kCount>0&&(
            <span style={{background:"#FEE2E2",color:C.danger,fontSize:11,fontWeight:600,padding:"3px 8px",borderRadius:R.pill}}>
              {kCount} active
            </span>
          )}
        </div>

        <main
          className="main-content"
          style={{flex:1,padding:"28px 32px",overflowY:"auto",maxHeight:"100vh",background:"#FAFAFA"}}
        >
          <div style={{maxWidth:active==="kitchen"||active==="admin"?"100%":1000,margin:"0 auto"}}>
            {render()}
          </div>
        </main>
      </div>

    </div>
    </>
    </ErrorBoundary>
  );
}
