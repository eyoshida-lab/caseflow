import { useState, useEffect } from 'react';
import { CaseAPI, LogAPI, IssueAPI, StakeholderAPI, HandoffAPI } from '../api.js';

const BADGE = {
  '新規':     ['#EEEDFE','#3C3489'],
  '対応中':   ['#E1F5EE','#085041'],
  '承認待ち': ['#FAEEDA','#633806'],
  '期限超過': ['#FCEBEB','#791F1F'],
  '完了':     ['#F0F0F0','#666'],
};

export default function CaseDetail({ user, caseId, nav }) {
  const [caseData, setCaseData]       = useState(null);
  const [logs, setLogs]               = useState([]);
  const [issues, setIssues]           = useState([]);
  const [stakeholders, setStakeholders] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [logForm, setLogForm]         = useState({ content: '', next_action: '', tag: '' });
  const [issueForm, setIssueForm]     = useState({ title: '' });
  const [showLogForm, setShowLogForm] = useState(false);
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [saving, setSaving]           = useState(false);

  const load = () => {
    if (!caseId) return;
    return Promise.all([
      CaseAPI.get(caseId),
      LogAPI.getByCase(caseId),
      IssueAPI.getOpen(caseId),
      StakeholderAPI.getByCase(caseId),
    ]).then(([c, l, i, st]) => {
      setCaseData(c);
      setLogs(l);
      setIssues(i);
      setStakeholders(st);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [caseId]);

  const submitLog = async () => {
    if (!logForm.content) return;
    setSaving(true);
    await LogAPI.add({ ...logForm, case_id: caseId, user_id: user.user_id });
    setLogForm({ content: '', next_action: '', tag: '' });
    setShowLogForm(false);
    const updated = await LogAPI.getByCase(caseId);
    setLogs(updated);
    setSaving(false);
  };

  const submitIssue = async () => {
    if (!issueForm.title) return;
    setSaving(true);
    await IssueAPI.add({ ...issueForm, case_id: caseId, user_id: user.user_id });
    setIssueForm({ title: '' });
    setShowIssueForm(false);
    const updated = await IssueAPI.getOpen(caseId);
    setIssues(updated);
    setSaving(false);
  };

  const resolveIssue = async (issueId) => {
    await IssueAPI.resolve(issueId);
    setIssues(prev => prev.filter(i => i.issue_id !== issueId));
  };

  if (loading) return <div style={{padding:40,textAlign:'center',color:'#888'}}>読み込み中...</div>;
  if (!caseData) return <div style={{padding:40,textAlign:'center',color:'#888'}}>案件が見つかりません</div>;

  const today = new Date(); today.setHours(0,0,0,0);
  const due = caseData.due_date ? new Date(caseData.due_date) : null;
  const isOverdue = due && due < today;
  const [bg, col] = BADGE[caseData.status] || BADGE['新規'];

  const TAG_COLORS = { '要フォロー': ['#FAEEDA','#633806'], '完了': ['#E1F5EE','#085041'], '懸念': ['#FCEBEB','#791F1F'], '情報共有': ['#EEEDFE','#3C3489'] };

  return (
    <div>
      {/* パンくず */}
      <div style={{fontSize:11,color:'#AAA',marginBottom:12,display:'flex',alignItems:'center',gap:5}}>
        <span style={{cursor:'pointer',color:'#666'}} onClick={() => nav('cases')}>案件一覧</span>
        <i className="ti ti-chevron-right" style={{fontSize:11}} />
        <span>{caseData.title}</span>
      </div>

      {/* ヘッダー */}
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:16}}>
        <div>
          <div style={{fontSize:19,fontWeight:500,marginBottom:4}}>{caseData.title}</div>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <span style={{fontSize:11,padding:'2px 9px',borderRadius:10,background:bg,color:col,fontWeight:500}}>{caseData.status}{isOverdue ? ` (超過)` : ''}</span>
            <span style={{fontSize:12,color:'#999'}}>{caseData.customer_id}</span>
          </div>
        </div>
        <div style={{display:'flex',gap:6}}>
          <button onClick={() => setShowLogForm(v => !v)}><i className="ti ti-pencil" /> 日報を記録</button>
          <button onClick={() => nav('handoff', { caseId })}><i className="ti ti-transfer" /> 引き継ぎ</button>
        </div>
      </div>

      {/* 日報入力フォーム */}
      {showLogForm && (
        <div style={{background:'#fff',border:'0.5px solid #7F77DD',borderRadius:8,padding:16,marginBottom:14}}>
          <div style={{fontSize:13,fontWeight:500,marginBottom:10}}>日報を記録</div>
          <div style={{marginBottom:8}}>
            <label>対応内容 *</label>
            <textarea rows={3} value={logForm.content} onChange={e=>setLogForm(v=>({...v,content:e.target.value}))} placeholder="今日の対応内容を入力..." />
          </div>
          <div style={{marginBottom:8}}>
            <label>ネクストアクション</label>
            <input value={logForm.next_action} onChange={e=>setLogForm(v=>({...v,next_action:e.target.value}))} placeholder="次にやること..." />
          </div>
          <div style={{marginBottom:12}}>
            <label>タグ</label>
            <select value={logForm.tag} onChange={e=>setLogForm(v=>({...v,tag:e.target.value}))}>
              <option value="">なし</option>
              <option>完了</option><option>要フォロー</option><option>懸念</option><option>情報共有</option>
            </select>
          </div>
          <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
            <button onClick={() => setShowLogForm(false)}>キャンセル</button>
            <button className="primary" onClick={submitLog} disabled={saving || !logForm.content}>{saving ? '保存中...' : '保存'}</button>
          </div>
        </div>
      )}

      <div style={{display:'grid',gridTemplateColumns:'1fr 240px',gap:14,alignItems:'start'}}>
        {/* 左カラム */}
        <div>
          {/* 案件情報 */}
          <div style={{background:'#fff',border:'0.5px solid #E0DFD8',borderRadius:8,padding:16,marginBottom:12}}>
            <div style={{fontSize:12,fontWeight:500,color:'#888',marginBottom:10,display:'flex',alignItems:'center',gap:5}}><i className="ti ti-info-circle" /> 案件情報</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px 16px',marginBottom:12}}>
              <div><div style={{fontSize:11,color:'#999',marginBottom:2}}>期限</div><div style={{fontSize:13,color:isOverdue?'#B91C1C':'#1A1A1A',fontWeight:isOverdue?600:400}}>{due ? due.toLocaleDateString('ja-JP') : '-'}{isOverdue?' (超過)':''}</div></div>
              <div><div style={{fontSize:11,color:'#999',marginBottom:2}}>優先度</div><div style={{fontSize:13,color:caseData.priority==='高'?'#BA7517':'#1A1A1A'}}>{caseData.priority||'-'}</div></div>
              <div><div style={{fontSize:11,color:'#999',marginBottom:2}}>種別</div><div style={{fontSize:13}}>{caseData.category||'-'}</div></div>
              <div><div style={{fontSize:11,color:'#999',marginBottom:2}}>進捗</div><div style={{fontSize:13}}>{caseData.progress||0}%</div></div>
              {caseData.description && <div style={{gridColumn:'1/-1'}}><div style={{fontSize:11,color:'#999',marginBottom:2}}>概要</div><div style={{fontSize:13,lineHeight:1.6}}>{caseData.description}</div></div>}
            </div>
            <div style={{height:5,background:'#EEE',borderRadius:3,overflow:'hidden'}}>
              <div style={{height:'100%',background:isOverdue?'#E24B4A':'#1D9E75',width:`${caseData.progress||0}%`,borderRadius:3}} />
            </div>
          </div>

          {/* 課題 */}
          <div style={{background:'#fff',border:'0.5px solid #E0DFD8',borderRadius:8,padding:16,marginBottom:12}}>
            <div style={{fontSize:12,fontWeight:500,color:'#888',marginBottom:10,display:'flex',alignItems:'center',gap:5}}><i className="ti ti-alert-triangle" /> 課題・ブロッカー</div>
            {issues.map(i => (
              <div key={i.issue_id} style={{display:'flex',alignItems:'flex-start',gap:8,padding:'8px 10px',borderRadius:6,border:'0.5px solid #FCA5A5',background:'#FCEBEB',marginBottom:6,fontSize:12}}>
                <i className="ti ti-circle-x" style={{color:'#B91C1C',flexShrink:0,marginTop:1}} />
                <div style={{flex:1}}>
                  <div style={{color:'#1A1A1A'}}>{i.title}</div>
                  <div style={{fontSize:10,color:'#999',marginTop:2}}>{i.user_id} · {i.created_at ? new Date(i.created_at).toLocaleDateString('ja-JP') : ''}</div>
                </div>
                <button style={{fontSize:10,padding:'2px 7px',background:'#fff',borderColor:'#FCA5A5',color:'#B91C1C'}} onClick={() => resolveIssue(i.issue_id)}>解決</button>
              </div>
            ))}
            {issues.length === 0 && <div style={{fontSize:12,color:'#AAA',padding:'6px 0'}}>未解決の課題はありません</div>}
            {showIssueForm ? (
              <div style={{marginTop:10}}>
                <input value={issueForm.title} onChange={e=>setIssueForm({title:e.target.value})} placeholder="課題タイトルを入力..." style={{marginBottom:6}} />
                <div style={{display:'flex',gap:6,justifyContent:'flex-end'}}>
                  <button onClick={() => setShowIssueForm(false)}>キャンセル</button>
                  <button className="primary" onClick={submitIssue} disabled={saving||!issueForm.title}>{saving?'保存中...':'追加'}</button>
                </div>
              </div>
            ) : (
              <button style={{fontSize:12,marginTop:8,color:'#888',border:'none',background:'none',padding:'4px 0',cursor:'pointer'}} onClick={() => setShowIssueForm(true)}>
                <i className="ti ti-plus" style={{fontSize:12}} /> 課題を追加
              </button>
            )}
          </div>

          {/* 活動履歴 */}
          <div style={{background:'#fff',border:'0.5px solid #E0DFD8',borderRadius:8,padding:16}}>
            <div style={{fontSize:12,fontWeight:500,color:'#888',marginBottom:12,display:'flex',alignItems:'center',gap:5}}><i className="ti ti-timeline" /> 活動履歴</div>
            {logs.length === 0 && <div style={{fontSize:12,color:'#AAA'}}>日報がまだありません</div>}
            {logs.map((l, idx) => {
              const [tagBg, tagCol] = TAG_COLORS[l.tag] || ['#F0F0F0','#666'];
              return (
                <div key={l.log_id} style={{display:'flex',gap:10,paddingBottom:idx<logs.length-1?14:0}}>
                  <div style={{display:'flex',flexDirection:'column',alignItems:'center',width:20,flexShrink:0}}>
                    <div style={{width:7,height:7,borderRadius:'50%',background:l.tag==='要フォロー'?'#BA7517':l.tag==='懸念'?'#B91C1C':'#1D9E75',marginTop:3,flexShrink:0}} />
                    {idx < logs.length-1 && <div style={{flex:1,width:1,background:'#E0DFD8',marginTop:2}} />}
                  </div>
                  <div style={{flex:1,paddingBottom:idx<logs.length-1?4:0}}>
                    <div style={{fontSize:10,color:'#AAA',marginBottom:2}}>{l.log_date ? new Date(l.log_date).toLocaleDateString('ja-JP') : ''}</div>
                    <div style={{fontSize:13,lineHeight:1.5,color:'#1A1A1A'}}>
                      {l.content}
                      {l.tag && <span style={{fontSize:10,padding:'1px 6px',borderRadius:8,background:tagBg,color:tagCol,marginLeft:6}}>{l.tag}</span>}
                    </div>
                    {l.next_action && <div style={{fontSize:11,color:'#888',marginTop:3}}>→ {l.next_action}</div>}
                    <div style={{fontSize:10,color:'#AAA',marginTop:2}}>{l.user_id}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 右サイドバー */}
        <div>
          {/* 担当者 */}
          <div style={{background:'#fff',border:'0.5px solid #E0DFD8',borderRadius:8,padding:14,marginBottom:10}}>
            <div style={{fontSize:12,fontWeight:500,color:'#888',marginBottom:8,display:'flex',alignItems:'center',gap:4}}><i className="ti ti-users" /> 担当者</div>
            {caseData.owner_user_id ? (
              <div style={{display:'flex',alignItems:'center',gap:8,fontSize:13}}>
                <div style={{width:26,height:26,borderRadius:'50%',background:'#E1F5EE',color:'#085041',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:600}}>{caseData.owner_user_id.slice(-1)}</div>
                <div><div>{caseData.owner_user_id}</div><div style={{fontSize:10,color:'#999'}}>主担当</div></div>
              </div>
            ) : (
              <div style={{fontSize:12,color:'#B91C1C'}}>担当者未設定</div>
            )}
          </div>

          {/* 関係者 */}
          <div style={{background:'#fff',border:'0.5px solid #E0DFD8',borderRadius:8,padding:14,marginBottom:10}}>
            <div style={{fontSize:12,fontWeight:500,color:'#888',marginBottom:8,display:'flex',alignItems:'center',gap:4}}><i className="ti ti-building" /> 顧客・関係者</div>
            {stakeholders.length === 0 && <div style={{fontSize:12,color:'#AAA'}}>登録なし</div>}
            {stakeholders.map(s => (
              <div key={s.stakeholder_id} style={{display:'flex',alignItems:'center',gap:8,padding:'5px 0',borderBottom:'0.5px solid #F0F0EA'}}>
                <div style={{width:24,height:24,borderRadius:'50%',background:'#F0F0EA',border:'0.5px solid #E0DFD8',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:600,color:'#666',flexShrink:0}}>{s.name?.slice(0,1)}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,color:'#1A1A1A'}}>{s.name}</div>
                  <div style={{fontSize:10,color:'#999'}}>{s.role}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Drive */}
          {caseData.drive_folder_url && (
            <div style={{background:'#fff',border:'0.5px solid #E0DFD8',borderRadius:8,padding:14,marginBottom:10}}>
              <div style={{fontSize:12,fontWeight:500,color:'#888',marginBottom:6,display:'flex',alignItems:'center',gap:4}}><i className="ti ti-folder" /> 関連ファイル</div>
              <a href={caseData.drive_folder_url} target="_blank" rel="noreferrer" style={{fontSize:12,color:'#534AB7',display:'flex',alignItems:'center',gap:5}}>
                <i className="ti ti-brand-google-drive" style={{fontSize:14}} /> Drive フォルダを開く
              </a>
            </div>
          )}

          {/* AIサマリー */}
          <div style={{background:'#fff',border:'0.5px solid #E0DFD8',borderRadius:8,padding:14}}>
            <div style={{fontSize:11,fontWeight:500,color:'#3C3489',marginBottom:6,display:'flex',alignItems:'center',gap:4}}><i className="ti ti-sparkles" style={{fontSize:12}} /> AI サマリー</div>
            <div style={{fontSize:12,color:'#555',lineHeight:1.6,background:'#F7F7F8',borderRadius:6,padding:'8px 10px',marginBottom:8}}>
              {logs.length > 0 ? `直近の活動: ${logs[0]?.content?.slice(0,60)}...` : '日報を記録するとAIサマリーが生成されます。'}
            </div>
            <button style={{fontSize:11,width:'100%'}} onClick={() => nav('handoff',{caseId})}>
              週次サマリーを生成 →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
