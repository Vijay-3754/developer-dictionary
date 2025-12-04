import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { API_BASE_URL } from '../config/api';

export default function DeveloperProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getAuthHeaders } = useAuth();
  const [developer, setDeveloper] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeveloper();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchDeveloper = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/developers/${id}`, {
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        if (res.status === 404) {
          toast.error('Developer not found');
          navigate('/');
          return;
        }
        throw new Error('Failed to load developer');
      }

      const data = await res.json();
      setDeveloper(data);
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to load developer');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-100">Loading...</div>
      </div>
    );
  }

  if (!developer) {
    return null;
  }

  const techStackArray = developer.techStack
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-10">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-slate-400 hover:text-slate-200 mb-6"
        >
          ← Back to Directory
        </Link>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-6">
            <div>
              <h1 className="text-3xl font-semibold mb-2">{developer.name}</h1>
              <span className="inline-flex items-center rounded-full bg-sky-600/15 px-3 py-1 text-sm font-medium text-sky-300 border border-sky-700/40">
                {developer.role}
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-400">Experience</p>
              <p className="text-2xl font-semibold text-emerald-400">
                {developer.experience} {developer.experience === 1 ? 'year' : 'years'}
              </p>
            </div>
          </div>

          {developer.description && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">About</h2>
              <p className="text-slate-300 leading-relaxed">{developer.description}</p>
            </div>
          )}

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Tech Stack</h2>
            <div className="flex flex-wrap gap-2">
              {techStackArray.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full bg-slate-800/80 px-3 py-1.5 text-sm text-slate-200 border border-slate-700"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-800 pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-400 mb-1">Joining Date</p>
                <p className="text-slate-200">
                  {developer.joiningDate
                    ? new Date(developer.joiningDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'Not specified'}
                </p>
              </div>
              <div>
                <p className="text-slate-400 mb-1">Added</p>
                <p className="text-slate-200">
                  {developer.createdAt
                    ? new Date(developer.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'Unknown'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

