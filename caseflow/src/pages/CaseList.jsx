// ===== CaseList.jsx =====
import { useState, useEffect } from 'react';
import { CaseAPI } from '../api.js';

export function CaseList({ user, nav }) {
  const [cases, setCases] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { CaseAPI.getAll().then(setCases).finally(() => setLoading(false)); }, []);

  const filtered = cases.filter(c =>
    !q || c.title.includes(q) || c.customer_id.includes(q)
  ).filter(c => c.status !== '完了');

  const BADGE = { '新規': ['#EEEDFE','#3C3489'], '対応中': ['#E1F5EE','#085041'], '承認待ち': ['#FAEEDA','#633806'], '期限超過': ['#FCEBEB','#791F1F'] };
  const today = new Date(); today.setHours(0,0,0,0);

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
        <div><div style={{fontSize:18,fontWeight:500}}>案件一覧</div><div style={{fontSize:12,color:'#999'}}>全{filtered.length}件</div></div>
        <button className="primary"><i className="ti ti-plus" /> 新規登録</button>
      </div>
      <input value={q} onChange={e=>setQ(e.target.value)} placeholder="案件名・顧客名で検索..." style={{marginBottom:12}} />
      {loading ? <div style={{textAlign:'center',padding:40,color:'#888'}}>読み込み中...</div> : (
        <div style={{background:'#fff',border:'0.5px solid #E0DFD8',borderRadius:8,overflow:'hidden'}}>
          {filtered.map(c => {
            const [bg,col] = BADGE[c.status] || BADGE['新規'];
            const over = new Date(c.due_date) < today;
            return (
              <div key={c.case_id} onClick={() => nav('detail',{caseId:c.case_id})}
                style={{display:'grid',gridTemplateColumns:'minmax(0,2.5fr) minmax(0,1.2fr) minmax(0,1fr) minmax(0,0.7fr) minmax(0,0.9fr)',gap:8,padding:'10px 14px',borderBottom:'0.5px solid #F0F0EA',cursor:'pointer',alignItems:'center'}}
                onMouseEnter={e=>e.currentTarget.style.background='#F9F9F7'}
                onMouseLeave={e=>e.currentTarget.style.background=''}
              >
                <div><div style={{fontSize:13,fontWeight:500}}>{c.title}</div><div style={{fontSize:11,color:'#999'}}>{c.customer_id}</div></div>
                <div><span style={{fontSize:10,padding:'2px 8px',borderRadius:10,background:bg,color:col,fontWeight:500}}>{c.status}</span></div>
                <div style={{fontSize:12,color:'#555'}}>{c.owner_user_id||'未設定'}</div>
                <div style={{fontSize:12,color:over?'#B91C1C':'#888',fontWeight:over?600:400}}>{c.due_date ? new Date(c.due_date).toLocaleDateString('ja-JP',{month:'numeric',day:'numeric'}) : '-'}</div>
                <div style={{display:'flex',alignItems:'center',gap:5}}>
                  <div style={{flex:1,height:4,background:'#EEE',borderRadius:2,overflow:'hidden'}}><div style={{height:'100%',background:over?'#E24B4A':'#1D9E75',width:`${c.progress||0}%`}} /></div>
                  <span style={{fontSize:10,color:'#AAA'}}>{c.progress||0}%</span>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && <div style={{padding:24,textAlign:'center',color:'#AAA'}}>該当する案件はありません</div>}
        </div>
      )}
    </div>
  );
}
export default CaseList;
