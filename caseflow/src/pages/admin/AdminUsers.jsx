// AdminUsers.jsx
import { useState, useEffect } from 'react';
import { UserAPI } from '../../api.js';

export default function AdminUsers({ user, nav }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => UserAPI.getAll().then(setUsers).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const toggleAdmin = async (u) => {
    await UserAPI.setAdmin(u.user_id, !(u.is_admin === true || u.is_admin === 'TRUE'));
    load();
  };
  const deactivate = async (u) => {
    if (!confirm(`${u.name} を無効化しますか？`)) return;
    await UserAPI.deactivate(u.user_id);
    load();
  };

  const isAdmin = (u) => u.is_admin === true || u.is_admin === 'TRUE';
  const admins  = users.filter(isAdmin).length;

  if (loading) return <div style={{padding:40,textAlign:'center',color:'#888'}}>読み込み中...</div>;

  return (
    <div>
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:16}}>
        <div><div style={{fontSize:18,fontWeight:500}}>ユーザー管理</div><div style={{fontSize:12,color:'#999'}}>メンバーの追加・権限変更・無効化</div></div>
        <button className="primary"><i className="ti ti-plus" /> メンバー追加</button>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:14}}>
        {[['総メンバー',users.length,''],['管理者',admins,''],['有効',users.length,''],['無効',0,'#999']].map(([l,v,c]) => (
          <div key={l} style={{background:'#fff',border:'0.5px solid #E0DFD8',borderRadius:8,padding:'12px 14px'}}>
            <div style={{fontSize:11,color:'#999',marginBottom:4}}>{l}</div>
            <div style={{fontSize:20,fontWeight:500,color:c||'#1A1A1A'}}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{background:'#fff',border:'0.5px solid #E0DFD8',borderRadius:8,overflow:'hidden'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
          <thead>
            <tr style={{background:'#F9F9F7',borderBottom:'0.5px solid #E0DFD8'}}>
              <th style={{padding:'7px 14px',textAlign:'left',fontSize:11,color:'#AAA',fontWeight:500,width:36}}></th>
              <th style={{padding:'7px 14px',textAlign:'left',fontSize:11,color:'#AAA',fontWeight:500}}>名前</th>
              <th style={{padding:'7px 14px',textAlign:'left',fontSize:11,color:'#AAA',fontWeight:500,width:90}}>権限</th>
              <th style={{padding:'7px 14px',textAlign:'left',fontSize:11,color:'#AAA',fontWeight:500,width:120}}>操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => {
              const admin = isAdmin(u);
              const isMe  = u.user_id === user.user_id;
              return (
                <tr key={u.user_id} style={{borderBottom:'0.5px solid #F0F0EA'}}>
                  <td style={{padding:'10px 14px'}}>
                    <div style={{width:28,height:28,borderRadius:'50%',background:'#EEEDFE',color:'#3C3489',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:600}}>{u.initial}</div>
                  </td>
                  <td style={{padding:'10px 14px'}}>
                    <div style={{fontWeight:500}}>{u.name}{isMe && <span style={{fontSize:10,color:'#888',fontWeight:400,marginLeft:5}}>（自分）</span>}</div>
                  </td>
                  <td style={{padding:'10px 14px'}}>
                    <span style={{fontSize:10,padding:'2px 8px',borderRadius:8,background:admin?'#FAEEDA':'#F0F0F0',color:admin?'#633806':'#666',fontWeight:500}}>
                      {admin ? '👑 管理者' : '担当者'}
                    </span>
                  </td>
                  <td style={{padding:'10px 14px'}}>
                    {isMe ? (
                      <span style={{fontSize:11,color:'#AAA'}}>変更不可</span>
                    ) : (
                      <div style={{display:'flex',gap:5}}>
                        <button style={{fontSize:11,padding:'3px 8px'}} onClick={() => toggleAdmin(u)}>
                          {admin ? '権限を下げる' : '管理者にする'}
                        </button>
                        <button className="danger" style={{fontSize:11,padding:'3px 8px'}} onClick={() => deactivate(u)}>無効化</button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
