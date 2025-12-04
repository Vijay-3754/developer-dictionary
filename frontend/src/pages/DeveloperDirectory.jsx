import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { API_BASE_URL } from '../config/api';

const initialFormState = {
  name: '',
  role: '',
  techStack: '',
  experience: '',
  description: '',
  joiningDate: '',
};

export default function DeveloperDirectory() {
  const { getAuthHeaders, user, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialFormState);
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [roleFilter, setRoleFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchDevelopers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter, searchQuery, sortBy, currentPage]);

  const fetchDevelopers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (roleFilter && roleFilter !== 'All') params.append('role', roleFilter);
      if (searchQuery) params.append('search', searchQuery);
      if (sortBy === 'experience-asc') params.append('sort', 'experience-asc');
      if (sortBy === 'experience-desc') params.append('sort', 'experience-desc');
      params.append('page', currentPage.toString());
      params.append('limit', itemsPerPage.toString());

      const res = await fetch(`${API_BASE_URL}/api/developers?${params.toString()}`, {
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        if (res.status === 401) {
          logout();
          return;
        }
        throw new Error('Failed to load developers');
      }

      const data = await res.json();
      setDevelopers(data.developers || []);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to load developers');
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.role) newErrors.role = 'Role is required';
    if (!form.techStack.trim()) newErrors.techStack = 'Tech stack is required';
    if (form.experience === '') {
      newErrors.experience = 'Experience is required';
    } else {
      const exp = Number(form.experience);
      if (Number.isNaN(exp) || exp < 0) {
        newErrors.experience = 'Experience must be a non-negative number';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix the validation errors.');
      return;
    }

    setSubmitting(true);
    try {
      const url = editingId
        ? `${API_BASE_URL}/api/developers/${editingId}`
        : `${API_BASE_URL}/api/developers`;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...form,
          experience: Number(form.experience),
          joiningDate: form.joiningDate || new Date().toISOString(),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to save developer');
      }

      const saved = await res.json();
      if (editingId) {
        setDevelopers((prev) =>
          prev.map((d) => (d.id === editingId ? saved : d))
        );
        toast.success('Developer updated successfully!');
      } else {
        setDevelopers((prev) => [saved, ...prev]);
        toast.success('Developer added successfully!');
      }

      setForm(initialFormState);
      setEditingId(null);
      setErrors({});
      fetchDevelopers();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (dev) => {
    setForm({
      name: dev.name,
      role: dev.role,
      techStack: dev.techStack,
      experience: dev.experience.toString(),
      description: dev.description || '',
      joiningDate: dev.joiningDate ? dev.joiningDate.split('T')[0] : '',
    });
    setEditingId(dev.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/developers/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        throw new Error('Failed to delete developer');
      }

      toast.success('Developer deleted successfully!');
      setShowDeleteConfirm(null);
      fetchDevelopers();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to delete developer');
    }
  };

  const cancelEdit = () => {
    setForm(initialFormState);
    setEditingId(null);
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-10">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              Developer Directory
            </h1>
            <p className="text-slate-400 mt-1 text-sm sm:text-base">
              Manage your team of developers with ease
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">Welcome, {user?.name}</span>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="text-sm text-slate-400 hover:text-slate-200"
            >
              Logout
            </button>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          {/* Form card */}
          <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-lg">
            <h2 className="text-lg font-semibold mb-1">
              {editingId ? 'Edit Developer' : 'Add Developer'}
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              {editingId
                ? 'Update the developer information below.'
                : 'Fill in the details to add a new developer.'}
            </p>
            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300" htmlFor="name">
                  Name *
                </label>
                <input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className={`w-full rounded-lg border bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:ring-2 focus:ring-sky-500 ${
                    errors.name ? 'border-red-500/80' : 'border-slate-800'
                  }`}
                  placeholder="e.g. Jane Doe"
                />
                {errors.name && (
                  <p className="text-xs text-red-400 mt-0.5">{errors.name}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300" htmlFor="role">
                  Role *
                </label>
                <select
                  id="role"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className={`w-full rounded-lg border bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none transition focus:ring-2 focus:ring-sky-500 ${
                    errors.role ? 'border-red-500/80' : 'border-slate-800'
                  }`}
                >
                  <option value="">Select role</option>
                  <option value="Frontend">Frontend</option>
                  <option value="Backend">Backend</option>
                  <option value="Full-Stack">Full-Stack</option>
                </select>
                {errors.role && (
                  <p className="text-xs text-red-400 mt-0.5">{errors.role}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label
                  className="block text-xs font-medium text-slate-300"
                  htmlFor="techStack"
                >
                  Tech Stack *
                </label>
                <input
                  id="techStack"
                  name="techStack"
                  value={form.techStack}
                  onChange={handleChange}
                  className={`w-full rounded-lg border bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:ring-2 focus:ring-sky-500 ${
                    errors.techStack ? 'border-red-500/80' : 'border-slate-800'
                  }`}
                  placeholder="e.g. React, Node.js, MongoDB"
                />
                <p className="text-[11px] text-slate-500">
                  Comma-separated values
                </p>
                {errors.techStack && (
                  <p className="text-xs text-red-400 mt-0.5">{errors.techStack}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label
                  className="block text-xs font-medium text-slate-300"
                  htmlFor="experience"
                >
                  Experience (years) *
                </label>
                <input
                  id="experience"
                  name="experience"
                  type="number"
                  min="0"
                  step="0.5"
                  value={form.experience}
                  onChange={handleChange}
                  className={`w-full rounded-lg border bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:ring-2 focus:ring-sky-500 ${
                    errors.experience ? 'border-red-500/80' : 'border-slate-800'
                  }`}
                  placeholder="e.g. 2.5"
                />
                {errors.experience && (
                  <p className="text-xs text-red-400 mt-0.5">{errors.experience}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label
                  className="block text-xs font-medium text-slate-300"
                  htmlFor="description"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:ring-2 focus:ring-sky-500"
                  placeholder="Brief description about the developer..."
                />
              </div>

              <div className="space-y-1.5">
                <label
                  className="block text-xs font-medium text-slate-300"
                  htmlFor="joiningDate"
                >
                  Joining Date
                </label>
                <input
                  id="joiningDate"
                  name="joiningDate"
                  type="date"
                  value={form.joiningDate}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none transition focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-medium text-white shadow-md transition hover:bg-sky-500 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting
                    ? editingId
                      ? 'Updating...'
                      : 'Adding...'
                    : editingId
                      ? 'Update Developer'
                      : 'Add Developer'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-slate-100"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </section>

          {/* List + filters card */}
          <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col">
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-4">Developers</h2>

              {/* Search */}
              <div className="mb-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:ring-2 focus:ring-sky-500"
                  placeholder="Search by name or tech stack..."
                />
              </div>

              {/* Filters and Sort */}
              <div className="grid gap-3 sm:grid-cols-2 mb-4">
                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-slate-300">
                    Filter by role
                  </label>
                  <select
                    value={roleFilter}
                    onChange={(e) => {
                      setRoleFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-xs sm:text-sm text-slate-100 outline-none transition focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="All">All roles</option>
                    <option value="Frontend">Frontend</option>
                    <option value="Backend">Backend</option>
                    <option value="Full-Stack">Full-Stack</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-slate-300">
                    Sort by
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-xs sm:text-sm text-slate-100 outline-none transition focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="newest">Newest first</option>
                    <option value="experience-asc">Experience (Low to High)</option>
                    <option value="experience-desc">Experience (High to Low)</option>
                  </select>
                </div>
              </div>

              <p className="text-xs text-slate-400 mb-4">
                {loading
                  ? 'Loading...'
                  : pagination
                    ? `Showing ${developers.length} of ${pagination.totalItems} developers`
                    : 'No developers found'}
              </p>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto rounded-xl border border-slate-800/80 bg-slate-950/50 p-3 space-y-3 max-h-[500px]">
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-sm text-slate-400">Loading developers...</p>
                </div>
              ) : developers.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">
                  No developers found. Try adjusting filters or add a new developer.
                </p>
              ) : (
                developers.map((dev) => (
                  <article
                    key={dev.id}
                    className="rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2.5 text-sm"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <Link
                          to={`/developers/${dev.id}`}
                          className="font-semibold text-slate-50 hover:text-sky-400 transition"
                        >
                          {dev.name}
                        </Link>
                        <span className="ml-2 inline-flex items-center rounded-full bg-sky-600/15 px-2 py-0.5 text-[11px] font-medium text-sky-300 border border-sky-700/40">
                          {dev.role}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEdit(dev)}
                          className="text-xs text-sky-400 hover:text-sky-300"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(dev.id)}
                          className="text-xs text-red-400 hover:text-red-300"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 mb-2">
                      <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/30 text-emerald-300">
                        {dev.experience} {dev.experience === 1 ? 'year' : 'years'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {dev.techStack
                        .split(',')
                        .map((t) => t.trim())
                        .filter(Boolean)
                        .slice(0, 5)
                        .map((tech) => (
                          <span
                            key={tech}
                            className="rounded-full bg-slate-800/80 px-2 py-0.5 text-[11px] text-slate-200 border border-slate-700"
                          >
                            {tech}
                          </span>
                        ))}
                      {dev.techStack.split(',').filter((t) => t.trim()).length > 5 && (
                        <span className="text-[11px] text-slate-500">+more</span>
                      )}
                    </div>
                  </article>
                ))
              )}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-sm rounded-lg border border-slate-800 bg-slate-950/60 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800"
                >
                  Previous
                </button>
                <span className="text-sm text-slate-400">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))
                  }
                  disabled={currentPage === pagination.totalPages}
                  className="px-3 py-1.5 text-sm rounded-lg border border-slate-800 bg-slate-950/60 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800"
                >
                  Next
                </button>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-2">Confirm Delete</h3>
            <p className="text-sm text-slate-400 mb-6">
              Are you sure you want to delete this developer? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-sm font-medium transition"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

