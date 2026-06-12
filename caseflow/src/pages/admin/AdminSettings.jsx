// AdminSettings.jsx
export default function AdminSettings({ user, nav }) {
  return (
    <div>
      <div style={{fontSize:18,fontWeight:500,marginBottom:4}}>システム設定</div>
      <div style={{fontSize:12,color:'#999',marginBottom:16}}>全体に適用されるマスターデータと連携設定</div>

      <div style={{background:'#fff',border:'0.5px solid #E0DFD8',borderRadius:8,padding:16,marginBottom:12}}>
        <div style={{fontSize:12,fontWeight:500,color:'#888',marginBottom:10,display:'flex',alignItems:'center',gap:5}}><i className="ti ti-database" /> マスタースプレッドシート</div>
        <div style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',background:'#F7F7F8',borderRadius:6,marginBottom:8}}>
          <i className="ti ti-table" style={{fontSize:16,color:'#1D9E75'}} />
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:500}}>CaseFlow マスター</div>
            <div style={{fontSize:11,color:'#999'}}>7シート接続済み</div>
          </div>
          <span style={{fontSize:10,padding:'2px 8px',borderRadius:8,background:'#E1F5EE',color:'#085041',fontWeight:500}}>接続済み</span>
        </div>
        <div style={{display:'flex',flexWrap:'wrap',gap:6,fontSize:12}}>
          {['ユーザーマスター','顧客マスター','案件','日報ログ','課題管理','引き継ぎサマリー','関係者'].map(s => (
            <span key={s} style={{display:'flex',alignItems:'center',gap:4,color:'#085041'}}>
              <i className="ti ti-check" style={{fontSize:12}} /> {s}
            </span>
          ))}
        </div>
      </div>

      <div style={{background:'#fff',border:'0.5px solid #E0DFD8',borderRadius:8,padding:16,marginBottom:12}}>
        <div style={{fontSize:12,fontWeight:500,color:'#888',marginBottom:12,display:'flex',alignItems:'center',gap:5}}><i className="ti ti-bell" /> 通知設定</div>
        {[
          ['期限超過アラート', '毎朝 8:00', true],
          ['期限3日前リマインド', '毎朝 9:00', true],
          ['担当未設定アラート', '24時間経過後', true],
          ['週次サマリー配信', '毎週月曜 9:00', true],
        ].map(([label, time, on]) => (
          <div key={label} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 0',borderBottom:'0.5px solid #F0F0EA'}}>
            <div>
              <div style={{fontSize:13}}>{label}</div>
              <div style={{fontSize:11,color:'#999'}}>{time}</div>
            </div>
            <div style={{fontSize:12,color:on?'#085041':'#999'}}>{on ? '✓ 有効' : '無効'}</div>
          </div>
        ))}
        <div style={{fontSize:11,color:'#AAA',marginTop:8}}>※ 通知ルールの詳細設定は Phase 3 で実装予定</div>
      </div>

      <div style={{background:'#fff',border:'0.5px solid #E0DFD8',borderRadius:8,padding:16}}>
        <div style={{fontSize:12,fontWeight:500,color:'#888',marginBottom:10,display:'flex',alignItems:'center',gap:5}}><i className="ti ti-list" /> マスターデータ管理</div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          {[['tag','ステータス種別'],['flag','優先度設定'],['category','案件種別'],['building','業種マスター']].map(([icon,label]) => (
            <button key={label} style={{fontSize:12}}><i className={`ti ti-${icon}`} style={{fontSize:12}} /> {label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
