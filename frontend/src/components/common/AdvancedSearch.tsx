import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

interface SearchResult {
  id: string;
  type: 'user' | 'course' | 'class';
  title: string;
  subtitle: string;
  data: any;
}

interface AdvancedSearchProps {
  userRole: string;
  onResultSelect?: (result: SearchResult) => void;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ userRole, onResultSelect }) => {
  const { user } = useAuth();
  const token = localStorage.getItem('token');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'users' | 'courses' | 'classes'>('all');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const searchData = async () => {
      if (searchTerm.length < 2) {
        setResults([]);
        setShowResults(false);
        return;
      }

      setLoading(true);
      try {
        const searchResults: SearchResult[] = [];

        // Search users (students/teachers)
        if (searchType === 'all' || searchType === 'users') {
          if (userRole === 'admin') {
            const studentsResponse = await fetch(`http://localhost:5000/api/auth/students?search=${searchTerm}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const studentsData = await studentsResponse.json();
            if (Array.isArray(studentsData)) {
              studentsData.forEach((student: any) => {
                searchResults.push({
                  id: student._id,
                  type: 'user',
                  title: `${student.firstName} ${student.lastName}`,
                  subtitle: `Student - ${student.course} (Level ${student.level})`,
                  data: student
                });
              });
            }

            const teachersResponse = await fetch(`http://localhost:5000/api/auth/teachers?search=${searchTerm}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const teachersData = await teachersResponse.json();
            if (Array.isArray(teachersData)) {
              teachersData.forEach((teacher: any) => {
                searchResults.push({
                  id: teacher._id,
                  type: 'user',
                  title: `${teacher.firstName} ${teacher.lastName}`,
                  subtitle: `Teacher - ${teacher.course}`,
                  data: teacher
                });
              });
            }
          }
        }

        // Search courses
        if (searchType === 'all' || searchType === 'courses') {
          let coursesEndpoint = `http://localhost:5000/api/course?search=${searchTerm}`;
          if (userRole === 'teacher') {
            coursesEndpoint = `http://localhost:5000/api/course/published?search=${searchTerm}`;
          }
          
          const coursesResponse = await fetch(coursesEndpoint, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const coursesData = await coursesResponse.json();
          if (Array.isArray(coursesData)) {
            coursesData.forEach((course: any) => {
              searchResults.push({
                id: course._id,
                type: 'course',
                title: course.name,
                subtitle: `${course.description} - ${userRole === 'teacher' ? 'Published' : (course.published ? 'Published' : 'Draft')}`,
                data: course
              });
            });
          }
        }

        // Search classes
        if (searchType === 'all' || searchType === 'classes') {
          const classesResponse = await fetch(`http://localhost:5000/api/class?search=${searchTerm}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const classesData = await classesResponse.json();
          if (Array.isArray(classesData)) {
            classesData.forEach((cls: any) => {
              searchResults.push({
                id: cls._id,
                type: 'class',
                title: cls.title || cls.name,
                subtitle: `${cls.course} - ${cls.teacher ? cls.teacher.firstName + ' ' + cls.teacher.lastName : 'No teacher'}`,
                data: cls
              });
            });
          }
        }

        setResults(searchResults);
        setShowResults(true);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchData, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, searchType, userRole, token]);

  const handleResultClick = (result: SearchResult) => {
    if (onResultSelect) {
      onResultSelect(result);
    }
    setShowResults(false);
    setSearchTerm('');
  };

  const getSearchIcon = (type: string) => {
    switch (type) {
      case 'user': return '👤';
      case 'course': return '📚';
      case 'class': return '🏫';
      default: return '🔍';
    }
  };

  return (
    <div className="advanced-search-container">
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Search users, courses, or classes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '0.7rem',
            border: '1px solid #3f3f46',
            borderRadius: '6px',
            background: '#18181b',
            color: '#fff',
            fontSize: '1rem'
          }}
        />
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value as any)}
          style={{
            padding: '0.5rem',
            border: '1px solid #3f3f46',
            borderRadius: '6px',
            background: '#18181b',
            color: '#fff',
            fontSize: '0.9rem'
          }}
        >
          <option value="all">All</option>
          <option value="users">Users</option>
          <option value="courses">Courses</option>
          <option value="classes">Classes</option>
        </select>
      </div>

      {loading && <div style={{ color: '#9ca3af', textAlign: 'center', padding: '1rem' }}>Searching...</div>}
      
      {showResults && results.length > 0 && (
        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {results.map((result) => (
            <div
              key={result.id}
              onClick={() => handleResultClick(result)}
              style={{
                padding: '0.8rem',
                border: '1px solid #3f3f46',
                borderRadius: '6px',
                marginBottom: '0.5rem',
                cursor: 'pointer',
                background: '#2a2a32'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.2rem' }}>{getSearchIcon(result.type)}</span>
                <div>
                  <div style={{ fontWeight: '600', color: '#fff' }}>{result.title}</div>
                  <div style={{ fontSize: '0.9rem', color: '#9ca3af' }}>{result.subtitle}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {showResults && results.length === 0 && !loading && (
        <div style={{ color: '#9ca3af', textAlign: 'center', padding: '1rem' }}>
          No results found
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch; 