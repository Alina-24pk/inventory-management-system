import React from 'react';

// Simple header with navigation links
const Header = () => {
  return (
    <header className="bg-gray-800 text-white p-4">
      <nav>
        <ul className="flex space-x-4">
          <li><a href="/" className="hover:underline">Home</a></li>
          <li><a href="/products" className="hover:underline">Products</a></li>
          <li><a href="/inventory" className="hover:underline">Inventory</a></li>
          <li><a href="/orders" className="hover:underline">Orders</a></li>
          <li><a href="/suppliers" className="hover:underline">Suppliers</a></li>
          <li><a href="/categories" className="hover:underline">Categories</a></li>
          <li><a href="/login" className="hover:underline">Login</a></li>
          <li><a href="/register" className="hover:underline">Register</a></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;