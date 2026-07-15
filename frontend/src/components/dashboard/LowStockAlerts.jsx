import React from 'react';

const LowStockAlerts = ({ alerts }) => {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="p-4 bg-green-100 rounded">
        <h2 className="text-lg font-semibold mb-2">Low Stock Alerts</h2>
        <p className="text-gray-600">All products are sufficiently stocked.</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-yellow-100 rounded">
      <h2 className="text-lg font-semibold mb-2">Low Stock Alerts</h2>
      <ul className="list-disc list-inside">
        {alerts.map((alert, idx) => (
          <li key={idx} className="text-gray-800">
            {alert.productName} – {alert.quantity} left
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LowStockAlerts;