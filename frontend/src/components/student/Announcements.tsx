import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

interface Announcement {
  _id: string;
  title: string;
  message: string;
  createdAt: string;
  notifiedUsers?: string[];
}

const Announcements: React.FC = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [marking, setMarking] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:5000/api/announcement/student')
      .then(res => res.json())
      .then(data => setAnnouncements(Array.isArray(data) ? data : []))
      .catch(() => setAnnouncements([]))
      .finally(() => setLoading(false));
  }, []);

  const unseenAnnouncements = user ? announcements.filter(a => a.notifiedUsers && a.notifiedUsers.includes(user.id)) : [];

  const markAsSeen = async (announcementId: string) => {
    if (!user || !user.id) return;
    setMarking(announcementId);
    await fetch(`http://localhost:5000/api/announcement/${announcementId}/seen`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id })
    });
    setMarking(null);
    // Refresh list
    fetch('http://localhost:5000/api/announcement/student')
      .then(res => res.json())
      .then(data => setAnnouncements(Array.isArray(data) ? data : []));
  };

  return (
    <div style={{background:'#23232b',color:'#fff',borderRadius:12,padding:'1rem',minHeight:180,boxShadow:'0 2px 12px #0002'}}>
      <h3>Announcements</h3>
      {unseenAnnouncements.length > 0 && (
        <div style={{background:'#2563eb',color:'#fff',padding:'0.7rem',borderRadius:8,marginBottom:'1rem',fontWeight:600}}>
          You have {unseenAnnouncements.length} new announcement{unseenAnnouncements.length > 1 ? 's' : ''}!
        </div>
      )}
      {loading ? (
        <p>Loading announcements...</p>
      ) : announcements.length === 0 ? (
        <p>No announcements.</p>
      ) : (
        <ul style={{paddingLeft:0,listStyle:'none'}}>
          {announcements.map(a => {
            const isUnseen = user && a.notifiedUsers && a.notifiedUsers.includes(user.id);
            return (
              <li key={a._id} style={{marginBottom:'0.7rem',background:isUnseen ? '#1e293b' : '#18181b',borderRadius:8,padding:'0.7rem',border:isUnseen ? '2px solid #2563eb' : undefined}}>
                <b>{a.title}</b><br/>
                <span style={{fontSize:'0.95em'}}>{a.message}</span><br/>
                <span style={{fontSize:'0.85em',color:'#60a5fa'}}>{new Date(a.createdAt).toLocaleString()}</span>
                {isUnseen && (
                  <button onClick={() => markAsSeen(a._id)} disabled={marking === a._id} style={{marginLeft:12,background:'#22c55e',color:'#fff',border:'none',borderRadius:6,padding:'0.3rem 1rem',fontWeight:600,cursor:'pointer'}}>
                    {marking === a._id ? 'Marking...' : 'Dismiss'}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default Announcements; 