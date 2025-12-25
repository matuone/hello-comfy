import AdminSidebar from "../components/AdminSidebar";
import "../styles/adminpanel.css";

export default function AdminLayout({ children }) {
  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard-layout">
        <AdminSidebar />
        <main className="admin-dashboard-content">{children}</main>
      </div>
    </div>
  );
}
