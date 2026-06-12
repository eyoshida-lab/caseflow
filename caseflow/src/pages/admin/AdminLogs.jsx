import { useState, useEffect } from 'react';
import { LogAPI, CaseAPI } from '../../api.js';

export default function AdminLogs({ user, nav }) {
  const [logs, setLogs]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 全案件の直近ログをまとめて取得
    CaseAPI.getAll().then(async cases => {
      const allLogs = [];
      for (const c of cases.slice(0, 10)) {
        const ls = await LogAPI.getByCase(c.case_id);
        ls.forEach(l => allLogs.push({ ...l, caseTitle: c.title }));
      }
      allLogs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setLogs(allLogs.slice(0, 30));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{padding:40,textAlign:'center',color:'#888'}}>読み込み中...</div>;

  return (
    <div>
      <div style={{fontSize:18,fontWeight:500,marginBottom:4}}>操作ログ</div>
      <div style={{fontSize:12,color:'#999',marginBottom:16}}>直近の活動履歴（全案件）</div>
      <div style={{background:'#fff',border:'0.5px solid #E0DFD8',borderRadius:8,overflow:'hidden'}}>
        {logs.length === 0 && <div style={{padding:24,textAlign:'center',color:'#AAA',fontSize:13}}>ログがまだありません</div>}
        {logs.map(l => (
          <div key={l.log_id} style={{display:'flex',alignItems:'flex-start',gap:10,padding:'10px 14px',borderBottom:'0.5px solid #F0F0EA',fontSize:12}}>
            <div style={{fontSize:11,color:'#AAA',flexShrink:0,width:90,paddingTop:1}}>
              {l.log_date ? new Date(l.log_date).toLocaleDateString('ja-JP',{month:'numeric',day:'numeric'}) : '-'}
            </div>
            <div style={{flex:1,lineHeight:1.6}}>
              <span style={{fontWeight:500,color:'#1A1A1A'}}>{l.user_id}</span>
              {' が「'}
              <span style={{color:'#534AB7',cursor:'pointer'}} onClick={() => nav('detail',{caseId:l.case_id})}>{l.caseTitle}</span>
              {'」に日報を記録しました'}
              {l.tag && <span style={{fontSize:10,marginLeft:5,padding:'1px 6px',borderRadius:6,background:'#EEEDFE',color:'#3C3489'}}>{l.tag}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
