'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'MANAGER';
}

interface Application {
  id: number;
  full_name: string;
  age: number | null;
  city: string | null;
  email: string;
  whatsapp: string | null;
  linkedin: string | null;
  education: string | null;
  current_status: string | null;
  field: string | null;
  expertise_level: string | null;
  work_experience: string | null;
  english_level: string | null;
  other_skills: string | null;
  cover_message: string | null;
  voice_note_name: string | null;
  voice_note_type: string | null;
  video_url: string | null;
  status: 'New' | 'Reviewing' | 'Shortlisted' | 'Rejected';
  created_at: string;
  has_voice: number;
}

interface Stats {
  total: number;
  new_count: number;
  reviewing_count: number;
  shortlisted_count: number;
  rejected_count: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const statusColors = {
  New: 'bg-blue-100 text-blue-800',
  Reviewing: 'bg-orange-100 text-orange-800',
  Shortlisted: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800',
};

export default function HiringPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, new_count: 0, reviewing_count: 0, shortlisted_count: 0, rejected_count: 0 });
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 25, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchData = useCallback(async (page: number = 1) => {
    try {
      const res = await fetch(`/api/hiring?page=${page}`);
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      setUser(data.user);
      setApplications(data.applications);
      setStats(data.stats);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchData(1);
  }, [fetchData]);

  // Client-side filter
  const filteredApplications = applications.filter((app) => {
    const matchesSearch = !search || 
      app.full_name.toLowerCase().includes(search.toLowerCase()) ||
      app.email.toLowerCase().includes(search.toLowerCase()) ||
      (app.field && app.field.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (id: number, status: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/hiring/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setApplications(apps => apps.map(a => a.id === id ? { ...a, status: status as Application['status'] } : a));
        // Update stats
        fetchData(pagination.page);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this application?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/hiring/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setApplications(apps => apps.filter(a => a.id !== id));
        fetchData(pagination.page);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete');
      }
    } catch (err) {
      console.error('Failed to delete:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const handleExport = async () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (statusFilter !== 'All') params.set('status', statusFilter);
    
    const res = await fetch(`/api/hiring/export?${params}`);
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'elite-applications.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Hiring Dashboard</h1>
              <p className="text-sm text-gray-500">Elite Partners</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">Hello, {user?.name}</p>
              <p className="text-xs text-gray-500">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">New</p>
            <p className="text-2xl font-bold text-blue-600">{stats.new_count}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Reviewing</p>
            <p className="text-2xl font-bold text-orange-600">{stats.reviewing_count}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Shortlisted</p>
            <p className="text-2xl font-bold text-green-600">{stats.shortlisted_count}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Rejected</p>
            <p className="text-2xl font-bold text-red-600">{stats.rejected_count}</p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Search by name, email, or field..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="All">All Status</option>
              <option value="New">New</option>
              <option value="Reviewing">Reviewing</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Rejected">Rejected</option>
            </select>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">WhatsApp</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Field</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">City</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Voice</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Video</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredApplications.map((app, index) => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {(pagination.page - 1) * pagination.limit + index + 1}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{app.full_name}</div>
                      <div className="text-xs text-gray-500">{app.expertise_level}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{app.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{app.whatsapp || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{app.field || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{app.city || '—'}</td>
                    <td className="px-4 py-3">
                      {app.has_voice ? (
                        <audio controls className="h-8 w-32">
                          <source src={`/api/hiring/${app.id}/voice`} type={app.voice_note_type || 'audio/mpeg'} />
                        </audio>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {app.video_url ? (
                        <a
                          href={app.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Watch
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                        disabled={updatingId === app.id}
                        className={`text-xs px-2 py-1 rounded-full border-0 ${statusColors[app.status]} cursor-pointer`}
                      >
                        <option value="New">New</option>
                        <option value="Reviewing">Reviewing</option>
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                      {updatingId === app.id && (
                        <span className="ml-1 inline-block w-3 h-3 border border-gray-300 border-t-black rounded-full animate-spin"></span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(app.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {user?.role === 'ADMIN' && (
                        <button
                          onClick={() => handleDelete(app.id)}
                          disabled={deletingId === app.id}
                          className="text-xs text-red-600 hover:text-red-800 disabled:opacity-50"
                        >
                          {deletingId === app.id ? 'Deleting...' : 'Delete'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredApplications.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No applications found
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} applications
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => fetchData(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => fetchData(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
