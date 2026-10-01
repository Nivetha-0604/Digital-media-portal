import { Routes, Route, NavLink, Link, useNavigate } from 'react-router-dom';
import { getUser } from './api';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Upload from './pages/Upload';
import Watch from './pages/Watch';
import Admin from './pages/Admin';
import Dashboard from './pages/Dashboard';
import Favorites from './pages/Favorites';

export default function App() {
  const user = getUser();
  const nav = useNavigate();
  const isCreator = user && ['creator', 'admin'].includes(user.role);
  const logout = () => { localStorage.clear(); nav('/'); window.location.reload(); };
  return (
    <>
      <header className="nav">
        <Link to="/" className="brand">▶ MediaPortal</Link>
        <nav>
          <NavLink to="/">Home</NavLink>
          {user && <NavLink to="/favorites">Favorites</NavLink>}
          {isCreator && <NavLink to="/dashboard">My Uploads</NavLink>}
          {isCreator && <NavLink to="/upload">+ Upload</NavLink>}
          {user?.role === 'admin' && <NavLink to="/admin">Admin</NavLink>}
          {user ? <><span className="who">{user.name} <em>{user.role}</em></span><button onClick={logout}>Logout</button></>
                : <NavLink to="/auth">Login / Register</NavLink>}
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/watch/:id" element={<Watch />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
    </>
  );
}
