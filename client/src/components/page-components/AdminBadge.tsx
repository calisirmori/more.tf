import Navbar from '../shared-components/Navbar';
import Footer from '../shared-components/Footer';
import { useState } from 'react';

const Profile = () => {
  const [steamId, setSteamId] = useState('');
  const [badgeId, setBadgeId] = useState('');
  const [newBadgeId, setNewBadgeId] = useState('');
  const [badges, setBadges] = useState([]);

  const validateInput = (steamId: any, badgeId: any) => {
    const isValidSteamId = /^\d+$/.test(steamId); // Steam ID should be numeric
    const isValidBadgeId = badgeId.trim() !== ''; // Badge ID should not be empty
    return isValidSteamId && isValidBadgeId;
  };

  const handleGetBadges = async () => {
    if (!validateInput(steamId, badgeId)) {
      alert('Invalid input');
      return;
    }
    try {
      const response = await fetch(`/api/badges/user?id64=${steamId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error('Failed to retrieve badges');
      setBadges(data);
      alert('Badges retrieved successfully');
    } catch (error) {
      console.error('Error retrieving badges:', error);
      alert('Error retrieving badges');
    }
  };

  const handleAddBadge = async () => {
    if (!validateInput(steamId, badgeId)) {
      alert('Invalid input');
      return;
    }
    try {
      const response = await fetch('/api/badges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id64: steamId, badge_id: badgeId }),
      });
      if (!response.ok) throw new Error('Failed to add badge');
      alert('Badge added successfully');
    } catch (error) {
      console.error('Error adding badge:', error);
      alert('Error adding badge');
    }
  };

  const handleUpdateBadge = async (newBadgeId: any) => {
    if (!validateInput(steamId, badgeId)) {
      alert('Invalid input');
      return;
    }
    try {
      const response = await fetch('/api/badges', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id64: steamId,
          badge_id: badgeId,
          new_badge_id: newBadgeId,
        }),
      });
      if (!response.ok) throw new Error('Failed to update badge');
      alert('Badge updated successfully');
    } catch (error) {
      console.error('Error updating badge:', error);
      alert('Error updating badge');
    }
  };

  const handleDeleteBadge = async () => {
    try {
      const response = await fetch('/api/badges', {
        // Adjusted URL if needed
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id64: steamId, badge_id: badgeId }), // Ensure these names match the server's expected parameters
      });
      if (!response.ok) throw new Error('Failed to delete badge');
      alert('Badge deleted successfully');
    } catch (error) {
      console.error('Error deleting badge:', error);
      alert('Error deleting badge');
    }
  };

  const convertToCSV = (data: any) => {
    const array = [Object.keys(data[0])].concat(data);

    return array
      .map((it) => {
        return Object.values(it).toString();
      })
      .join('\n');
  };

  const downloadCSV = (data: any) => {
    const csvString = convertToCSV(data);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'report.csv');
    document.body.appendChild(link); // Required for FF
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadReport = () => {
    const reportData = badges.map((badge: any) => ({
      SteamID: steamId,
      BadgeID: badge.badge_id,
      DateRetrieved: new Date().toLocaleString(),
    }));

    downloadCSV(reportData);
  };

  return (
    <div
      className="bg-warmscale-7 min-h-screen"
      data-testid="admin-badge-container"
    >
      <Navbar />
      <div className=" flex justify-center items-center text-white h-[68vh]">
        <div>
          <div className="p-5"></div>
          <div className="m-3">
            <label>Steam ID:</label>
            <input
              type="text"
              value={steamId}
              onChange={(e) => setSteamId(e.target.value)}
              className="border px-2 py-1 ml-2 text-black"
            />
          </div>
          <div className="m-3">
            <label>Badge ID:</label>
            <input
              type="text"
              value={badgeId}
              onChange={(e) => setBadgeId(e.target.value)}
              className="border px-2 py-1 ml-2 text-black"
            />
          </div>
          <div className="m-3">
            <label>Badge ID (New - For Updates):</label>
            <input
              type="text"
              value={newBadgeId}
              onChange={(e) => setNewBadgeId(e.target.value)}
              className="border px-2 py-1 ml-2 text-black"
            />
          </div>
          <div className="flex justify-center items-center mt-4">
            <button
              onClick={handleAddBadge}
              className="bg-blue-500 text-white px-4 py-2"
            >
              Add Badge
            </button>
            <button
              onClick={() => handleUpdateBadge(newBadgeId)}
              className="bg-yellow-500 text-white px-4 py-2"
            >
              Update Badge
            </button>
            <button
              onClick={handleDeleteBadge}
              className="bg-red-500 text-white px-4 py-2"
            >
              Delete Badge
            </button>
            <div className="m-3">
              <button
                onClick={handleGetBadges}
                className="bg-blue-500 text-white px-4 py-2"
              >
                Get Badges
              </button>
            </div>
            <div className="items-center">
              {badges.length > 0 && (
                <ul>
                  {badges.map((badge: any, index) => (
                    <li
                      key={index}
                      className="text-white mt-2 font-cantarell font-semibold"
                    >
                      Badge ID: {badge.badge_id}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={handleDownloadReport}
          className="bg-gray-500 text-white px-4 py-2"
        >
          Download Report
        </button>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
