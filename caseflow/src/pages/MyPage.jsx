// MyPage.jsx
import { useState, useEffect } from 'react';
import { CaseAPI } from '../api.js';

export default function MyPage({ user, nav }) {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    CaseAPI.getMyCases(user.user_id).then(setCases).finally(() => setLoading(false));
  }, []);

  const today = new Date(); today.setHours(0,0,0,0);
  const active = cases.filter(c => c.status !== '完了');
  const overdue = active.filter(c => new Date(c.due_date) < today);

  const priorityColor = (c) => {
    if (new Date(c.due_date) < today) return '#E24B4A';
    const diff = (new Date(c.due_date) - today) / 86400000;
    if (diff <= 7) return '#BA7517';
    return '#1D9E75';
  };

  if (loading) return <div style={{padding:40,textAlign:'center',color:'#888'}}>読み込み中...</div>;

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 18, fontWeight: 500 }}>マイページ</div>
        <div style={{ fontSize: 12, color: '#999' }}>{user.name} — 担当案件</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 14 }}>
        {[['担当案件', active.length, ''], ['超過中', overdue.length, '#B91C1C'], ['今週期限', active.filter(c=>{ const d=new Date(c.due_date); const w=new Date(today); w.setDate(w.getDate()+7); return d>=today&&d<=w; }).length, '#BA7517'], ['今月完了', cases.filter(c=>c.status==='完了').length, '']].map(([l,v,color]) => (
          <div key={l} style={{ background:'#fff', border:'0.5px solid #E0DFD8', borderRadius:8, padding:'12px 14px' }}>
            <div style={{ fontSize:11, color:'#999', marginBottom:4 }}>{l}</div>
            <div style={{ fontSize:22, fontWeight:500, color: color||'#1A1A1A' }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ background:'#fff', border:'0.5px solid #E0DFD8', borderRadius:8, overflow:'hidden' }}>
        <div style={{ padding:'7px 14px', fontSize:11, color:'#AAA', background:'#F9F9F7', borderBottom:'0.5px solid #E0DFD8' }}>期限順</div>
        {active.sort((a,b) => new Date(a.due_date)-new Date(b.due_date)).map(c => (
          <div key={c.case_id} onClick={() => nav('detail',{caseId:c.case_id})}
            style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderBottom:'0.5px solid #F0F0EA', cursor:'pointer' }}
            onMouseEnter={e=>e.currentTarget.style.background='#F9F9F7'}
            onMouseLeave={e=>e.currentTarget.style.background=''}
          >
            <div style={{ width:3, height:36, borderRadius:2, background:priorityColor(c), flexShrink:0 }} />
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:500 }}>{c.title}</div>
              <div style={{ fontSize:11, color:'#999' }}>{c.customer_id}</div>
            </div>
            <div style={{ fontSize:12, color: new Date(c.due_date)<today ? '#B91C1C' : '#888', fontWeight: new Date(c.due_date)<today ? 600 : 400 }}>
              {new Date(c.due_date).toLocaleDateString('ja-JP',{month:'numeric',day:'numeric'})}
              {new Date(c.due_date)<today ? ' 超過' : ''}
            </div>
          </div>
        ))}
        {active.length === 0 && <div style={{padding:24,textAlign:'center',color:'#AAA',fontSize:13}}>担当案件はありません</div>}
      </div>
    </div>
  );
}
