import { useState } from 'react';
import { CaseAPI, CustomerAPI, LogAPI } from '../api.js';

export default function SearchPage({ user, nav }) {
  const [q, setQ]           = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const search = async () => {
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    const [cases, customers] = await Promise.all([CaseAPI.getAll(), CustomerAPI.getAll()]);
    const kw = q.toLowerCase();
    const matched = [
      ...customers.filter(c => c.name?.toLowerCase().includes(kw)).map(c => ({ type:'customer', id:c.customer_id, title:c.name, sub:`顧客 · ${c.industry||''}`, data:c })),
      ...cases.filter(c => c.title?.toLowerCase().includes(kw) || c.customer_id?.toLowerCase().includes(kw) || c.description?.toLowerCase().includes(kw)).map(c => ({ type:'case', id:c.case_id, title:c.title, sub:`案件 · ${c.customer_id} · ${c.status}`, data:c })),
    ];
    setResults(matched);
    setLoading(false);
  };

  const ICONS = { customer: 'building', case: 'file-description', log: 'pencil' };
  const COLORS = { customer: '#534AB7', case: '#1D9E75', log: '#BA7517' };

  return (
    <div>
      <div style={{marginBottom:16}}>
        <div style={{fontSize:18,fontWeight:500}}>横断検索</div>
        <div style={{fontSize:12,color:'#999'}}>案件・顧客・日報をまとめて検索</div>
      </div>

      <div style={{display:'flex',gap:8,marginBottom:12}}>
        <input
          value={q}
          onChange={e=>setQ(e.target.value)}
          onKeyDown={e=>e.key==='Enter'&&search()}
          placeholder="キーワード・顧客名・担当者名..."
          style={{flex:1,fontSize:14}}
          autoFocus
        />
        <button className="primary" onClick={search} disabled={loading}>
          <i className="ti ti-search" /> {loading ? '検索中...' : '検索'}
        </button>
      </div>

      {searched && !loading && (
        <div style={{background:'#fff',border:'0.5px solid #E0DFD8',borderRadius:8,overflow:'hidden'}}>
          <div style={{padding:'7px 14px',fontSize:11,color:'#AAA',background:'#F9F9F7',borderBottom:'0.5px solid #E0DFD8'}}>
            {results.length}件ヒット
          </div>
          {results.length === 0 && <div style={{padding:24,textAlign:'center',color:'#AAA',fontSize:13}}>「{q}」に一致する結果が見つかりませんでした</div>}
          {results.map(r => (
            <div key={`${r.type}-${r.id}`}
              onClick={() => r.type === 'case' ? nav('detail',{caseId:r.id}) : null}
              style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',borderBottom:'0.5px solid #F0F0EA',cursor:r.type==='case'?'pointer':'default'}}
              onMouseEnter={e=>r.type==='case'&&(e.currentTarget.style.background='#F9F9F7')}
              onMouseLeave={e=>r.type==='case'&&(e.currentTarget.style.background='')}
            >
              <div style={{width:30,height:30,borderRadius:'50%',background:`${COLORS[r.type]}20`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <i className={`ti ti-${ICONS[r.type]}`} style={{fontSize:14,color:COLORS[r.type]}} />
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:500,color:'#1A1A1A'}}>{r.title}</div>
                <div style={{fontSize:11,color:'#999'}}>{r.sub}</div>
              </div>
              {r.type === 'case' && <i className="ti ti-chevron-right" style={{fontSize:13,color:'#CCC'}} />}
            </div>
          ))}
        </div>
      )}

      {!searched && (
        <div style={{padding:'32px 20px',textAlign:'center',color:'#AAA',fontSize:13}}>
          <i className="ti ti-search" style={{fontSize:28,display:'block',marginBottom:8,opacity:.3}} />
          キーワードを入力してEnterを押してください
        </div>
      )}
    </div>
  );
}
