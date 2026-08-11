"use client";

import { useMemo, useState } from "react";

type Status = "safe" | "missing" | "changed";
type Customer = { id:number; initials:string; name:string; phone:string; page:string; tags:string[]; missing?:string[]; added?:string[]; status:Status; updated:string };

const initial: Customer[] = [
  { id:1, initials:"NA", name:"Nguyễn Văn An", phone:"••• 4821", page:"Mỹ phẩm Hà Nội", tags:["Khách VIP","Đã thanh toán"], missing:["Cần gọi lại"], status:"missing", updated:"2 phút trước" },
  { id:2, initials:"TH", name:"Trần Minh Hoa", phone:"••• 1074", page:"Thời trang HCM", tags:["Cần gọi lại"], added:["Đã tư vấn"], status:"changed", updated:"5 phút trước" },
  { id:3, initials:"LT", name:"Lê Thu Trang", phone:"••• 6350", page:"Mỹ phẩm Hà Nội", tags:["Khách mới"], status:"safe", updated:"8 phút trước" },
  { id:4, initials:"PH", name:"Phạm Quốc Huy", phone:"••• 9926", page:"Gia dụng Online", tags:["Đã mua","Khách quay lại"], missing:["Bảo hành"], status:"missing", updated:"12 phút trước" },
  { id:5, initials:"MV", name:"Mai Thảo Vy", phone:"••• 3318", page:"Thời trang HCM", tags:["Khách VIP","Đã tư vấn"], status:"safe", updated:"18 phút trước" },
  { id:6, initials:"ĐK", name:"Đỗ Minh Khôi", phone:"••• 7542", page:"Mỹ phẩm Hà Nội", tags:["Chờ phản hồi"], added:["Khách mới"], status:"changed", updated:"24 phút trước" },
  { id:7, initials:"HP", name:"Hoàng Yến Phương", phone:"••• 2190", page:"Gia dụng Online", tags:["Đã thanh toán"], status:"safe", updated:"31 phút trước" },
];

const labels = { safe:"Bình thường", missing:"Cần xử lý", changed:"Vừa thay đổi" };

