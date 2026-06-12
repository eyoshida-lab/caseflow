import { useState, useEffect } from 'react';
import { CaseAPI, UserAPI } from '../api.js';

export default function WeeklyReview({ user, nav }) {
  const [cases, setCases] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([CaseAPI.getAll(), UserAPI.getAll()])
      .then(([c, u]) => { setCases(c); setUsers(u); })
      .finally(() => setLoading(false));
  }, []);

  const today = new Date(); today.setHours(0,0,0,0);
  const weekEnd = new Date(today); weekEnd.setDate(weekEnd.getDate() + 7);

  const active   = cases.filter(c => c.status !== '完了');
  const overdue  = active.filter(c => new Date(c.due_date) < today);
  const thisWeek = active.filter(c => { const d = new Date(c.due_date); return d >= today && d <= weekEnd; });
  const later    = active.filter(c => new Date(c.due_date) > weekEnd);

  const loadByUser = (uid) => active.filter(c => c.owner_user_id === uid).length;
  const maxLoad = Math.max(...users.map(u => loadByUser(u.user_id)), 1);

  if (loading) return <div style={{padding:40,textAlign:'center',color:'#888'}}>読み込み中...</div>;

  const ZoneCard = ({ title, icon, color, items, emptyMsg }) => (
    <div style={{background:'#fff',border:`0.5px solid ${color}30`,borderRadius:8,padding:14}}>
      <div style={{fontSize:12,fontWeight:500,color:'#888',marginBottom:10,display:'flex',alignItems:'center',gap:5}}>
        <i className={`ti ti-${icon}`} style={{color}} /> {title}
        <span style={{marginLeft:'auto',fontSize:11,background:`${color}20`,color,padding:'1px 7px',borderRadius:8}}>{items.length}件</span>
      </div>
      {items.length === 0 && <div style={{fontSize:12,color:'#AAA'}}>{emptyMsg}</div>}
      {items.map(c => (
        <div key={c.case_id} onClick={() => nav('detail',{caseId:c.case_id})}
          style={{padding:'6px 8px',borderRadius:6,background:'#F9F9F7',marginBottom:4,cursor:'pointer',fontSize:12}}
          onMouseEnter={e=>e.currentTarget.style.background='#F0F0EA'}
          onMouseLeave={e=>e.currentTarget.style.background='#F9F9F7'}
        >
          <div style={{fontWeight:500,color:'#1A1A1A'}}>{c.title}</div>
          <div style={{color:'#999',fontSize:11}}>{c.customer_id} · {c.owner_user_id||'未設定'}</div>
        </div>
      ))}
    </div>
  );

  return (
    <div>
      <div style={{marginBottom:16}}>
        <div style={{fontSize:18,fontWeight:500}}>週次レビュー</div>
        <div style={{fontSize:12,color:'#999'}}>{today.toLocaleDateString('ja-JP')} 〜 {weekEnd.toLocaleDateString('ja-JP')}</div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:14}}>
        <ZoneCard title="期限超過" icon="circle-x"    color="#B91C1C" items={overdue}  emptyMsg="超過なし" />
        <ZoneCard title="今週期限" icon="clock"       color="#BA7517" items={thisWeek} emptyMsg="今週期限の案件なし" />
        <ZoneCard title="来週以降" icon="calendar"    color="#1D9E75" items={later}    emptyMsg="来週以降の案件なし" />
      </div>

      <div style={{background:'#fff',border:'0.5px solid #E0DFD8',borderRadius:8,padding:14}}>
        <div style={{fontSize:12,fontWeight:500,color:'#888',marginBottom:12,display:'flex',alignItems:'center',gap:4}}><i className="ti ti-users" /> 担当者別 負荷</div>
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {users.map(u => {
            const cnt = loadByUser(u.user_id);
            const pct = (cnt / maxLoad) * 100;
            const isHeavy = pct > 70;
            return (
              <div key={u.user_id} style={{display:'flex',alignItems:'center',gap:10,fontSize:12}}>
                <div style={{width:52,color:'#555',flexShrink:0,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{u.name.split(' ')[0]}</div>
                <div style={{flex:1,height:6,background:'#EEE',borderRadius:3,overflow:'hidden'}}>
                  <div style={{height:'100%',background:isHeavy?'#E24B4A':'#7F77DD',width:`${pct}%`,borderRadius:3,transition:'width .4s'}} />
                </div>
                <div style={{fontSize:11,color:'#999',width:28,textAlign:'right'}}>{cnt}件</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
