import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_ENDPOINTS } from '../../config/api';

interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface FriendRequest extends Student {}
interface Friend extends Student {}

interface Message {
  _id: string;
  sender: string;
  recipient: string;
  content: string;
  createdAt: string;
}

const Friends: React.FC = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState<'all' | 'requests' | 'friends'>('all');
  const [students, setStudents] = useState<Student[]>([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatFriend, setChatFriend] = useState<Friend | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([
      fetch(`${API_ENDPOINTS.FRIENDS_ALL}`).then(res => res.json()),
      fetch(`${API_ENDPOINTS.FRIENDS_REQUESTS}/${user.id}`).then(res => res.json()),
      fetch(`${API_ENDPOINTS.FRIENDS_FRIENDS}/${user.id}`).then(res => res.json())
    ])
      .then(([allUsers, requests, friends]) => {
        setStudents(allUsers.filter((s: Student) => s._id !== user.id));
        setRequests(requests);
        setFriends(friends);
      })
      .catch(err => console.error('Error fetching data:', err))
      .finally(() => setLoading(false));
  }, [user]);

  const filteredStudents = students.filter(s =>
    s.firstName.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.lastName.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.email.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const sendRequest = async (toId: string) => {
    if (!user) return;
    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch(API_ENDPOINTS.FRIENDS_REQUEST, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromId: user.id, toId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send request.');
      setSuccess('Friend request sent!');
      // Refresh data
      const [allUsers, requests, friends] = await Promise.all([
        fetch(API_ENDPOINTS.FRIENDS_ALL).then(res => res.json()),
        fetch(`${API_ENDPOINTS.FRIENDS_REQUESTS}/${user?.id}`).then(res => res.json()),
        fetch(`${API_ENDPOINTS.FRIENDS_FRIENDS}/${user?.id}`).then(res => res.json())
      ]);
      setStudents(allUsers.filter((s: Student) => s._id !== user.id));
      setRequests(requests);
      setFriends(friends);
    } catch (err: any) {
      setError(err.message || 'Failed to send request.');
    } finally {
      setActionLoading(false);
    }
  };

  const acceptRequest = async (fromId: string) => {
    if (!user) return;
    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch(API_ENDPOINTS.FRIENDS_ACCEPT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, fromId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to accept request.');
      setSuccess('Friend request accepted!');
      // Refresh data
      const [allUsers, requests, friends] = await Promise.all([
        fetch(API_ENDPOINTS.FRIENDS_ALL).then(res => res.json()),
        fetch(`${API_ENDPOINTS.FRIENDS_REQUESTS}/${user?.id}`).then(res => res.json()),
        fetch(`${API_ENDPOINTS.FRIENDS_FRIENDS}/${user?.id}`).then(res => res.json())
      ]);
      setStudents(allUsers.filter((s: Student) => s._id !== user.id));
      setRequests(requests);
      setFriends(friends);
    } catch (err: any) {
      setError(err.message || 'Failed to accept request.');
    } finally {
      setActionLoading(false);
    }
  };

  const rejectRequest = async (fromId: string) => {
    if (!user) return;
    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch(API_ENDPOINTS.FRIENDS_REJECT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, fromId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to reject request.');
      setSuccess('Friend request rejected!');
      // Refresh data
      const [allUsers, requests, friends] = await Promise.all([
        fetch(API_ENDPOINTS.FRIENDS_ALL).then(res => res.json()),
        fetch(`${API_ENDPOINTS.FRIENDS_REQUESTS}/${user?.id}`).then(res => res.json()),
        fetch(`${API_ENDPOINTS.FRIENDS_FRIENDS}/${user?.id}`).then(res => res.json())
      ]);
      setStudents(allUsers.filter((s: Student) => s._id !== user.id));
      setRequests(requests);
      setFriends(friends);
    } catch (err: any) {
      setError(err.message || 'Failed to reject request.');
    } finally {
      setActionLoading(false);
    }
  };

  // Messaging
  const openChat = async (friend: Friend) => {
    setChatFriend(friend);
    setMessages([]);
    setLoading(true);
    try {
      const res = await fetch(`${API_ENDPOINTS.MESSAGES_USER}/${user?.id}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(Array.isArray(data) ? data.filter((m: Message) =>
          (m.sender === user?.id && m.recipient === friend._id) ||
          (m.sender === friend._id && m.recipient === user?.id)
        ) : []);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!user || !chatFriend || !newMessage.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`${API_ENDPOINTS.MESSAGES_USER}/${user?.id}`);
      if (res.ok) {
        const conversation = await res.json();
        const conversationId = conversation._id;
        
        await fetch(API_ENDPOINTS.MESSAGES, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationId,
            senderId: user?.id,
            receiverId: chatFriend._id,
            content: newMessage
          })
        });
        
        setNewMessage('');
        setSuccess('Message sent!');
        openChat(chatFriend);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{background:'#23232b',color:'#fff',borderRadius:12,padding:'1.5rem',marginBottom:'1.5rem',boxShadow:'0 2px 12px #0002',maxWidth:900}}>
      <h3>Friends</h3>
      <div style={{display:'flex',gap:'1rem',marginBottom:'1rem'}}>
        <button onClick={() => setTab('all')} style={{background:tab==='all'?'#2563eb':'#18181b',color:'#fff',border:'none',borderRadius:6,padding:'0.5rem 1.5rem',fontWeight:600,cursor:'pointer'}}>All Students</button>
        <button onClick={() => setTab('requests')} style={{background:tab==='requests'?'#2563eb':'#18181b',color:'#fff',border:'none',borderRadius:6,padding:'0.5rem 1.5rem',fontWeight:600,cursor:'pointer'}}>Requests</button>
        <button onClick={() => setTab('friends')} style={{background:tab==='friends'?'#2563eb':'#18181b',color:'#fff',border:'none',borderRadius:6,padding:'0.5rem 1.5rem',fontWeight:600,cursor:'pointer'}}>Friends</button>
      </div>
      {error && <div style={{color:'#ef4444',marginBottom:'0.7rem'}}>{error}</div>}
      {success && <div style={{color:'#22c55e',marginBottom:'0.7rem'}}>{success}</div>}
      {tab === 'all' && (
        <div>
          <input type="text" placeholder="Search students..." value={studentSearch} onChange={e => setStudentSearch(e.target.value)} style={{width:'100%',padding:'0.5rem',borderRadius:6,border:'1px solid #444',background:'#18181b',color:'#fff',marginBottom:'1rem'}} />
          {loading ? <p>Loading...</p> : (
            <ul style={{paddingLeft:0,listStyle:'none'}}>
              {filteredStudents.map(s => (
                <li key={s._id} style={{marginBottom:'0.7rem',background:'#18181b',borderRadius:8,padding:'0.7rem',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <span>{s.firstName} {s.lastName} ({s.email})</span>
                  <button onClick={() => sendRequest(s._id)} disabled={actionLoading} style={{background:'#2563eb',color:'#fff',border:'none',borderRadius:6,padding:'0.3rem 1rem',fontWeight:600,cursor:'pointer'}}>Send Request</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {tab === 'requests' && (
        <div>
          {loading ? <p>Loading...</p> : (
            <ul style={{paddingLeft:0,listStyle:'none'}}>
              {requests.map(r => (
                <li key={r._id} style={{marginBottom:'0.7rem',background:'#18181b',borderRadius:8,padding:'0.7rem',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <span>{r.firstName} {r.lastName} ({r.email})</span>
                  <span>
                    <button onClick={() => acceptRequest(r._id)} disabled={actionLoading} style={{background:'#22c55e',color:'#fff',border:'none',borderRadius:6,padding:'0.3rem 1rem',fontWeight:600,cursor:'pointer',marginRight:8}}>Accept</button>
                    <button onClick={() => rejectRequest(r._id)} disabled={actionLoading} style={{background:'#ef4444',color:'#fff',border:'none',borderRadius:6,padding:'0.3rem 1rem',fontWeight:600,cursor:'pointer'}}>Reject</button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {tab === 'friends' && (
        <div>
          {loading ? <p>Loading...</p> : (
            <ul style={{paddingLeft:0,listStyle:'none'}}>
              {friends.map(f => (
                <li key={f._id} style={{marginBottom:'0.7rem',background:'#18181b',borderRadius:8,padding:'0.7rem',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <span>{f.firstName} {f.lastName} ({f.email})</span>
                  <button onClick={() => openChat(f)} style={{background:'#2563eb',color:'#fff',border:'none',borderRadius:6,padding:'0.3rem 1rem',fontWeight:600,cursor:'pointer'}}>Message</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {chatFriend && (
        <div style={{marginTop:'2rem',background:'#18181b',borderRadius:8,padding:'1rem'}}>
          <h4>Chat with {chatFriend.firstName} {chatFriend.lastName}</h4>
          <div style={{maxHeight:200,overflowY:'auto',marginBottom:'1rem',background:'#23232b',padding:'0.7rem',borderRadius:6}}>
            {messages.length === 0 ? <p>No messages yet.</p> : messages.map(m => (
              <div key={m._id} style={{marginBottom:'0.5rem',textAlign:m.sender===user?.id?'right':'left'}}>
                <span style={{background:m.sender===user?.id?'#2563eb':'#444',color:'#fff',padding:'0.4rem 1rem',borderRadius:6,display:'inline-block'}}>{m.content}</span>
                <div style={{fontSize:'0.8em',color:'#60a5fa'}}>{new Date(m.createdAt).toLocaleString()}</div>
              </div>
            ))}
          </div>
          <div style={{display:'flex',gap:'0.5rem'}}>
            <input value={newMessage} onChange={e => setNewMessage(e.target.value)} style={{flex:1,padding:'0.5rem',borderRadius:6,border:'1px solid #444',background:'#23232b',color:'#fff'}} placeholder="Type a message..." />
            <button onClick={sendMessage} disabled={sending || !newMessage.trim()} style={{background:'#22c55e',color:'#fff',border:'none',borderRadius:6,padding:'0.5rem 1.5rem',fontWeight:600,cursor:'pointer'}}>Send</button>
            <button onClick={() => setChatFriend(null)} style={{background:'#ef4444',color:'#fff',border:'none',borderRadius:6,padding:'0.5rem 1.5rem',fontWeight:600,cursor:'pointer'}}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Friends; 