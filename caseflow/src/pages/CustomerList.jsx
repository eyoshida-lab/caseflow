// CustomerList.jsx
import { useState, useEffect } from 'react';
import { CustomerAPI, CaseAPI } from '../api.js';

export default function CustomerList({ user, nav }) {
  const [customers, setCustomers] = useState([]);
  const [cases, setCases] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([CustomerAPI.getAll(), CaseAPI.getAll()])
      .then(([c, cs]) => { setCustomers(c); setCases(cs); })
      .finally(() => setLoading(false));
  }, []);

  const filtered = customers.filter(c => !q || c.name.includes(q));
  const caseCount = (cid) => cases.filter(c => c.customer_id === cid && c.status !== '完了').length;
  const hasOverdue = (cid) => cases.some(c => c.customer_id === cid && c.status === '期限超過');

  if (loading) return <div style={{padding:40,textAlign:'center',color:'#888'}}>読み込み中...</div>;

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
        <div><div style={{fontSize:18,fontWeight:500}}>顧客一覧</div><div style={{fontSize:12,color:'#999'}}>全{customers.length}社</div></div>
        <button className="primary"><i className="ti ti-plus" /> 顧客追加</button>
      </div>
      <input value={q} onChange={e=>setQ(e.target.value)} placeholder="顧客名で検索..." style={{marginBottom:12}} />
      <div style={{background:'#fff',border:'0.5px solid #E0DFD8',borderRadius:8,overflow:'hidden'}}>
        {filtered.map(c => (
          <div key={c.customer_id} style={{display:'flex',alignItems:'center',gap:10,padding:'12px 14px',borderBottom:'0.5px solid #F0F0EA',cursor:'pointer'}}
            onMouseEnter={e=>e.currentTarget.style.background='#F9F9F7'}
            onMouseLeave={e=>e.currentTarget.style.background=''}
          >
            <div style={{width:34,height:34,borderRadius:8,background:'#EEEDFE',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:600,color:'#3C3489',flexShrink:0}}>{c.name?.slice(0,1)}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:500}}>{c.name}</div>
              <div style={{fontSize:11,color:'#999'}}>{c.industry} · 主担当: {c.owner_user_id||'未設定'}</div>
            </div>
            <div style={{textAlign:'right'}}>
              {hasOverdue(c.customer_id) && <span style={{fontSize:10,padding:'1px 7px',borderRadius:8,background:'#FCEBEB',color:'#791F1F',fontWeight:500,display:'block',marginBottom:2}}>超過あり</span>}
              <div style={{fontSize:11,color:'#999'}}>{caseCount(c.customer_id)}件の案件</div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div style={{padding:24,textAlign:'center',color:'#AAA'}}>顧客が見つかりません</div>}
      </div>
    </div>
  );
}
