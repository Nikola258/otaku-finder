import Sidebar from './Sidebar';
import '../css/AppLayout.css';

function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-layout__content">{children}</div>
    </div>
  );
}

export default AppLayout;
