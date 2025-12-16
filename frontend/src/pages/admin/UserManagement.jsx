import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../../lib/api-client';

const emptyForm = {
  id: null,
  username: '',
  full_name: '',
  email: '',
  password: '',
  role_id: '2', // 1 = admin, 2 = user (tu dong)
  phone: '',
  address: '',
  dob: '',
  gender: '',
  status: 'active',
};

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/users');
      const data = Array.isArray(res.data) ? res.data : res.data.data || [];
      setUsers(data);
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          'Khong tai duoc danh sach nguoi dung.'
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      const name = `${u.full_name || ''} ${u.username || ''}`.toLowerCase();
      const email = (u.email || '').toLowerCase();
      const phone = (u.phone || '').toLowerCase();
      return (
        name.includes(q) || email.includes(q) || phone.includes(q)
      );
    });
  }, [users, search]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function startCreate() {
    setForm(emptyForm);
    setEditing(false);
  }

  function startEdit(user) {
    setForm({
      id: user.user_id,
      username: user.username,
      full_name: user.full_name || '',
      email: user.email || '',
      password: '',
      role_id: String(user.role_id ?? '2'),
      phone: user.phone || '',
      address: user.address || '',
      dob: user.dob || '',
      gender: user.gender || '',
      status: user.status || 'active',
    });
    setEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editing && form.id) {
        // UPDATE
        const payload = {
          full_name: form.full_name,
          phone: form.phone,
          email: form.email,
          role_id: form.role_id,
          address: form.address,
          dob: form.dob || null,
          gender: form.gender || null,
          status: form.status,
        };
        await api.put(`/admin/users/${form.id}`, payload);
      } else {
        // CREATE
        const payload = {
          username: form.username,
          full_name: form.full_name,
          email: form.email,
          password: form.password,
          role_id: form.role_id,
          status: form.status,
        };
        await api.post('/admin/users', payload);
      }
      await fetchUsers();
      setForm(emptyForm);
      setEditing(false);
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message || 'Co loi xay ra khi luu nguoi dung.'
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(user) {
    if (
      !window.confirm(
        `Xoa tai khoan "${user.username}"? Hanh dong nay khong the hoan tac.`
      )
    ) {
      return;
    }
    try {
      await api.delete(`/admin/users/${user.user_id}`);
      setUsers((prev) => prev.filter((u) => u.user_id !== user.user_id));
    } catch (err) {
      console.error(err);
      alert(
        err?.response?.data?.message || 'Khong xoa duoc nguoi dung.'
      );
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Quan ly Nguoi dung
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Quan ly tai khoan nguoi dung, vai tro va trang thai truy cap.
          </p>
        </div>
        <button
          type="button"
          onClick={startCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
        >
          <span className="text-base leading-none">＋</span>
          <span>Them nguoi dung</span>
        </button>
      </header>

      {/* Form create / edit */}
      <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">
          {editing ? 'Chinh sua nguoi dung' : 'Them nguoi dung moi'}
        </h3>
        {error && (
          <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
            {error}
          </div>
        )}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm"
        >
          {!editing && (
            <div>
              <label className="block text-gray-700 mb-1">
                Ten dang nhap *
              </label>
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          )}
          <div>
            <label className="block text-gray-700 mb-1">Ho ten</label>
            <input
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          {!editing && (
            <div>
              <label className="block text-gray-700 mb-1">Mat khau *</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          )}
          <div>
            <label className="block text-gray-700 mb-1">Vai tro</label>
            <select
              name="role_id"
              value={form.role_id}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1">Admin</option>
              <option value="2">User</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Trang thai</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Hoat dong</option>
              <option value="banned">Bi khoa</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-1">So dien thoai</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Ngay sinh</label>
            <input
              type="date"
              name="dob"
              value={form.dob}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Gioi tinh</label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Chua chon</option>
              <option value="male">Nam</option>
              <option value="female">Nu</option>
              <option value="other">Khac</option>
            </select>
          </div>

          <div className="md:col-span-3 flex justify-end gap-2 pt-2">
            {editing && (
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setForm(emptyForm);
                }}
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 text-sm hover:bg-gray-50"
              >
                Huy
              </button>
            )}
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60"
            >
              {saving
                ? 'Dang luu...'
                : editing
                ? 'Luu thay doi'
                : 'Tao moi'}
            </button>
          </div>
        </form>
      </section>

      {/* Toolbar search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex-1">
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
              🔍
            </span>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tim theo ten, email hoac so dien thoai..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="text-xs text-gray-500">
          {filteredUsers.length} nguoi dung
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-gray-600 font-medium">
                Nguoi dung
              </th>
              <th className="px-4 py-2 text-left text-gray-600 font-medium">
                Email
              </th>
              <th className="px-4 py-2 text-left text-gray-600 font-medium">
                Vai tro
              </th>
              <th className="px-4 py-2 text-left text-gray-600 font-medium">
                Trang thai
              </th>
              <th className="px-4 py-2 text-left text-gray-600 font-medium">
                Ngay tao
              </th>
              <th className="px-4 py-2 text-right text-gray-600 font-medium">
                Hanh dong
              </th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-6 text-center text-sm text-gray-500"
                >
                  Dang tai du lieu...
                </td>
              </tr>
            )}
            {!loading &&
              filteredUsers.map((u) => (
                <tr
                  key={u.user_id}
                  className="border-t border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-700">
                        {(u.full_name || u.username || 'U')
                          .split(' ')
                          .map((p) => p[0])
                          .join('')
                          .slice(0, 2)}
                      </div>
                      <span className="text-sm text-gray-900">
                        {u.full_name || u.username}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{u.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                        String(u.role_id) === '1'
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {String(u.role_id) === '2' ? 'admin' : 'user'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                        u.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-red-50 text-red-600'
                      }`}
                    >
                      {u.status === 'active' ? 'Hoat dong' : 'Bi khoa'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {u.created_at
                      ? new Date(u.created_at).toLocaleDateString('vi-VN')
                      : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2 text-gray-500">
                      <button
                        type="button"
                        onClick={() => startEdit(u)}
                        className="p-1.5 rounded-full hover:bg-gray-100"
                        title="Chinh sua"
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(u)}
                        className="p-1.5 rounded-full hover:bg-red-50 text-red-600"
                        title="Xoa"
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            {!loading && filteredUsers.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-6 text-center text-sm text-gray-500"
                >
                  Khong tim thay nguoi dung nao.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

