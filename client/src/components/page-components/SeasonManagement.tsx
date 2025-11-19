import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../shared-components/Navbar";
import Footer from "../shared-components/Footer";

interface Season {
  seasonid: number;
  seasonname: string;
  league: string;
  format: string;
  active: boolean;
  displaycard: boolean;
}

const SeasonManagement = () => {
  const navigate = useNavigate();
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [filteredSeasons, setFilteredSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [filterLeague, setFilterLeague] = useState<string>('all');
  const [filterFormat, setFilterFormat] = useState<string>('all');
  const [filterActive, setFilterActive] = useState<string>('all');

  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSeason, setEditingSeason] = useState<Season | null>(null);
  const [formData, setFormData] = useState({
    seasonid: '',
    seasonname: '',
    league: 'RGL',
    format: '6S',
    active: false,
  });

  // Available options
  const leagues = ['RGL', 'OZF'];
  const formats = ['6S', 'HL', 'LAN'];

  useEffect(() => {
    verifyAdmin();
    fetchSeasons();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [seasons, filterLeague, filterFormat, filterActive]);

  const verifyAdmin = async () => {
    try {
      const response = await fetch('/api/admin/verify', {
        credentials: 'include',
      });
      if (!response.ok) {
        navigate('/admin/login');
      }
    } catch (err) {
      console.error('Admin verification failed:', err);
      navigate('/admin/login');
    }
  };

  const fetchSeasons = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/season-management/seasons', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch seasons');
      }

      const data = await response.json();
      setSeasons(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching seasons:', err);
      setError('Failed to load seasons');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...seasons];

    if (filterLeague !== 'all') {
      filtered = filtered.filter(s => s.league === filterLeague);
    }

    if (filterFormat !== 'all') {
      filtered = filtered.filter(s => s.format === filterFormat);
    }

    if (filterActive === 'active') {
      filtered = filtered.filter(s => s.active === true);
    } else if (filterActive === 'inactive') {
      filtered = filtered.filter(s => s.active === false);
    }

    setFilteredSeasons(filtered);
  };

  const handleAddSeason = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/season-management/seasons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          seasonid: parseInt(formData.seasonid),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create season');
      }

      await fetchSeasons();
      resetForm();
      setShowAddForm(false);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleUpdateSeason = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingSeason) return;

    try {
      const response = await fetch(`/api/season-management/seasons/${editingSeason.seasonid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          seasonname: formData.seasonname,
          league: formData.league,
          format: formData.format,
          active: formData.active,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update season');
      }

      await fetchSeasons();
      resetForm();
      setEditingSeason(null);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleToggleActive = async (seasonid: number) => {
    try {
      const response = await fetch(`/api/season-management/seasons/${seasonid}/toggle-active`, {
        method: 'PATCH',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to toggle season status');
      }

      await fetchSeasons();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleToggleDisplayCard = async (seasonid: number) => {
    try {
      const response = await fetch(`/api/season-management/seasons/${seasonid}/toggle-displaycard`, {
        method: 'PATCH',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to toggle display card status');
      }

      await fetchSeasons();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleDeleteSeason = async (seasonid: number, seasonname: string) => {
    if (!confirm(`Are you sure you want to delete "${seasonname}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/season-management/seasons/${seasonid}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete season');
      }

      await fetchSeasons();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const startEditing = (season: Season) => {
    setEditingSeason(season);
    setFormData({
      seasonid: season.seasonid.toString(),
      seasonname: season.seasonname,
      league: season.league,
      format: season.format,
      active: season.active,
    });
    setShowAddForm(false);
  };

  const resetForm = () => {
    setFormData({
      seasonid: '',
      seasonname: '',
      league: 'RGL',
      format: '6S',
      active: false,
    });
  };

  const cancelEdit = () => {
    setEditingSeason(null);
    resetForm();
  };

  const startAdding = () => {
    setShowAddForm(true);
    setEditingSeason(null);
    resetForm();
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-warmscale-7">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <p className="text-warmscale-1 text-xl">Loading seasons...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-warmscale-7">
      <Navbar />

      <div className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-warmscale-1 mb-2">Season Management</h1>
          <p className="text-warmscale-2">Manage seasons for RGL and OZF leagues</p>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-500 text-red-200 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Filters and Add Button */}
        <div className="bg-warmscale-6 rounded-lg p-6 mb-6 border border-warmscale-5">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-warmscale-1 mb-2 font-medium">Filter by League</label>
              <select
                value={filterLeague}
                onChange={(e) => setFilterLeague(e.target.value)}
                className="w-full bg-warmscale-7 text-warmscale-1 border border-warmscale-5 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500"
              >
                <option value="all">All Leagues</option>
                {leagues.map(league => (
                  <option key={league} value={league}>{league}</option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-warmscale-1 mb-2 font-medium">Filter by Format</label>
              <select
                value={filterFormat}
                onChange={(e) => setFilterFormat(e.target.value)}
                className="w-full bg-warmscale-7 text-warmscale-1 border border-warmscale-5 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500"
              >
                <option value="all">All Formats</option>
                {formats.map(format => (
                  <option key={format} value={format}>{format}</option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-warmscale-1 mb-2 font-medium">Filter by Status</label>
              <select
                value={filterActive}
                onChange={(e) => setFilterActive(e.target.value)}
                className="w-full bg-warmscale-7 text-warmscale-1 border border-warmscale-5 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500"
              >
                <option value="all">All Seasons</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <button
                onClick={startAdding}
                className="w-full bg-accent-500 hover:bg-accent-600 text-white font-semibold py-2 px-6 rounded transition-colors"
              >
                + Add New Season
              </button>
            </div>
          </div>
        </div>

        {/* Add/Edit Form */}
        {(showAddForm || editingSeason) && (
          <div className="bg-warmscale-6 rounded-lg p-6 mb-6 border-2 border-accent-500">
            <h2 className="text-2xl font-bold text-warmscale-1 mb-4">
              {editingSeason ? 'Edit Season' : 'Add New Season'}
            </h2>

            <form onSubmit={editingSeason ? handleUpdateSeason : handleAddSeason}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-warmscale-1 mb-2 font-medium">Season ID *</label>
                  <input
                    type="number"
                    required
                    disabled={!!editingSeason}
                    value={formData.seasonid}
                    onChange={(e) => setFormData({ ...formData, seasonid: e.target.value })}
                    className="w-full bg-warmscale-7 text-warmscale-1 border border-warmscale-5 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500 disabled:opacity-50"
                    placeholder="e.g., 167"
                  />
                </div>

                <div>
                  <label className="block text-warmscale-1 mb-2 font-medium">Season Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.seasonname}
                    onChange={(e) => setFormData({ ...formData, seasonname: e.target.value })}
                    className="w-full bg-warmscale-7 text-warmscale-1 border border-warmscale-5 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500"
                    placeholder="e.g., RGL HL Season 23"
                  />
                </div>

                <div>
                  <label className="block text-warmscale-1 mb-2 font-medium">League *</label>
                  <select
                    required
                    value={formData.league}
                    onChange={(e) => setFormData({ ...formData, league: e.target.value })}
                    className="w-full bg-warmscale-7 text-warmscale-1 border border-warmscale-5 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500"
                  >
                    {leagues.map(league => (
                      <option key={league} value={league}>{league}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-warmscale-1 mb-2 font-medium">Format *</label>
                  <select
                    required
                    value={formData.format}
                    onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                    className="w-full bg-warmscale-7 text-warmscale-1 border border-warmscale-5 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500"
                  >
                    {formats.map(format => (
                      <option key={format} value={format}>{format}</option>
                    ))}
                  </select>
                </div>

              </div>

              <div className="mb-4">
                <label className="flex items-center text-warmscale-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="mr-2 w-5 h-5 accent-accent-500"
                  />
                  <span className="font-medium">Set as Active Season</span>
                  <span className="ml-2 text-warmscale-3 text-sm">(Only one season can be active per league/format)</span>
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-accent-500 hover:bg-accent-600 text-white font-semibold py-2 px-6 rounded transition-colors"
                >
                  {editingSeason ? 'Update Season' : 'Create Season'}
                </button>
                <button
                  type="button"
                  onClick={editingSeason ? cancelEdit : () => setShowAddForm(false)}
                  className="bg-warmscale-5 hover:bg-warmscale-4 text-warmscale-1 font-semibold py-2 px-6 rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Seasons Table */}
        <div className="bg-warmscale-6 rounded-lg overflow-hidden border border-warmscale-5">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-warmscale-5">
                <tr>
                  <th className="px-6 py-3 text-left text-warmscale-1 font-semibold">Season ID</th>
                  <th className="px-6 py-3 text-left text-warmscale-1 font-semibold">Season Name</th>
                  <th className="px-6 py-3 text-left text-warmscale-1 font-semibold">League</th>
                  <th className="px-6 py-3 text-left text-warmscale-1 font-semibold">Format</th>
                  <th className="px-6 py-3 text-left text-warmscale-1 font-semibold">Active</th>
                  <th className="px-6 py-3 text-left text-warmscale-1 font-semibold">Display Card</th>
                  <th className="px-6 py-3 text-left text-warmscale-1 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warmscale-5">
                {filteredSeasons.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-warmscale-3">
                      No seasons found
                    </td>
                  </tr>
                ) : (
                  filteredSeasons.map((season) => (
                    <tr key={season.seasonid} className="hover:bg-warmscale-5/50 transition-colors">
                      <td className="px-6 py-4 text-warmscale-1 font-mono">{season.seasonid}</td>
                      <td className="px-6 py-4 text-warmscale-1">{season.seasonname}</td>
                      <td className="px-6 py-4 text-warmscale-1">
                        <span className="inline-block px-3 py-1 bg-warmscale-5 rounded-full text-sm font-medium">
                          {season.league}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-warmscale-1">
                        <span className="inline-block px-3 py-1 bg-warmscale-5 rounded-full text-sm font-medium">
                          {season.format}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleActive(season.seasonid)}
                          className={`px-4 py-1 rounded-full text-sm font-semibold transition-colors ${
                            season.active
                              ? 'bg-green-500 text-white hover:bg-green-600'
                              : 'bg-warmscale-5 text-warmscale-2 hover:bg-warmscale-4'
                          }`}
                        >
                          {season.active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleDisplayCard(season.seasonid)}
                          className={`px-4 py-1 rounded-full text-sm font-semibold transition-colors ${
                            season.displaycard
                              ? 'bg-accent-500 text-white hover:bg-accent-600'
                              : 'bg-warmscale-5 text-warmscale-2 hover:bg-warmscale-4'
                          }`}
                        >
                          {season.displaycard ? 'Displayed' : 'Not Displayed'}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEditing(season)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded text-sm font-medium transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteSeason(season.seasonid, season.seasonname)}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded text-sm font-medium transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 text-warmscale-3 text-sm">
          Showing {filteredSeasons.length} of {seasons.length} total seasons
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SeasonManagement;
