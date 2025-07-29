import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

interface ClassEvent {
  _id: string;
  title: string;
  course: string;
  start: Date;
  end: Date;
  students: { _id: string; firstName: string; lastName: string; email: string }[];
}

const TeacherCalendar: React.FC = () => {
  const { user, token } = useAuth();
  const [events, setEvents] = useState<ClassEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editClass, setEditClass] = useState<ClassEvent | null>(null);
  const [form, setForm] = useState<any>({});
  const [students, setStudents] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState<any>({});
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch(`http://localhost:5000/api/class/teacher/${user.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setEvents(data.map(cls => ({
            _id: cls._id,
            title: cls.title,
            course: cls.course,
            start: new Date(cls.date + 'T' + cls.startTime),
            end: new Date(cls.date + 'T' + cls.endTime),
            students: cls.students || [],
          })));
        } else {
          setEvents([]);
        }
      })
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [user, token, modalOpen]);

  useEffect(() => {
    fetch('http://localhost:5000/api/exam-result/students', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setStudents(Array.isArray(data) ? data : []))
      .catch(() => setStudents([]));
  }, [token]);

  const onSelectEvent = (event: ClassEvent) => {
    setEditClass(event);
    setForm({
      title: event.title,
      course: event.course,
      date: format(event.start, 'yyyy-MM-dd'),
      startTime: format(event.start, 'HH:mm'),
      endTime: format(event.end, 'HH:mm'),
      students: event.students.map(s => s._id),
    });
    setModalOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, selectedOptions } = e.target as HTMLInputElement & HTMLSelectElement;
    if (name === 'students') {
      const values = Array.from(selectedOptions).map(opt => opt.value);
      setForm((prev: any) => ({ ...prev, students: values }));
    } else {
      setForm((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  const saveEdit = async () => {
    if (!editClass) return;
    setSaving(true);
    await fetch(`http://localhost:5000/api/class/${editClass._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        title: form.title,
        course: form.course,
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        students: form.students,
        teacher: user?.id
      })
    });
    setSaving(false);
    setModalOpen(false);
  };

  const onSelectSlot = (slotInfo: any) => {
    setCreateForm({
      title: '',
      course: '',
      date: format(slotInfo.start, 'yyyy-MM-dd'),
      startTime: format(slotInfo.start, 'HH:mm'),
      endTime: format(slotInfo.end, 'HH:mm'),
      students: [],
    });
    setCreateModalOpen(true);
  };

  const handleCreateFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, selectedOptions } = e.target as HTMLInputElement & HTMLSelectElement;
    if (name === 'students') {
      const values = Array.from(selectedOptions).map(opt => opt.value);
      setCreateForm((prev: any) => ({ ...prev, students: values }));
    } else {
      setCreateForm((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  const saveCreate = async () => {
    setCreating(true);
    await fetch('http://localhost:5000/api/class/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        title: createForm.title,
        course: createForm.course,
        teacherId: user?.id,
        students: createForm.students,
        date: createForm.date,
        startTime: createForm.startTime,
        endTime: createForm.endTime
      })
    });
    setCreating(false);
    setCreateModalOpen(false);
  };

  return (
    <div style={{background:'#23232b',color:'#fff',borderRadius:12,padding:'1.5rem',marginBottom:'1.5rem',boxShadow:'0 2px 12px #0002',maxWidth:1100}}>
      <h3>Class Calendar</h3>
      {loading ? <p>Loading calendar...</p> : (
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500, background: '#18181b', color: '#fff', borderRadius: 8 }}
          eventPropGetter={() => ({ style: { background: '#2563eb', color: '#fff', borderRadius: 6 } })}
          views={['month', 'week', 'day', 'agenda']}
          popup
          tooltipAccessor={event => `${event.title}\nStudents: ${event.students.map((s: any) => s.firstName + ' ' + s.lastName).join(', ')}`}
          onSelectEvent={onSelectEvent}
          selectable
          onSelectSlot={onSelectSlot}
        />
      )}
      {modalOpen && editClass && (
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.5)',zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{background:'#23232b',color:'#fff',borderRadius:12,padding:'2rem',minWidth:320,maxWidth:400}}>
            <h4>Edit Class</h4>
            <div style={{marginBottom:'1rem'}}>
              <label>Title<br/>
                <input name="title" value={form.title} onChange={handleFormChange} style={{width:'100%',padding:'0.5rem',borderRadius:6,border:'1px solid #444',background:'#18181b',color:'#fff'}} />
              </label>
            </div>
            <div style={{marginBottom:'1rem'}}>
              <label>Course<br/>
                <input name="course" value={form.course} onChange={handleFormChange} style={{width:'100%',padding:'0.5rem',borderRadius:6,border:'1px solid #444',background:'#18181b',color:'#fff'}} />
              </label>
            </div>
            <div style={{marginBottom:'1rem'}}>
              <label>Date<br/>
                <input name="date" type="date" value={form.date} onChange={handleFormChange} style={{width:'100%',padding:'0.5rem',borderRadius:6,border:'1px solid #444',background:'#18181b',color:'#fff'}} />
              </label>
            </div>
            <div style={{marginBottom:'1rem',display:'flex',gap:'1rem'}}>
              <label style={{flex:1}}>Start Time<br/>
                <input name="startTime" value={form.startTime} onChange={handleFormChange} style={{width:'100%',padding:'0.5rem',borderRadius:6,border:'1px solid #444',background:'#18181b',color:'#fff'}} />
              </label>
              <label style={{flex:1}}>End Time<br/>
                <input name="endTime" value={form.endTime} onChange={handleFormChange} style={{width:'100%',padding:'0.5rem',borderRadius:6,border:'1px solid #444',background:'#18181b',color:'#fff'}} />
              </label>
            </div>
            <div style={{marginBottom:'1rem'}}>
              <label>Students<br/>
                <select name="students" multiple value={form.students} onChange={handleFormChange} style={{width:'100%',padding:'0.5rem',borderRadius:6,border:'1px solid #444',background:'#18181b',color:'#fff',minHeight:80}}>
                  {students.map(s => (
                    <option key={s._id} value={s._id}>{s.firstName} {s.lastName} ({s.email})</option>
                  ))}
                </select>
              </label>
            </div>
            <div style={{display:'flex',gap:'1rem',marginTop:'1.5rem'}}>
              <button onClick={saveEdit} disabled={saving} style={{background:'#22c55e',color:'#fff',border:'none',borderRadius:6,padding:'0.7rem 1.5rem',fontWeight:600,cursor:'pointer'}}>{saving ? 'Saving...' : 'Save'}</button>
              <button onClick={() => setModalOpen(false)} style={{background:'#ef4444',color:'#fff',border:'none',borderRadius:6,padding:'0.7rem 1.5rem',fontWeight:600,cursor:'pointer'}}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {createModalOpen && (
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.5)',zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{background:'#23232b',color:'#fff',borderRadius:12,padding:'2rem',minWidth:320,maxWidth:400}}>
            <h4>Create Class</h4>
            <div style={{marginBottom:'1rem'}}>
              <label>Title<br/>
                <input name="title" value={createForm.title} onChange={handleCreateFormChange} style={{width:'100%',padding:'0.5rem',borderRadius:6,border:'1px solid #444',background:'#18181b',color:'#fff'}} />
              </label>
            </div>
            <div style={{marginBottom:'1rem'}}>
              <label>Course<br/>
                <input name="course" value={createForm.course} onChange={handleCreateFormChange} style={{width:'100%',padding:'0.5rem',borderRadius:6,border:'1px solid #444',background:'#18181b',color:'#fff'}} />
              </label>
            </div>
            <div style={{marginBottom:'1rem'}}>
              <label>Date<br/>
                <input name="date" type="date" value={createForm.date} onChange={handleCreateFormChange} style={{width:'100%',padding:'0.5rem',borderRadius:6,border:'1px solid #444',background:'#18181b',color:'#fff'}} />
              </label>
            </div>
            <div style={{marginBottom:'1rem',display:'flex',gap:'1rem'}}>
              <label style={{flex:1}}>Start Time<br/>
                <input name="startTime" value={createForm.startTime} onChange={handleCreateFormChange} style={{width:'100%',padding:'0.5rem',borderRadius:6,border:'1px solid #444',background:'#18181b',color:'#fff'}} />
              </label>
              <label style={{flex:1}}>End Time<br/>
                <input name="endTime" value={createForm.endTime} onChange={handleCreateFormChange} style={{width:'100%',padding:'0.5rem',borderRadius:6,border:'1px solid #444',background:'#18181b',color:'#fff'}} />
              </label>
            </div>
            <div style={{marginBottom:'1rem'}}>
              <label>Students<br/>
                <select name="students" multiple value={createForm.students} onChange={handleCreateFormChange} style={{width:'100%',padding:'0.5rem',borderRadius:6,border:'1px solid #444',background:'#18181b',color:'#fff',minHeight:80}}>
                  {students.map(s => (
                    <option key={s._id} value={s._id}>{s.firstName} {s.lastName} ({s.email})</option>
                  ))}
                </select>
              </label>
            </div>
            <div style={{display:'flex',gap:'1rem',marginTop:'1.5rem'}}>
              <button onClick={saveCreate} disabled={creating} style={{background:'#22c55e',color:'#fff',border:'none',borderRadius:6,padding:'0.7rem 1.5rem',fontWeight:600,cursor:'pointer'}}>{creating ? 'Saving...' : 'Create'}</button>
              <button onClick={() => setCreateModalOpen(false)} style={{background:'#ef4444',color:'#fff',border:'none',borderRadius:6,padding:'0.7rem 1.5rem',fontWeight:600,cursor:'pointer'}}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherCalendar; 