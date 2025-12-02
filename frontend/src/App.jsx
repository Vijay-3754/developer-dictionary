import { useEffect, useMemo, useState } from 'react';
import './index.css';
import { Toaster, toast } from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const initialFormState = {
  name: '',
  role: '',
  techStack: '',
  experience: '',
};

function App() {
  const [form, setForm] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [roleFilter, setRoleFilter] = useState('All');
  const [techFilter, setTechFilter] = useState('');

  const filteredDevelopers = useMemo(() => {
    return developers.filter((dev) => {
      const matchRole =
        roleFilter === 'All' || dev.role.toLowerCase() === roleFilter.toLowerCase();
      const matchTech =
        !techFilter ||
        dev.techStack.toLowerCase().includes(techFilter.toLowerCase());
      return matchRole && matchTech;
    });
  }, [developers, roleFilter, techFilter]);

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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix the validation errors.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/developers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          experience: Number(form.experience),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to add developer');
      }

      const created = await res.json();
      setDevelopers((prev) => [created, ...prev]);
      setForm(initialFormState);
      setErrors({});
      toast.success('Developer added successfully!');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const fetchDevelopers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (roleFilter && roleFilter !== 'All') params.append('role', roleFilter);
      if (techFilter) params.append('tech', techFilter);

      const res = await fetch(
        `${API_BASE_URL}/developers${params.toString() ? `?${params.toString()}` : ''}`,
      );
      if (!res.ok) throw new Error('Failed to load developers');
      const data = await res.json();
      setDevelopers(data);
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to load developers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevelopers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchDevelopers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter, techFilter]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-start justify-center px-4 py-10">
      <Toaster position="top-right" />
      <div className="w-full max-w-5xl">
        <header className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              Developer Directory
            </h1>
            <p className="text-slate-400 mt-1 text-sm sm:text-base">
              Add developers, filter by role or tech stack, and view your team in one place.
            </p>
          </div>
          <div className="text-xs text-slate-500">
            Built with <span className="font-semibold text-sky-400">React</span> &amp;{' '}
            <span className="font-semibold text-emerald-400">Node.js</span>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.2fr)]">
          {/* Form card */}
          <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-lg shadow-slate-950/40">
            <h2 className="text-lg font-semibold mb  -1">Add Developer</h2>
            <p className="text-xs text-slate-400 mb-4">
              Fill in the details below to add a new developer to the directory.
            </p>
            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300" htmlFor="name">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className={`w-full rounded-lg border bg-slate-950/60 px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-sky-500 ${
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
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className={`w-full rounded-lg border bg-slate-950/60 px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-sky-500 ${
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
                  Tech Stack
                </label>
                <input
                  id="techStack"
                  name="techStack"
                  value={form.techStack}
                  onChange={handleChange}
                  className={`w-full rounded-lg border bg-slate-950/60 px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-sky-500 ${
                    errors.techStack ? 'border-red-500/80' : 'border-slate-800'
                  }`}
                  placeholder="e.g. React, Node.js, MongoDB"
                />
                <p className="text-[11px] text-slate-500">
                  Use comma-separated values (e.g., React, Node.js, PostgreSQL).
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
                  Experience (years)
                </label>
                <input
                  id="experience"
                  name="experience"
                  type="number"
                  min="0"
                  step="0.5"
                  value={form.experience}
                  onChange={handleChange}
                  className={`w-full rounded-lg border bg-slate-950/60 px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-sky-500 ${
                    errors.experience ? 'border-red-500/80' : 'border-slate-800'
                  }`}
                  placeholder="e.g. 2.5"
                />
                {errors.experience && (
                  <p className="text-xs text-red-400 mt-0.5">{errors.experience}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-sky-900/40 transition hover:bg-sky-500 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? 'Adding developer...' : 'Add Developer'}
              </button>
            </form>
          </section>

          {/* List + filters card */}
          <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-lg shadow-slate-950/40 flex flex-col">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Developers</h2>
                <p className="text-xs text-slate-400">
                  {loading
                    ? 'Loading developers...'
                    : `${filteredDevelopers.length} developer(s) found`}
                </p>
              </div>
            </div>

            {/* Filters */}
            <div className="mb-4 grid gap-3 sm:grid-cols-[minmax(0,0.6fr)_minmax(0,1.2fr)]">
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-300">
                  Filter by role
                </label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-xs sm:text-sm outline-none transition focus:ring-2 focus:ring-sky-500"
                >
                  <option value="All">All roles</option>
                  <option value="Frontend">Frontend</option>
                  <option value="Backend">Backend</option>
                  <option value="Full-Stack">Full-Stack</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-300">
                  Search by tech
                </label>
                <input
                  value={techFilter}
                  onChange={(e) => setTechFilter(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-xs sm:text-sm outline-none transition focus:ring-2 focus:ring-sky-500"
                  placeholder="e.g. React, Node.js"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto rounded-xl border border-slate-800/80 bg-slate-950/50 p-3 space-y-3 max-h-[420px]">
              {loading ? (
                <p className="text-sm text-slate-400">Loading...</p>
              ) : filteredDevelopers.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No developers found. Try adjusting filters or add a new developer.
                </p>
              ) : (
                filteredDevelopers.map((dev) => (
                  <article
                    key={dev.id}
                    className="rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2.5 text-sm flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-slate-50">{dev.name}</h3>
                      <span className="inline-flex items-center rounded-full bg-sky-600/15 px-2.5 py-0.5 text-[11px] font-medium text-sky-300 border border-sky-700/40">
                        {dev.role}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                      <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/30 text-[11px] text-emerald-300">
                        {dev.experience} year(s)
                      </span>
                      <span className="text-slate-500">
                        Added{' '}
                        {dev.createdAt
                          ? new Date(dev.createdAt).toLocaleDateString()
                          : ''}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {dev.techStack
                        .split(',')
                        .map((t) => t.trim())
                        .filter(Boolean)
                        .map((tech) => (
                          <span
                            key={tech}
                            className="rounded-full bg-slate-800/80 px-2 py-0.5 text-[11px] text-slate-200 border border-slate-700"
                          >
                            {tech}
                          </span>
                        ))}
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default App;
