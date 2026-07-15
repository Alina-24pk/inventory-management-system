import React from 'react';

const RecentActivity = ({ activity, className }) => {
  if (!activity || activity.length === 0) {
    return (
      <div className={`p-4 bg-gray-100 rounded ${className || ''}`}>
        <h2 className="text-lg font-semibold mb-2">Recent Activity</h2>
        <p className="text-gray-600">No recent activity.</p>
      </div>
    );
  }

  return (
    <div className={`p-4 bg-gray-100 rounded ${className || ''}`}>
      <h2 className="text-lg font-semibold mb-2">Recent Activity</h2>
      <ul className="list-disc list-inside">
        {activity.map((item, idx) => (
          <li key={idx} className="text-gray-800">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentActivity;