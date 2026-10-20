import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useProgress } from '../context/ProgressContext.jsx';
import Flame from './Flame.jsx';

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/sheet', label: 'A2Z Sheet' },
  { to: '/prep', label: 'Interview Prep' },
  { to: '/resources', label: 'Resources' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { stats } = useProgress();

  return (
    <header className="top">
      <div className="wrap top-inner">
        <div className="brand">
          <span className="bow" aria-hidden="true">♥</span>
          <span>A2Z Journey</span>
        </div>
        <div className="chipstreak" title="Current streak">
          <Flame size={16} />
          <span className="num">{stats?.streak ?? 0}</span>
          <span className="muted">day streak</span>
        </div>
        <nav className="tabs" aria-label="Sections">
          {LINKS.map((l) => (
            // NavLink adds the "active" class automatically on the current page
            <NavLink key={l.to} to={l.to} end={l.end} className="tab">
              {l.label}
            </NavLink>
          ))}
        </nav>
        <button className="btn ghost" onClick={logout} title={`Logged in as ${user.email}`}>
          Log out
        </button>
      </div>
    </header>
  );
}
