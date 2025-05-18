import React, { useEffect, useState } from "react";
import axios from "axios";


const Dashboard = () => {
  const [view, setView] = useState("dashboard");
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (view === "users") {
      axios.get("http://localhost:4000/api/users/getusers")
        .then((res) => setUsers(res.data))
        .catch((err) => console.error(err));
    }
  }, [view]);

  useEffect(() => {
  const fetchPayments = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/payments'); // Adjust URL to your backend
      setTransactions(response.data);
    } catch (err) {
      setError('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  if (view === "transactions") {
    fetchPayments();
  }
}, [view]);

  const stats = [
    { title: "Users", value: "1,245", bg: "#4f46e5" },
    { title: "Revenue", value: "$76,540", bg: "#059669" },
    { title: "Transactions", value: "3,204", bg: "#d97706" },
  ];

  const sidebarStyle = {
    width: "250px",
    backgroundColor: "#111827",
    color: "#fff",
    height: "100vh",
    padding: "30px 20px",
    position: "fixed",
    top: 0,
    left: 0,
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    boxShadow: "2px 0 10px rgba(0,0,0,0.1)",
  };

  const navItemStyle = (active) => ({
    padding: "10px 15px",
    borderRadius: "8px",
    cursor: "pointer",
    backgroundColor: active ? "#374151" : "transparent",
    transition: "0.3s",
  });

  const headerStyle = {
    height: "70px",
    backgroundColor: "#1f2937",
    color: "#fff",
    padding: "0 30px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "fixed",
    top: 0,
    left: "250px",
    right: 0,
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    zIndex: 10,
  };

  const contentWrapperStyle = {
    marginLeft: "250px",
    marginTop: "70px",
    padding: "30px",
    backgroundColor: "#f9fafb",
    minHeight: "100vh",
  };

  const cardStyle = (bgColor) => ({
    backgroundColor: bgColor,
    color: "#fff",
    padding: "20px",
    borderRadius: "16px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
    flex: "1",
    minWidth: "200px",
  });

  const cardContainerStyle = {
    display: "flex",
    gap: "20px",
    marginBottom: "30px",
    flexWrap: "wrap",
  };

  const sectionStyle = {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
    marginBottom: "20px",
  };

  const titleStyle = {
    fontSize: "20px",
    fontWeight: "600",
    marginBottom: "15px",
    color: "#111827",
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
  };

  const thTdStyle = {
    padding: "12px 15px",
    textAlign: "left",
    borderBottom: "1px solid #e5e7eb",
  };

  const thStyle = {
    ...thTdStyle,
    backgroundColor: "#f3f4f6",
    fontWeight: "600",
  };

  return (
    <div>
      {/* Sidebar */}
      <div style={sidebarStyle}>
        <h2 style={{ fontSize: "22px", marginBottom: "40px" }}>Admin Panel</h2>
        <div style={navItemStyle(view === "dashboard")} onClick={() => setView("dashboard")}>📊 Dashboard</div>
        <div style={navItemStyle(view === "users")} onClick={() => setView("users")}>👥 Users</div>
        <div style={navItemStyle(view === "transactions")} onClick={() => setView("transactions")}>💳 Transactions</div>
        <div style={navItemStyle(false)}>⚙️ Settings</div>
        <div style={navItemStyle(false)}>🚪 Logout</div>
      </div>

      {/* Header */}
      <div style={headerStyle}>
        <h1 style={{ fontSize: "20px" }}>Welcome Back, Admin</h1>
        <div>🔔 🔍 👤</div>
      </div>

      {/* Main Content */}
      <div style={contentWrapperStyle}>
        {view === "dashboard" && (
          <>
            <div style={cardContainerStyle}>
              {stats.map((stat) => (
                <div key={stat.title} style={cardStyle(stat.bg)}>
                  <h4 style={{ fontSize: "18px", marginBottom: "10px" }}>{stat.title}</h4>
                  <p style={{ fontSize: "24px", fontWeight: "bold" }}>{stat.value}</p>
                </div>
              ))}
            </div>
            <div style={sectionStyle}>
              <h3 style={titleStyle}>Recent Transactions</h3>
              <ul>
                <li>💳 $250 from John Doe - Completed</li>
                <li>💳 $1,200 from Jane Smith - Pending</li>
                <li>💳 $300 from Alex Johnson - Failed</li>
              </ul>
            </div>
          </>
        )}

        {view === "users" && (
          <div style={sectionStyle}>
            <h3 style={titleStyle}>All Users</h3>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>Username</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Role</th>
                  <th style={thStyle}>Created At</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td style={thTdStyle}>{user.id}</td>
                    <td style={thTdStyle}>{user.username}</td>
                    <td style={thTdStyle}>{user.email}</td>
                    <td style={thTdStyle}>{user.role}</td>
                    <td style={thTdStyle}>{new Date(user.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

    {view === "transactions" && (
    <div style={sectionStyle}>
    <h3 style={titleStyle}>Recent Transactions</h3>

    {loading && <p>Loading...</p>}
    {error && <p style={{ color: 'red' }}>{error}</p>}

    {!loading && !error && transactions.length > 0 && (
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={thStyle}>Payment ID</th>
            <th style={thStyle}>Amount ($)</th>
            <th style={thStyle}>Customer</th>
            <th style={thStyle}>Email</th>
            <th style={thStyle}>Description</th>
            <th style={thStyle}>Date</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.payment_id}>
              <td style={tdStyle}>{tx.payment_id}</td>
              <td style={tdStyle}>${tx.amount.toFixed(2)}</td>
              <td style={tdStyle}>{tx.customer_name}</td>
              <td style={tdStyle}>{tx.customer_email}</td>
              <td style={tdStyle}>{tx.description}</td>
              <td style={tdStyle}>{new Date(tx.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )}

    {!loading && transactions.length === 0 && <p>No transactions found.</p>}
    </div>
    )}

      </div>
    </div>
  );
};

export default Dashboard;