export default function Home() {
  const [customers,setCustomers] = useState(initial);
  const [tab,setTab] = useState("all");
  const [page,setPage] = useState("Tất cả Page");
  const [query,setQuery] = useState("");
  const [selected,setSelected] = useState<number[]>([]);
  const [active,setActive] = useState<Customer|null>(null);
  const [notice,setNotice] = useState(3);
  const [toast,setToast] = useState("");
  const [checking,setChecking] = useState(false);
  const [connectOpen,setConnectOpen] = useState(false);
  const [connectStep,setConnectStep] = useState<1|2|3>(1);
  const [token,setToken] = useState("");
  const [testing,setTesting] = useState(false);
  const [chosenPages,setChosenPages] = useState(["Mỹ phẩm Hà Nội","Thời trang HCM","Gia dụng Online"]);
  const [restorePreview,setRestorePreview] = useState<number[]>([]);
  const [restoreResult,setRestoreResult] = useState<{ok:number;failed:number;retried?:boolean}|null>(null);
  const [restoring,setRestoring] = useState(false);

  const filtered = useMemo(() => customers.filter(c => {
    if(page !== "Tất cả Page" && c.page !== page) return false;
    if(tab === "issues" && c.status !== "missing") return false;
    if(tab === "changed" && c.status !== "changed") return false;
    return `${c.name} ${c.phone} ${c.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase());
  }),[customers,page,tab,query]);
  const issueCount = customers.filter(c=>c.status==="missing").length;

  function restore(ids:number[]) {
    const total = customers.filter(c=>ids.includes(c.id)).reduce((n,c)=>n+(c.missing?.length||0),0);
    setCustomers(cs=>cs.map(c=>ids.includes(c.id)?{...c,tags:[...c.tags,...(c.missing||[])],missing:undefined,status:"safe",updated:"Vừa xong"}:c));
    setSelected([]); setActive(null); setToast(`Đã khôi phục ${total} tag an toàn`); setTimeout(()=>setToast(""),3500);
  }
  function runRestore(){
    setRestoring(true);
    const ids=[...restorePreview];
    const total=customers.filter(c=>ids.includes(c.id)).reduce((n,c)=>n+(c.missing?.length||0),0);
    setTimeout(()=>{
      const failed=ids.length>1?1:0;
      const ok=Math.max(0,total-failed);
      setCustomers(cs=>cs.map(c=>ids.includes(c.id)?{...c,tags:[...c.tags,...(failed&&c.id===ids[ids.length-1]?(c.missing||[]).slice(0,-1):(c.missing||[]))],missing:failed&&c.id===ids[ids.length-1]?c.missing?.slice(-1):undefined,status:failed&&c.id===ids[ids.length-1]?"missing":"safe",updated:"Vừa xong"}:c));
      setSelected([]);setRestorePreview([]);setRestoring(false);setRestoreResult({ok,failed});
    },1400)
  }
  function accept(id:number) {
    setCustomers(cs=>cs.map(c=>c.id===id?{...c,missing:undefined,status:"safe",updated:"Vừa xong"}:c));
    setActive(null); setToast("Đã ghi nhận đây là thay đổi đúng"); setTimeout(()=>setToast(""),3500);
  }
  function checkNow(){ setChecking(true); setTimeout(()=>{setChecking(false);setNotice(2);setToast("Đã kiểm tra xong 12.450 hội thoại");setTimeout(()=>setToast(""),3500)},1300) }
  function testConnection(){
    if(token.trim().length<8){setToast("Vui lòng nhập Access Token Pancake");setTimeout(()=>setToast(""),3000);return}
    setTesting(true);setTimeout(()=>{setTesting(false);setConnectStep(2)},1200)
  }
  function finishConnection(){setConnectStep(3);setTimeout(()=>{setConnectOpen(false);setConnectStep(1);setToken("");setToast(`Đã kết nối và bảo vệ ${chosenPages.length} Page`);setTimeout(()=>setToast(""),3500)},1100)}

  return <main className="app-shell">
    <header className="topbar">
      <div className="brand"><span className="brandmark">TG</span><div><strong>Tag Guardian</strong><small>Bảo vệ tag khách hàng</small></div></div>
      <div className="top-actions"><span className="live"><i/> Đang cập nhật</span><button className="avatar" aria-label="Tài khoản An">AN</button></div>
    </header>
    <div className="layout">
      <aside className="sidebar">
        <nav>
          <button className={tab==="all"?"active":""} onClick={()=>setTab("all")}><span>⌂</span> Tất cả khách hàng</button>
          <button className={tab==="issues"?"active":""} onClick={()=>setTab("issues")}><span>!</span> Cần xử lý <b>{issueCount}</b></button>
          <button className={tab==="changed"?"active":""} onClick={()=>setTab("changed")}><span>↻</span> Vừa thay đổi</button>
          <button className={tab==="activity"?"active":""} onClick={()=>setTab("activity")}><span>✓</span> Hoạt động</button>
        </nav>
        <div className="sidebar-foot"><button className={tab==="settings"?"active":""} onClick={()=>setTab("settings")}><span>⚙</span> Kết nối Pancake</button><div className="connection"><i/><div><strong>Kết nối ổn định</strong><small>3 Page đang đồng bộ</small></div></div></div>
      </aside>
      <section className="content">
        <div className="title-row"><div><p className="eyebrow">TRUNG TÂM VẬN HÀNH</p><h1>{tab==="issues"?"Khách hàng cần xử lý":tab==="changed"?"Thay đổi gần đây":tab==="activity"?"Lịch sử hoạt động":tab==="settings"?"Kết nối Pancake":"Danh sách khách hàng"}</h1><p>{tab==="settings"?"Theo dõi tình trạng kết nối và đồng bộ của từng Page.":tab==="activity"?"Mọi thay đổi đều được ghi lại và có thể hoàn tác.":"Theo dõi Page và tag khách hàng tại một nơi."}</p></div>{tab!=="settings"&&tab!=="activity"&&<button className="primary" onClick={checkNow} disabled={checking}>{checking?<><span className="spinner"/>Đang kiểm tra</>:<>↻ &nbsp;Kiểm tra ngay</>}</button>}</div>
        {tab==="settings"?<ConnectionCenter checking={checking} checkNow={checkNow} reconnect={()=>setConnectOpen(true)}/>:tab==="activity"?<ActivityCenter/>:<>
        {notice>0 && <div className="new-notice"><span><b>{notice} cập nhật mới</b> vừa được nhận từ Pancake</span><button onClick={()=>setNotice(0)}>Hiển thị cập nhật</button></div>}
        <div className="summary">
          <div><span className="summary-icon blue">◎</span><p><b>12.450</b><small>Khách hàng đang theo dõi</small></p></div>
          <div><span className="summary-icon amber">!</span><p><b>{issueCount}</b><small>Cần bạn kiểm tra</small></p></div>
          <div><span className="summary-icon green">✓</span><p><b>99,8%</b><small>Tag đang an toàn</small></p></div>
        </div>
        <div className="toolbar">
          <label className="search">⌕<input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Tìm tên hoặc số điện thoại..."/></label>
          <select value={page} onChange={e=>setPage(e.target.value)} aria-label="Lọc theo Page"><option>Tất cả Page</option><option>Mỹ phẩm Hà Nội</option><option>Thời trang HCM</option><option>Gia dụng Online</option></select>
          <button className="filter">☷ &nbsp; Bộ lọc</button><span className="result-count">{filtered.length} kết quả</span>
        </div>
        <div className="table-card">
          <div className="table-head"><span><input type="checkbox" aria-label="Chọn tất cả" checked={filtered.length>0&&filtered.every(c=>selected.includes(c.id))} onChange={e=>setSelected(e.target.checked?filtered.map(c=>c.id):[])}/></span><span>Khách hàng</span><span>Page</span><span>Tag hiện tại</span><span>Trạng thái</span><span>Cập nhật</span><span/></div>
          {filtered.map(c=><div className={`customer-row ${c.status==="missing"?"needs-attention":""}`} key={c.id} onClick={()=>setActive(c)}>
            <span onClick={e=>e.stopPropagation()}><input type="checkbox" aria-label={`Chọn ${c.name}`} checked={selected.includes(c.id)} onChange={()=>setSelected(s=>s.includes(c.id)?s.filter(x=>x!==c.id):[...s,c.id])}/></span>
            <span className="customer"><i>{c.initials}</i><span><strong>{c.name}</strong><small>{c.phone}</small></span></span>
            <span><em className={`page-dot p${["Mỹ phẩm Hà Nội","Thời trang HCM","Gia dụng Online"].indexOf(c.page)+1}`}/>{c.page}</span>
            <span className="tags">{c.tags.map(t=><mark key={t}>{t}</mark>)}{c.missing?.map(t=><mark className="lost" key={t}>− {t}</mark>)}{c.added?.map(t=><mark className="added" key={t}>+ {t}</mark>)}</span>
            <span><span className={`status ${c.status}`}>{c.status==="safe"?"✓":c.status==="missing"?"!":"↻"} {labels[c.status]}</span></span>
            <span className="updated">{c.updated}</span><span><button className="more" aria-label={`Mở ${c.name}`}>›</button></span>
          </div>)}
          {!filtered.length&&<div className="empty">Không tìm thấy khách hàng phù hợp.</div>}
        </div>
        <footer className="pagination"><span>Hiển thị 1–{filtered.length} trong 12.450 khách hàng</span><div><button disabled>‹</button><button className="current">1</button><button>2</button><button>3</button><button>›</button></div></footer></>}
      </section>
    </div>
    {selected.length>0&&<div className="bulk"><span><b>{selected.length}</b> khách hàng đã chọn</span><button onClick={()=>setSelected([])}>Bỏ chọn</button><button className="primary" onClick={()=>setRestorePreview(selected)}>Xem trước khôi phục</button></div>}
    {active&&<><div className="overlay" onClick={()=>setActive(null)}/><aside className="drawer" aria-label="Chi tiết khách hàng"><button className="close" onClick={()=>setActive(null)}>×</button><p className="eyebrow">CHI TIẾT KHÁCH HÀNG</p><div className="drawer-person"><i>{active.initials}</i><div><h2>{active.name}</h2><p>{active.phone} · {active.page}</p></div></div>
      <section><h3>Tag hiện tại</h3><div className="tags large">{active.tags.map(t=><mark key={t}>{t}</mark>)}</div></section>
      {active.missing?.length?<div className="alert-box"><b>Tag có thể đã bị mất</b><p>Hệ thống phát hiện những tag dưới đây không còn trên Pancake.</p><div className="tags large">{active.missing.map(t=><mark className="lost" key={t}>− {t}</mark>)}</div></div>:<div className="safe-box">✓ Tất cả tag đang an toàn</div>}
      <section><h3>Hoạt động gần đây</h3><div className="timeline"><i/><div><b>{active.status==="missing"?"Phát hiện tag bị mất":"Thông tin tag được cập nhật"}</b><small>{active.updated}</small></div></div><div className="timeline"><i/><div><b>Đồng bộ với Pancake</b><small>Hôm nay, 14:32</small></div></div></section>
      {active.missing?.length?<div className="drawer-actions"><p>Hệ thống sẽ tự tạo một bản hoàn tác an toàn.</p><button className="secondary" onClick={()=>accept(active.id)}>Thay đổi này đúng</button><button className="primary" onClick={()=>{setRestorePreview([active.id]);setActive(null)}}>Xem trước khôi phục</button></div>:<button className="secondary full" onClick={()=>setActive(null)}>Đóng</button>}
    </aside></>}
    {connectOpen&&<><div className="overlay" onClick={()=>setConnectOpen(false)}/><div className="connect-modal" role="dialog" aria-modal="true" aria-label="Kết nối Pancake">
      <button className="close" onClick={()=>setConnectOpen(false)}>×</button>
      <div className="connect-brand"><span className="pancake-logo">P</span><div><p className="eyebrow">THIẾT LẬP KẾT NỐI</p><h2>Kết nối với Pancake</h2></div></div>
      <div className="steps"><span className={connectStep>=1?"on":""}>1 <b>Đăng nhập</b></span><i/><span className={connectStep>=2?"on":""}>2 <b>Chọn Page</b></span><i/><span className={connectStep>=3?"on":""}>3 <b>Hoàn tất</b></span></div>
      {connectStep===1&&<div className="connect-body"><h3>Nhập Access Token</h3><p>Tag Guardian dùng token này để đọc Page, hội thoại và cập nhật tag khi bạn yêu cầu. Token chỉ được lưu an toàn trên máy chủ.</p><label>Access Token Pancake<input type="password" value={token} onChange={e=>setToken(e.target.value)} placeholder="Dán token của bạn tại đây" autoFocus/></label><a href="#" onClick={e=>e.preventDefault()}>Tôi lấy Access Token ở đâu?</a><div className="security-note">▣ &nbsp; Bản demo không gửi hoặc lưu token bạn nhập.</div><button className="primary connect-next" onClick={testConnection} disabled={testing}>{testing?<><span className="spinner"/>Đang kiểm tra...</>:"Kiểm tra kết nối"}</button></div>}
      {connectStep===2&&<div className="connect-body"><div className="connect-ok">✓ Kết nối thành công <small>Tìm thấy 3 Page từ tài khoản Pancake</small></div><h3>Chọn Page cần bảo vệ</h3><p>Hệ thống sẽ liên tục theo dõi khách hàng và thay đổi tag trên các Page đã chọn.</p><div className="page-picker">{[["Mỹ phẩm Hà Nội","4.280 khách hàng"],["Thời trang HCM","5.106 khách hàng"],["Gia dụng Online","3.064 khách hàng"]].map(([name,count])=><label key={name}><input type="checkbox" checked={chosenPages.includes(name)} onChange={()=>setChosenPages(p=>p.includes(name)?p.filter(x=>x!==name):[...p,name])}/><span className="page-symbol">{name[0]}</span><span><b>{name}</b><small>{count}</small></span><em>Đã có quyền truy cập</em></label>)}</div><div className="connect-actions"><button className="secondary" onClick={()=>setConnectStep(1)}>Quay lại</button><button className="primary" onClick={finishConnection} disabled={!chosenPages.length}>Bảo vệ {chosenPages.length} Page</button></div></div>}
      {connectStep===3&&<div className="connect-body complete"><span className="complete-icon">✓</span><h3>Đang thiết lập bảo vệ</h3><p>Tag Guardian đang tải danh sách khách hàng và tag lần đầu tiên.</p><div className="sync-line"><span/><i/></div><small>Quá trình này sẽ tiếp tục ở chế độ nền.</small></div>}
    </div></>}
    {restorePreview.length>0&&<><div className="overlay" onClick={()=>!restoring&&setRestorePreview([])}/><div className="restore-modal" role="dialog" aria-modal="true" aria-label="Xem trước khôi phục"><button className="close" disabled={restoring} onClick={()=>setRestorePreview([])}>×</button><p className="eyebrow">KIỂM TRA TRƯỚC KHI THỰC HIỆN</p><h2>Khôi phục tag cho {restorePreview.length} khách hàng?</h2><p className="restore-intro">Hãy kiểm tra lại các thay đổi. Tag Guardian sẽ đồng bộ dữ liệu mới nhất và tự tạo bản hoàn tác trước khi bắt đầu.</p><div className="restore-summary"><div><small>Khách hàng</small><b>{restorePreview.length}</b></div><div><small>Tag sẽ thêm lại</small><b>{customers.filter(c=>restorePreview.includes(c.id)).reduce((n,c)=>n+(c.missing?.length||0),0)}</b></div><div><small>Tag sẽ xóa</small><b>0</b></div></div><div className="restore-list">{customers.filter(c=>restorePreview.includes(c.id)).map(c=><article key={c.id}><span className="customer-mini">{c.initials}</span><div><b>{c.name}</b><small>{c.page}</small></div><div className="tags">{c.missing?.map(t=><mark className="added" key={t}>+ {t}</mark>)}</div></article>)}</div><div className="preflight"><span>✓ Dữ liệu vừa được kiểm tra</span><span>✓ Sẽ tạo bản hoàn tác</span><span>✓ Token đang hoạt động</span></div><div className="modal-actions"><button className="secondary" disabled={restoring} onClick={()=>setRestorePreview([])}>Hủy</button><button className="primary" disabled={restoring} onClick={runRestore}>{restoring?<><span className="spinner"/>Đang khôi phục...</>:`Khôi phục ${customers.filter(c=>restorePreview.includes(c.id)).reduce((n,c)=>n+(c.missing?.length||0),0)} tag`}</button></div></div></>}
    {restoreResult&&<><div className="overlay"/><div className="result-modal"><span className={`result-icon ${restoreResult.failed?"partial":"done"}`}>{restoreResult.failed?"!":"✓"}</span><p className="eyebrow">KẾT QUẢ KHÔI PHỤC</p><h2>{restoreResult.failed?"Hoàn tất một phần":"Khôi phục hoàn tất"}</h2><p>{restoreResult.failed?`${restoreResult.ok} tag đã được khôi phục, ${restoreResult.failed} tag chưa thể xử lý.`:`Đã khôi phục an toàn ${restoreResult.ok} tag. Một bản hoàn tác đã được tạo.`}</p><div className="result-stats"><span><b>{restoreResult.ok}</b><small>Thành công</small></span><span className={restoreResult.failed?"bad":""}><b>{restoreResult.failed}</b><small>Chưa thành công</small></span></div>{restoreResult.failed&&!restoreResult.retried&&<div className="failed-detail"><div><b>Bảo hành</b><small>Phạm Quốc Huy · Gia dụng Online</small></div><em>API Pancake tạm thời không phản hồi</em></div>}<div className="modal-actions"><button className="secondary" onClick={()=>setRestoreResult(null)}>Đóng</button>{restoreResult.failed&&!restoreResult.retried?<button className="primary" onClick={()=>{setRestoring(true);setTimeout(()=>{setRestoring(false);setRestoreResult({ok:restoreResult.ok+1,failed:0,retried:true});setCustomers(cs=>cs.map(c=>c.name==="Phạm Quốc Huy"?{...c,tags:[...c.tags,...(c.missing||[])],missing:undefined,status:"safe"}:c))},1100)}}>{restoring?"Đang thử lại...":"↻ Thử lại 1 tag"}</button>:<button className="primary" onClick={()=>setRestoreResult(null)}>Xong</button>}</div></div></>}
    {toast&&<div className="toast"><b>✓</b>{toast}<button onClick={()=>setToast("")}>×</button></div>}
  </main>;
}

function ConnectionCenter({checking,checkNow,reconnect}:{checking:boolean;checkNow:()=>void;reconnect:()=>void}){
  const pages=[{name:"Mỹ phẩm Hà Nội",customers:"4.280",tags:38,time:"1 phút trước",state:"ok",progress:100},{name:"Thời trang HCM",customers:"5.106",tags:42,time:"Đang đồng bộ 3.840/5.106",state:"sync",progress:75},{name:"Gia dụng Online",customers:"3.064",tags:27,time:"18 phút trước",state:"error",progress:100}];
  return <div className="connection-center"><div className="connection-banner"><div><span className="pancake-logo">P</span><div><b>Tài khoản Pancake đã kết nối</b><small>Access Token được lưu an toàn · 3 Page</small></div></div><button className="secondary" onClick={reconnect}>Thay đổi kết nối</button></div><div className="connection-overview"><div><small>Chu kỳ kiểm tra</small><b>5 phút / lần</b></div><div><small>Đồng bộ gần nhất</small><b>14:32 hôm nay</b></div><div><small>Lượt API hôm nay</small><b>1.248</b></div><button className="primary" onClick={checkNow} disabled={checking}>{checking?"Đang kiểm tra...":"↻ Đồng bộ tất cả"}</button></div><div className="settings-title"><div><h2>Các Page đang bảo vệ</h2><p>Tag Guardian tự động cập nhật khách hàng và tag mỗi 5 phút.</p></div><button className="secondary" onClick={reconnect}>+ Thêm Page</button></div><div className="page-status-list">{pages.map((p,i)=><article key={p.name} className={p.state==="error"?"has-error":""}><span className={`page-symbol ps${i+1}`}>{p.name[0]}</span><div className="page-main"><h3>{p.name}</h3><p>{p.customers} khách hàng · {p.tags} tag</p>{p.state==="sync"&&<div className="mini-progress"><i style={{width:`${p.progress}%`}}/></div>}</div><div className="page-time"><span className={`state-pill ${p.state}`}>{p.state==="ok"?"✓ Hoạt động":p.state==="sync"?"↻ Đang đồng bộ":"! Cần kết nối lại"}</span><small>{p.time}</small></div>{p.state==="error"?<button className="reconnect" onClick={reconnect}>Kết nối lại</button>:<button className="row-action">•••</button>}</article>)}</div><div className="warning-card"><span>!</span><div><b>Gia dụng Online chưa được cập nhật</b><p>Token của Page này có thể đã hết hạn. Dữ liệu hiển thị là dữ liệu lúc 14:14.</p></div><button onClick={reconnect}>Khắc phục ngay</button></div></div>
}

function ActivityCenter(){const activities=[{icon:"↻",tone:"blue",title:"Đồng bộ 12.450 khách hàng",meta:"Tự động · Tất cả Page · 14:32 hôm nay",detail:"Phát hiện 3 cập nhật mới",action:"Xem cập nhật"},{icon:"✓",tone:"green",title:"Khôi phục 4 tag cho 3 khách hàng",meta:"Nguyễn An · Mỹ phẩm Hà Nội · 14:15 hôm nay",detail:"Hoàn tất an toàn · Đã tạo bản hoàn tác",action:"Hoàn tác"},{icon:"!",tone:"amber",title:"Đồng bộ hoàn tất một phần",meta:"Tự động · Gia dụng Online · 14:14 hôm nay",detail:"3.064 khách hàng đã tải · 1 yêu cầu lỗi",action:"Thử lại"},{icon:"✓",tone:"green",title:"Xác nhận 2 thay đổi là đúng",meta:"Trần Minh · Thời trang HCM · 13:48 hôm nay",detail:"2 cảnh báo đã được đóng",action:"Xem chi tiết"}];return <div className="activity-center"><div className="activity-filters"><button className="selected">Tất cả</button><button>Đồng bộ</button><button>Khôi phục</button><button>Cảnh báo</button><select><option>7 ngày gần đây</option><option>30 ngày gần đây</option></select></div><div className="activity-list"><p className="date-label">HÔM NAY</p>{activities.map((a,i)=><article key={i}><span className={`activity-icon ${a.tone}`}>{a.icon}</span><div><h3>{a.title}</h3><p>{a.meta}</p><small>{a.detail}</small></div><button>{a.action}</button></article>)}</div></div>}