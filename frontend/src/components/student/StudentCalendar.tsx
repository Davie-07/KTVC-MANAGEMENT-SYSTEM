import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

interface ClassItem {
  _id: string;
  title: string;
  course: string;
  date: string;
  startTime: string;
  endTime: string;
  notifiedStudents?: string[];
}

const StudentCalendar: React.FC = () => {
  const { user, token } = useAuth();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [marking, setMarking] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch(`http://localhost:5000/api/class/student/${user.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setClasses(Array.isArray(data) ? data : []))
      .catch(() => setClasses([]))
      .finally(() => setLoading(false));
  }, [user, token]);

  const unseenClasses = user ? classes.filter(cls => cls.notifiedStudents && cls.notifiedStudents.includes(user.id)) : [];

  const markAsSeen = async (classId: string) => {
    if (!user || !user.id) return;
    setMarking(classId);
    await fetch(`http://localhost:5000/api/class/${classId}/seen`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ studentId: user.id })
    });
    setMarking(null);
    // Refresh list
    if (!user || !user.id) return;
    fetch(`http://localhost:5000/api/class/student/${user?.id || ''}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setClasses(Array.isArray(data) ? data : []));
  };

  return (
    <div style={{background:'#23232b',color:'#fff',borderRadius:12,padding:'1rem',minHeight:180,boxShadow:'0 2px 12px #0002'}}>
      <h3>Calendar</h3>
      {unseenClasses.length > 0 && (
        <div style={{background:'#2563eb',color:'#fff',padding:'0.7rem',borderRadius:8,marginBottom:'1rem',fontWeight:600}}>
          You have {unseenClasses.length} new class{unseenClasses.length > 1 ? 'es' : ''} assigned!
        </div>
      )}
      {loading ? (
        <p>Loading classes...</p>
      ) : classes.length === 0 ? (
        <p>No classes scheduled.</p>
      ) : (
        <ul style={{paddingLeft:0,listStyle:'none'}}>
          {classes.map(cls => {
            const isUnseen = cls.notifiedStudents && cls.notifiedStudents.includes(user?.id || '');
            return (
              <li key={cls._id} style={{marginBottom:'0.7rem',background:isUnseen ? '#1e293b' : '#18181b',borderRadius:8,padding:'0.7rem',border:isUnseen ? '2px solid #2563eb' : undefined}}>
                <b>{cls.title}</b> ({cls.course})<br/>
                {new Date(cls.date).toLocaleDateString()}<br/>
                {cls.startTime} - {cls.endTime}
                {isUnseen && (
                  <button onClick={() => markAsSeen(cls._id)} disabled={marking === cls._id} style={{marginLeft:12,background:'#22c55e',color:'#fff',border:'none',borderRadius:6,padding:'0.3rem 1rem',fontWeight:600,cursor:'pointer'}}>
                    {marking === cls._id ? 'Marking...' : 'Dismiss'}
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

export default StudentCalendar; 