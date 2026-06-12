// HandoffPage.jsx
import { useState, useEffect } from 'react';
import { HandoffAPI, LogAPI, UserAPI, CaseAPI } from '../api.js';

export default function HandoffPage({ user, caseId, nav }) {
  const [handoff, setHandoff]   = useState({ current_status:'', open_issues:'', key_person:'', next_action:'', handoff_memo:'' });
  const [users, setUsers]       = useState([]);
  const [toUser, setToUser]     = useState('');
  const [caseData, setCaseData] = useState(null);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);

  useEffect(() => {
    if (!caseId) return;
    Promise.all([
      HandoffAPI.get(caseId),
      UserAPI.getAll(),
      CaseAPI.get(caseId),
    ]).then(([h, u, c]) => {
      if (h) setHandoff(prev => ({ ...prev, ...h }));
      setUsers(u);
      setCaseData(c);
    });
  }, [caseId]);

  const save = async () => {
    setSaving(true);
    await HandoffAPI.save({ ...handoff, case_id: caseId, from_user_id: user.user_id, to_user_id: toUser });
    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 2000);
  };

  const field = (label, key, rows = 3, hint = '') => (
    <div style={{marginBottom:12}}>
      <label>{label}{hint && <span style={{fontWeight:400,color:'#AAA',marginLeft:4}}>{hint}</span>}</label>
      <textarea rows={rows} value={handoff[key]||''} onChange={e=>setHandoff(v=>({...v,[key]:e.target.value}))} />
    </div>
  );

  return (
    <div>
      <div style={{fontSize:11,color:'#AAA',marginBottom:12,display:'flex',alignItems:'center',gap:5}}>
        {caseId && <><span style={{cursor:'pointer',color:'#666'}} onClick={() => nav('detail',{caseId})}>案件詳細</span><i className="ti ti-chevron-right" style={{fontSize:11}} /></>}
        <span>引き継ぎ</span>
      </div>
      <div style={{fontSize:18,fontWeight:500,marginBottom:4}}>引き継ぎモード</div>
      <div style={{fontSize:12,color:'#999',marginBottom:16}}>{caseData?.title} — {caseData?.customer_id}</div>

      <div style={{background:'#fff',border:'0.5px solid #E0DFD8',borderRadius:8,padding:16}}>
        <div style={{fontSize:12,fontWeight:500,color:'#888',marginBottom:14,display:'flex',alignItems:'center',gap:5}}><i className="ti ti-transfer" /> 引き継ぎフォーム</div>

        {/* ステップ1 */}
        <div style={{display:'flex',gap:10,marginBottom:16}}>
          <div style={{width:24,height:24,borderRadius:'50%',background:'#EEEDFE',color:'#3C3489',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:600,flexShrink:0}}>1</div>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:500,marginBottom:8}}>引き継ぎ内容を記載</div>
            {field('現在の対応状況', 'current_status', 3, '(AI自動生成 or 手動)')}
            {field('未解決の課題・ブロッカー', 'open_issues', 2)}
            {field('顧客キーパーソン・注意事項', 'key_person', 2, '(手動推奨)')}
            {field('次のアクション', 'next_action', 2)}
            {field('引き継ぎメモ（口頭で伝えたいこと）', 'handoff_memo', 3)}
          </div>
        </div>

        <hr style={{border:'none',borderTop:'0.5px solid #E0DFD8',margin:'0 0 16px'}} />

        {/* ステップ2 */}
        <div style={{display:'flex',gap:10,marginBottom:16}}>
          <div style={{width:24,height:24,borderRadius:'50%',background:'#EEEDFE',color:'#3C3489',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:600,flexShrink:0}}>2</div>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:500,marginBottom:8}}>新担当者に通知</div>
            <div style={{display:'flex',gap:8,alignItems:'center'}}>
              <select value={toUser} onChange={e=>setToUser(e.target.value)} style={{flex:1}}>
                <option value="">引き継ぎ先を選択...</option>
                {users.filter(u2=>u2.user_id !== user.user_id).map(u2 => (
                  <option key={u2.user_id} value={u2.user_id}>{u2.name}</option>
                ))}
              </select>
              <button className="primary" onClick={save} disabled={saving || !toUser} style={{whiteSpace:'nowrap'}}>
                <i className="ti ti-brand-google" style={{fontSize:12}} /> {saving ? '保存中...' : saved ? '✓ 保存済み' : 'Google Chat で通知'}
              </button>
            </div>
            <div style={{fontSize:11,color:'#AAA',marginTop:5}}>※ Google Chat 通知は Phase 3 で実装予定</div>
          </div>
        </div>

        <div style={{display:'flex',justifyContent:'flex-end',gap:8,borderTop:'0.5px solid #E0DFD8',paddingTop:12}}>
          <button onClick={() => caseId ? nav('detail',{caseId}) : nav('cases')}>キャンセル</button>
          <button className="primary" onClick={save} disabled={saving}>{saving ? '保存中...' : saved ? '✓ 保存済み' : '引き継ぎ情報を保存'}</button>
        </div>
      </div>
    </div>
  );
}
