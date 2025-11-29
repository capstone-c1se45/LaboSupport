// src/pages/admin/UserManagement.jsx
import React, { useEffect, useState } from "react";
import { adminService } from "../../services/adminService";

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [q, setQ] = useState(""); // Từ khóa tìm kiếm
    const [form, setForm] = useState({ 
        id: null, 
        username: "", 
        full_name: "", 
        email: "", 
        password: "", // Cần cho tạo mới
        role_id: "1",
        phone: "" 
    });
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    // Thay thế localStorage bằng API fetch
    useEffect(() => {
        fetchUsers();
    }, []);

    // Hàm gọi API lấy danh sách users
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await adminService.getAllUsers();
            setUsers(data);
        } catch (error) {
            alert("Lỗi tải danh sách người dùng");
        } finally {
            setLoading(false);
        }
    };

    // Hàm tìm kiếm
    const handleSearch = async () => {
        if (!q.trim()) {
            fetchUsers();
            return;
        }
        try {
            const results = await adminService.searchUsers(q);
            setUsers(results);
        } catch (error) {
            // Backend trả về 404 nếu không thấy
            setUsers([]); 
        }
    };

    function handleChange(e) {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            if (editing) {
                // Gọi API Update
                await adminService.updateUser(form.id, {
                    full_name: form.full_name,
                    email: form.email,
                    role_id: form.role_id,
                    phone: form.phone,
                    ...(form.password ? { password: form.password } : {})
                });
                alert("Cập nhật thành công!");
            } else {
                // Gọi API Create
                await adminService.createUser({
                    username: form.username,
                    password: form.password,
                    full_name: form.full_name,
                    email: form.email,
                    role_id: form.role_id,
                    phone: form.phone
                });
                alert("Thêm người dùng thành công!");
            }
            resetForm();
            fetchUsers(); // Tải lại danh sách
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Có lỗi xảy ra.");
        }
    }

    function handleEdit(user) {
        // Map dữ liệu từ bảng vào form
        setForm({
            id: user.user_id, // Lưu ý backend dùng user_id
            username: user.username,
            full_name: user.full_name || "",
            email: user.email,
            role_id: user.role_id,
            phone: user.phone || "",
            password: "" // Reset mật khẩu khi edit
        });
        setEditing(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async function handleDelete(id) {
        if (!window.confirm("Xóa user này? Hành động không thể hoàn tác.")) return;
        try {
            await adminService.deleteUser(id);
            setUsers((prev) => prev.filter((u) => u.user_id !== id));
        } catch (error) {
            alert("Lỗi khi xóa người dùng.");
        }
    }

    function resetForm() {
        setForm({ id: null, username: "", full_name: "", email: "", password: "", role_id: "user", phone: "" });
        setEditing(false);
    }

    return (
        <div style={styles.container}>
            <h2>Quản lý người dùng</h2>

            {/* Form Thêm / Sửa */}
            <form onSubmit={handleSubmit} style={styles.form}>
                {!editing && (
                    <input name="username" placeholder="Username *" value={form.username} onChange={handleChange} style={styles.input} required />
                )}
                <input name="full_name" placeholder="Họ tên" value={form.full_name} onChange={handleChange} style={styles.input} />
                <input name="email" type="email" placeholder="Email *" value={form.email} onChange={handleChange} style={styles.input} required />
                <input name="password" type="password" placeholder={editing ? "Mật khẩu (để trống nếu ko đổi)" : "Mật khẩu *"} value={form.password} onChange={handleChange} style={styles.input} required={!editing} />
                <input name="phone" placeholder="Số điện thoại" value={form.phone} onChange={handleChange} style={styles.input} />
                
                <select name="role_id" value={form.role_id} onChange={handleChange} style={styles.select}>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                </select>
                
                <div style={{ display: "flex", gap: 8 }}>
                    <button type="submit" style={styles.btnPrimary}>{editing ? "Lưu" : "Thêm"}</button>
                    {editing && <button type="button" onClick={resetForm} style={styles.btn}>Hủy</button>}
                </div>
            </form>

            {/* Toolbar Tìm kiếm */}
            <div style={styles.toolbar}>
                <div style={{display: 'flex', gap: 8}}>
                    <input 
                        placeholder="Tìm theo tên hoặc ID..." 
                        value={q} 
                        onChange={(e) => setQ(e.target.value)} 
                        style={styles.search} 
                    />
                    <button onClick={handleSearch} style={styles.btn}>Tìm</button>
                </div>
                <div style={{ fontSize: 14, color: "#555" }}>{users.length} kết quả</div>
            </div>

            {/* Bảng danh sách */}
            <table style={styles.table}>
                <thead>
                    <tr>
                        <th style={styles.th}>ID</th>
                        <th style={styles.th}>Username</th>
                        <th style={styles.th}>Họ tên</th>
                        <th style={styles.th}>Email</th>
                        <th style={styles.th}>Vai trò</th>
                        <th style={styles.th}>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {loading && <tr><td colSpan="6" style={{padding: 20, textAlign: 'center'}}>Đang tải...</td></tr>}
                    {!loading && users.length === 0 && (
                        <tr><td colSpan="6" style={styles.empty}>Không có user</td></tr>
                    )}
                    {users.map((u, idx) => (
                        <tr key={u.user_id} style={idx % 2 ? styles.rowAlt : undefined}>
                            <td style={styles.td}>{u.user_id}</td>
                            <td style={styles.td}>{u.username}</td>
                            <td style={styles.td}>{u.full_name}</td>
                            <td style={styles.td}>{u.email}</td>
                            <td style={styles.td}>
                                <span style={{
                                    padding: '2px 6px', 
                                    borderRadius: 4, 
                                    background: u.role_id === "2" ? '#e6fffa' : '#fff0f6',
                                    color: u.role_id === "2" ? '#006d75' : '#c41d7f',
                                    fontSize: 12,
                                    fontWeight: 'bold'
                                }}>
                                    {u.role_id === "2" ? 'ADMIN' : 'USER'}
                                </span>
                            </td>
                            <td style={styles.td}>
                                <button onClick={() => handleEdit(u)} style={styles.actionBtn}>Sửa</button>
                                <button onClick={() => handleDelete(u.user_id)} style={{ ...styles.actionBtn, ...styles.delete }}>Xóa</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

const styles = {
    container: { padding: 20, maxWidth: 1000, margin: "0 auto" },
    form: { display: "flex", gap: 8, marginBottom: 16, alignItems: "center", flexWrap: "wrap" },
    input: { padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", minWidth: 150 },
    select: { padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc" },
    btnPrimary: { background: "#0366d6", color: "#fff", border: "none", padding: "8px 12px", borderRadius: 6, cursor: "pointer" },
    btn: { background: "#eee", border: "none", padding: "8px 12px", borderRadius: 6, cursor: "pointer" },
    toolbar: { display: "flex", justifyContent: "space-between", marginBottom: 8, alignItems: "center" },
    search: { padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", width: 250 },
    table: { width: "100%", borderCollapse: "collapse", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" },
    th: { textAlign: "left", padding: "10px 12px", borderBottom: "1px solid #eee", background: "#fafafa", fontSize: 14 },
    td: { padding: "10px 12px", borderBottom: "1px solid #f6f6f6", fontSize: 14 },
    rowAlt: { background: "#fafafa" },
    actionBtn: { marginRight: 8, padding: "6px 10px", borderRadius: 6, border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontSize: 13 },
    delete: { borderColor: "#f2b6b6", background: "#fff6f6", color: "#d00" },
    empty: { padding: 20, textAlign: "center", color: "#666" },
};