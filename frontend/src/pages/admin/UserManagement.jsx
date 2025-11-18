import React, { useEffect, useState } from "react";

/**
 * Simple User Management page
 * - List users
 * - Search
 * - Add / Edit user (same form)
 * - Delete user
 * - Persist to localStorage
 *
 * File: /e:/Projects Github/LaboSupport/frontend/src/pages/admin/UserManagement.jsx
 */

const STORAGE_KEY = "ls_users_v1";

const defaultUsers = [
    { id: 1, name: "Nguyễn Văn A", email: "a@example.com", role: "admin" },
    { id: 2, name: "Trần Thị B", email: "b@example.com", role: "user" },
    { id: 3, name: "Lê Văn C", email: "c@example.com", role: "user" },
];

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [q, setQ] = useState("");
    const [form, setForm] = useState({ id: null, name: "", email: "", role: "user" });
    const [editing, setEditing] = useState(false);

    useEffect(() => {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            try {
                setUsers(JSON.parse(raw));
            } catch {
                setUsers(defaultUsers);
            }
        } else {
            setUsers(defaultUsers);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    }, [users]);

    function resetForm() {
        setForm({ id: null, name: "", email: "", role: "user" });
        setEditing(false);
    }

    function handleChange(e) {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    }

    function handleSubmit(e) {
        e.preventDefault();
        const name = form.name.trim();
        const email = form.email.trim();
        if (!name || !email) {
            alert("Vui lòng nhập tên và email.");
            return;
        }

        if (editing) {
            setUsers((prev) => prev.map((u) => (u.id === form.id ? { ...u, name, email, role: form.role } : u)));
        } else {
            const id = Date.now();
            setUsers((prev) => [...prev, { id, name, email, role: form.role }]);
        }
        resetForm();
    }

    function handleEdit(user) {
        setForm(user);
        setEditing(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function handleDelete(id) {
        if (!window.confirm("Xóa user này?")) return;
        setUsers((prev) => prev.filter((u) => u.id !== id));
        if (editing && form.id === id) resetForm();
    }

    const filtered = users.filter((u) => {
        const s = q.trim().toLowerCase();
        if (!s) return true;
        return (
            u.name.toLowerCase().includes(s) ||
            u.email.toLowerCase().includes(s) ||
            u.role.toLowerCase().includes(s)
        );
    });

    return (
        <div style={styles.container}>
            <h2>Quản lý người dùng</h2>

            <form onSubmit={handleSubmit} style={styles.form}>
                <input
                    name="name"
                    placeholder="Tên"
                    value={form.name}
                    onChange={handleChange}
                    style={styles.input}
                />
                <input
                    name="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    style={styles.input}
                />
                <select name="role" value={form.role} onChange={handleChange} style={styles.select}>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                </select>
                <div style={{ display: "flex", gap: 8 }}>
                    <button type="submit" style={styles.btnPrimary}>
                        {editing ? "Lưu" : "Thêm"}
                    </button>
                    {editing && (
                        <button type="button" onClick={resetForm} style={styles.btn}>
                            Hủy
                        </button>
                    )}
                </div>
            </form>

            <div style={styles.toolbar}>
                <input
                    placeholder="Tìm kiếm theo tên, email, role..."
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    style={styles.search}
                />
                <div style={{ fontSize: 14, color: "#555" }}>{filtered.length} kết quả</div>
            </div>

            <table style={styles.table}>
                <thead>
                    <tr>
                        <th style={styles.th}>#</th>
                        <th style={styles.th}>Tên</th>
                        <th style={styles.th}>Email</th>
                        <th style={styles.th}>Vai trò</th>
                        <th style={styles.th}>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {filtered.length === 0 && (
                        <tr>
                            <td colSpan="5" style={styles.empty}>
                                Không có user
                            </td>
                        </tr>
                    )}
                    {filtered.map((u, idx) => (
                        <tr key={u.id} style={idx % 2 ? styles.rowAlt : undefined}>
                            <td style={styles.td}>{idx + 1}</td>
                            <td style={styles.td}>{u.name}</td>
                            <td style={styles.td}>{u.email}</td>
                            <td style={styles.td}>{u.role}</td>
                            <td style={styles.td}>
                                <button onClick={() => handleEdit(u)} style={styles.actionBtn}>
                                    Sửa
                                </button>
                                <button onClick={() => handleDelete(u.id)} style={{ ...styles.actionBtn, ...styles.delete }}>
                                    Xóa
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

const styles = {
    container: {
        padding: 20,
        maxWidth: 900,
        margin: "0 auto",
        fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
    },
    form: {
        display: "flex",
        gap: 8,
        marginBottom: 16,
        alignItems: "center",
        flexWrap: "wrap",
    },
    input: {
        padding: "8px 10px",
        borderRadius: 6,
        border: "1px solid #ccc",
        minWidth: 180,
    },
    select: {
        padding: "8px 10px",
        borderRadius: 6,
        border: "1px solid #ccc",
    },
    btnPrimary: {
        background: "#0366d6",
        color: "#fff",
        border: "none",
        padding: "8px 12px",
        borderRadius: 6,
        cursor: "pointer",
    },
    btn: {
        background: "#eee",
        border: "none",
        padding: "8px 12px",
        borderRadius: 6,
        cursor: "pointer",
    },
    toolbar: {
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 8,
        alignItems: "center",
    },
    search: {
        padding: "8px 10px",
        borderRadius: 6,
        border: "1px solid #ccc",
        width: 320,
    },
    table: {
        width: "100%",
        borderCollapse: "collapse",
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
    },
    th: {
        textAlign: "left",
        padding: "10px 12px",
        borderBottom: "1px solid #eee",
        background: "#fafafa",
        fontSize: 14,
    },
    td: {
        padding: "10px 12px",
        borderBottom: "1px solid #f6f6f6",
        fontSize: 14,
    },
    rowAlt: {
        background: "#fafafa",
    },
    actionBtn: {
        marginRight: 8,
        padding: "6px 10px",
        borderRadius: 6,
        border: "1px solid #ddd",
        background: "#fff",
        cursor: "pointer",
        fontSize: 13,
    },
    delete: {
        borderColor: "#f2b6b6",
        background: "#fff6f6",
        color: "#d00",
    },
    empty: {
        padding: 20,
        textAlign: "center",
        color: "#666",
    },
};