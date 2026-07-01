import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from './context/AuthContext';
import api from './api/axios';
import './App.css';

function App() {
  const { user, login, logout, loading } = useContext(AuthContext);
  const [isRegistering, setIsRegistering] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'todo', 'in-progress', 'completed'
  
  // Auth Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [authError, setAuthError] = useState('');

  // Task Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const [priority, setPriority] = useState('medium');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Load tasks on login
  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      const res = await api.get('/task');
      setTasks(res.data.data);
    } catch (err) {
      console.error('Error fetching tasks', err);
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      if (isRegistering) {
        // Register API call
        await api.post('/auth/register', { name, email, password, role });
        // Automatically login the user upon registration
        await login(email, password);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
    }
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    try {
      if (editingTaskId) {
        await api.put(`/task/${editingTaskId}`, { title, description, status, priority });
        setEditingTaskId(null);
      } else {
        await api.post('/task', { title, description, status, priority });
      }
      // Reset task fields
      setTitle('');
      setDescription('');
      setStatus('todo');
      setPriority('medium');
      fetchTasks();
    } catch (err) {
      console.error('Error saving task', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditClick = (task) => {
    setEditingTaskId(task._id);
    setTitle(task.title);
    setDescription(task.description);
    setStatus(task.status);
    setPriority(task.priority);
  };

  const handleDeleteTask = async (id) => {
    try {
      await api.delete(`/task/${id}`);
      fetchTasks();
    } catch (err) {
      console.error('Error deleting task', err);
    }
  };

  const cancelEdit = () => {
    setEditingTaskId(null);
    setTitle('');
    setDescription('');
    setStatus('todo');
    setPriority('medium');
  };

  // Helper counters for metrics
  const totalTasksCount = tasks.length;
  const completedTasksCount = tasks.filter(t => t.status === 'completed').length;
  const highPriorityCount = tasks.filter(t => t.priority === 'high').length;
  const completionRate = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  // Filter tasks list based on current filter selection
  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#0b0f19',
        color: '#64748b'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid rgba(59, 130, 246, 0.1)',
          borderTopColor: '#3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '1rem'
        }}></div>
        <p style={{ fontWeight: '500', fontSize: '0.95rem' }}>Synchronizing session context...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Render Login / Register Form if not logged in
  if (!user) {
    return (
      <div className="auth-wrapper">
        <div className="auth-card">
          <div className="auth-header">
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem', marginBottom: '1.5rem' }}>
              <div className="brand-dot"></div>
              <span style={{ fontSize: '1.1rem', fontWeight: '800', letterSpacing: '2px', color: '#fff' }}>PRIMETRADER</span>
            </div>
            <h2>{isRegistering ? 'Initialize Account' : 'Welcome Back'}</h2>
            <p>{isRegistering ? 'Setup your developer credential' : 'Secure API authorization portal'}</p>
          </div>

          {authError && <div className="auth-alert">{authError}</div>}

          <form onSubmit={handleAuthSubmit}>
            {isRegistering && (
              <div className="form-group">
                <label>Developer Name</label>
                <input
                  type="text"
                  className="input-ctrl"
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}
            <div className="form-group">
              <label>System Email Address</label>
              <input
                type="email"
                className="input-ctrl"
                placeholder="name@primetrader.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Access Key Password</label>
              <input
                type="password"
                className="input-ctrl"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {isRegistering && (
              <div className="form-group">
                <label>System Authorization Role</label>
                <select className="input-ctrl" value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="user">User (Own tasks only)</option>
                  <option value="admin">System Administrator (Global access)</option>
                </select>
              </div>
            )}
            <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>
              {isRegistering ? 'Register Credential' : 'Secure Authorization'}
            </button>
          </form>

          <p className="auth-switch">
            {isRegistering ? 'Return to authentication?' : "Don't have access?"}{' '}
            <span onClick={() => setIsRegistering(!isRegistering)}>
              {isRegistering ? 'Log In' : 'Sign Up'}
            </span>
          </p>
        </div>
      </div>
    );
  }

  // Render Main Dashboard when logged in
  return (
    <div className="app-container">
      <header className="main-header">
        <div className="brand">
          <div className="brand-dot"></div>
          <h1>Primetrader.ai</h1>
        </div>
        <div className="user-profile">
          <div className="user-avatar">{user.name.charAt(0).toUpperCase()}</div>
          <span style={{ fontSize: '0.9rem', color: '#cbd5e1', fontWeight: '500' }}>
            {user.name} <span style={{ color: '#64748b', fontSize: '0.8rem' }}>({user.role})</span>
          </span>
          <button className="btn-logout" onClick={logout}>
            Log Out
          </button>
        </div>
      </header>

      {/* Metrics Row */}
      <section className="metrics-row">
        <div className="metric-card">
          <div className="metric-icon blue">⚡</div>
          <div className="metric-info">
            <h4>Active Workloads</h4>
            <p>{totalTasksCount}</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon green">📈</div>
          <div className="metric-info">
            <h4>Completion Efficiency</h4>
            <p>{completionRate}%</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon red">🚨</div>
          <div className="metric-info">
            <h4>High Alert Queue</h4>
            <p>{highPriorityCount}</p>
          </div>
        </div>
      </section>

      {/* Main Workspace Layout */}
      <div className="dashboard-grid">
        
        {/* Left Side: Create/Edit Form */}
        <section className="form-panel">
          <h3>{editingTaskId ? 'Modifying Task Payload' : 'Provision New Task'}</h3>
          <form onSubmit={handleTaskSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Task Title</label>
              <input
                type="text"
                className="input-ctrl"
                placeholder="Task definition header"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Task Description</label>
              <textarea
                className="input-ctrl"
                placeholder="Breakdown detailed execution specs"
                rows="4"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                style={{ resize: 'vertical', minHeight: '80px' }}
              />
            </div>
            
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Execution Status</label>
              <select className="input-ctrl" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Urgency Level</label>
              <select className="input-ctrl" value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }} disabled={isSaving}>
              {isSaving ? 'Processing...' : (editingTaskId ? 'Commit Changes' : 'Execute Creation')}
            </button>
            {editingTaskId && (
              <button type="button" className="btn-secondary" onClick={cancelEdit} disabled={isSaving}>
                Discard Edits
              </button>
            )}
          </form>
        </section>

        {/* Right Side: Tasks Board */}
        <section className="board-panel">
          <div className="board-header">
            <h2>Workflow Pipeline</h2>
            <div className="filter-tabs">
              <button className={`filter-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
                All Tasks
              </button>
              <button className={`filter-tab ${filter === 'todo' ? 'active' : ''}`} onClick={() => setFilter('todo')}>
                To Do
              </button>
              <button className={`filter-tab ${filter === 'in-progress' ? 'active' : ''}`} onClick={() => setFilter('in-progress')}>
                In Progress
              </button>
              <button className={`filter-tab ${filter === 'completed' ? 'active' : ''}`} onClick={() => setFilter('completed')}>
                Completed
              </button>
            </div>
          </div>

          {filteredTasks.length === 0 ? (
            <div style={{
              background: 'rgba(30, 41, 59, 0.15)',
              border: '1px dashed rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              padding: '3rem',
              textAlign: 'center',
              color: '#64748b'
            }}>
              🚀 No tasks fit the current execution pipeline filters.
            </div>
          ) : (
            <div className="tasks-grid">
              {filteredTasks.map((task) => (
                <div key={task._id} className="task-card">
                  {/* Visual urgency left strip */}
                  <div className={`priority-strip ${task.priority}`}></div>

                  <div className="task-top">
                    <span className={`tag ${task.status}`}>
                      {task.status.replace('-', ' ')}
                    </span>
                    <span className={`priority-badge ${task.priority}`}>
                      {task.priority.toUpperCase()}
                    </span>
                  </div>

                  <div className="task-body">
                    <h4>{task.title}</h4>
                    <p>{task.description}</p>
                  </div>

                  {user.role === 'admin' && task.owner && (
                    <div className="task-owner">
                      Owner: <strong>{task.owner.name}</strong> <br/>
                      <span style={{ color: '#475569', fontSize: '0.7rem' }}>{task.owner.email}</span>
                    </div>
                  )}

                  <div className="task-actions">
                    <button className="btn-icon" onClick={() => handleEditClick(task)}>
                      Modify
                    </button>
                    <button className="btn-icon delete" onClick={() => handleDeleteTask(task._id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}

export default App;
