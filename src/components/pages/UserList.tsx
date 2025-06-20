import React, { useEffect, useState } from "react";

type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  departmentOrSector: string;
  createdAt?: string;
};

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/users"); // Change endpoint if needed
        if (!res.ok) throw new Error("Failed to fetch users.");
        const data = await res.json();
        setUsers(data);
      } catch (err: any) {
        setError(err.message || "Error loading users.");
      }
      setLoading(false);
    };
    fetchUsers();
  }, []);

  return (
    <div className="w-full bg-white/90 rounded-2xl shadow-xl border border-indigo-100 p-8 my-8">
      <h2 className="text-2xl font-bold mb-4 text-indigo-900">Registered Users</h2>
      {loading && (
        <div className="text-blue-600 font-medium">Loading users...</div>
      )}
      {error && (
        <div className="text-red-600 font-medium">{error}</div>
      )}
      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-2">
            <thead>
              <tr className="bg-gradient-to-r from-indigo-400 via-blue-400 to-teal-400 text-white">
                <th className="py-3 px-4 rounded-l-xl text-left">Name</th>
                <th className="py-3 px-4 text-left">Email</th>
                <th className="py-3 px-4 text-left">Phone</th>
                <th className="py-3 px-4 text-left">Department/Sector</th>
                <th className="py-3 px-4 rounded-r-xl text-left">Registered</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-indigo-700">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="bg-white hover:bg-indigo-50 transition">
                    <td className="py-2 px-4 font-medium text-indigo-900">{user.name}</td>
                    <td className="py-2 px-4 text-indigo-800">{user.email}</td>
                    <td className="py-2 px-4 text-indigo-800">{user.phone}</td>
                    <td className="py-2 px-4 text-indigo-800">{user.departmentOrSector}</td>
                    <td className="py-2 px-4 text-indigo-700 text-xs">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleString()
                        : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserList;