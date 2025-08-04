import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { API_ENDPOINTS } from '../../config/api';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

interface Student {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

interface ClassEvent {
  _id: string;
  title: string;
  course: string;
  start: Date;
  end: Date;
  students: Student[];
}

const TeacherCalendar: React.FC = () => {
  const { user, token } = useAuth();
  const [events, setEvents] = useState<ClassEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editClass, setEditClass] = useState<ClassEvent | null>(null);
  const [form, setForm] = useState<any>({});
  const [students, setStudents] = useState<Student[]>([]);
  const [saving, setSaving] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState<any>({});
  const [creating, setCreating] = useState(false);

  // Safe user check
  const userId = user?.id;
  const userCourse = user?.course;

  useEffect(() => {
    if (!userId || !token) return;
    
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`${API_ENDPOINTS.CLASSES}/teacher/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch classes: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (Array.isArray(data)) {
          const formattedEvents = data.map(cls => ({
            _id: cls._id,
            title: cls.title || 'Untitled Class',
            course: cls.course || 'Unknown Course',
            start: new Date(cls.date + 'T' + (cls.startTime || '00:00')),
            end: new Date(cls.date + 'T' + (cls.endTime || '01:00')),
            students: Array.isArray(cls.students) ? cls.students.filter(s => s && s._id) : [],
          }));
          setEvents(formattedEvents);
        } else {
          setEvents([]);
        }
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load calendar events');
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [userId, token, modalOpen]);

  useEffect(() => {
    if (!token) return;
    
    const fetchStudents = async () => {
      try {
        const response = await fetch(`${API_ENDPOINTS.EXAM_RESULTS}/students`, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        
        if (response.ok) {
          const data = await response.json();
          const validStudents = Array.isArray(data) ? data.filter(s => s && s._id) : [];
          setStudents(validStudents);
        } else {
          setStudents([]);
        }
      } catch (err) {
        console.error('Error fetching students:', err);
        setStudents([]);
      }
    };

    fetchStudents();
  }, [token]);

  const onSelectEvent = (event: ClassEvent) => {
    setEditClass(event);
    setForm({
      title: event.title,
      course: event.course,
      date: format(event.start, 'yyyy-MM-dd'),
      startTime: format(event.start, 'HH:mm'),
      endTime: format(event.end, 'HH:mm'),
      students: event.students?.map(s => s._id) || [],
    });
    setModalOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, selectedOptions } = e.target as HTMLInputElement & HTMLSelectElement;
    if (name === 'students') {
      const values = Array.from(selectedOptions).map(opt => opt.value);
      setForm((prev: any) => ({ ...prev, students: values }));
    } else {
      setForm((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  const saveEdit = async () => {
    if (!editClass || !userId || !token) return;
    
    setSaving(true);
    try {
      const response = await fetch(`${API_ENDPOINTS.CLASSES}/${editClass._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: form.title,
          course: form.course,
          date: form.date,
          startTime: form.startTime,
          endTime: form.endTime,
          students: form.students,
          teacher: userId
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update class');
      }
      
      setModalOpen(false);
    } catch (err) {
      console.error('Error saving edit:', err);
      setError('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const onSelectSlot = (slotInfo: any) => {
    setCreateForm({
      title: '',
      course: userCourse || '',
      date: format(slotInfo.start, 'yyyy-MM-dd'),
      startTime: format(slotInfo.start, 'HH:mm'),
      endTime: format(slotInfo.end, 'HH:mm'),
      students: [],
    });
    setCreateModalOpen(true);
  };

  const handleCreateFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, selectedOptions } = e.target as HTMLInputElement & HTMLSelectElement;
    if (name === 'students') {
      const values = Array.from(selectedOptions).map(opt => opt.value);
      setCreateForm((prev: any) => ({ ...prev, students: values }));
    } else {
      setCreateForm((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  const saveCreate = async () => {
    if (!userId || !token) return;
    
    setCreating(true);
    try {
      const response = await fetch(`${API_ENDPOINTS.PUBLISH_CLASS}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: createForm.title,
          course: createForm.course,
          teacherId: userId,
          students: createForm.students,
          date: createForm.date,
          startTime: createForm.startTime,
          endTime: createForm.endTime
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to create class');
      }
      
      setCreateModalOpen(false);
    } catch (err) {
      console.error('Error creating class:', err);
      setError('Failed to create class');
    } finally {
      setCreating(false);
    }
  };

  const getStudentNames = (students: Student[]) => {
    if (!Array.isArray(students) || students.length === 0) {
      return 'No students';
    }
    
    const validStudents = students.filter(s => s && s._id);
    if (validStudents.length === 0) {
      return 'No students';
    }
    
    return validStudents.map(s => {
      const firstName = s?.firstName || 'Unknown';
      const lastName = s?.lastName || 'Student';
      return `${firstName} ${lastName}`;
    }).join(', ');
  };

  if (error) {
    return (
      <div style={{background:'#23232b',color:'#fff',borderRadius:12,padding:'1.5rem',marginBottom:'1.5rem',boxShadow:'0 2px 12px #0002',maxWidth:1100}}>
        <h3>Class Calendar</h3>
        <div style={{ color: '#ef4444', textAlign: 'center', padding: '2rem' }}>
          {error}
          <button 
            onClick={() => window.location.reload()} 
            style={{
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              marginTop: '1rem'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{background:'#23232b',color:'#fff',borderRadius:12,padding:'1.5rem',marginBottom:'1.5rem',boxShadow:'0 2px 12px #0002',maxWidth:1100}}>
      <h3>Class Calendar</h3>
      {loading ? (
        <p>Loading calendar...</p>
      ) : (
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500, background: '#18181b', color: '#fff', borderRadius: 8 }}
          eventPropGetter={() => ({ style: { background: '#2563eb', color: '#fff', borderRadius: 6 } })}
          views={['month', 'week', 'day', 'agenda']}
          popup
          tooltipAccessor={event => `${event.title}\nStudents: ${getStudentNames(event.students)}`}
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
                  {students?.filter(s => s && s._id)?.map(s => (
                    <option key={s._id} value={s._id}>
                      {s?.firstName || 'Unknown'} {s?.lastName || 'Student'} ({s?.email || 'No email'})
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div style={{display:'flex',gap:'1rem',marginTop:'1.5rem'}}>
              <button onClick={saveEdit} disabled={saving} style={{background:'#22c55e',color:'#fff',border:'none',borderRadius:6,padding:'0.7rem 1.5rem',fontWeight:600,cursor:'pointer'}}>
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button onClick={() => setModalOpen(false)} style={{background:'#ef4444',color:'#fff',border:'none',borderRadius:6,padding:'0.7rem 1.5rem',fontWeight:600,cursor:'pointer'}}>
                Cancel
              </button>
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
                  {students?.filter(s => s && s._id)?.map(s => (
                    <option key={s._id} value={s._id}>
                      {s?.firstName || 'Unknown'} {s?.lastName || 'Student'} ({s?.email || 'No email'})
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div style={{display:'flex',gap:'1rem',marginTop:'1.5rem'}}>
              <button onClick={saveCreate} disabled={creating} style={{background:'#22c55e',color:'#fff',border:'none',borderRadius:6,padding:'0.7rem 1.5rem',fontWeight:600,cursor:'pointer'}}>
                {creating ? 'Saving...' : 'Create'}
              </button>
              <button onClick={() => setCreateModalOpen(false)} style={{background:'#ef4444',color:'#fff',border:'none',borderRadius:6,padding:'0.7rem 1.5rem',fontWeight:600,cursor:'pointer'}}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherCalendar; 