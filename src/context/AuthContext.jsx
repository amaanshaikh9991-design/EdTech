import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);

  const login = (email, password) => {
    const normalizedEmail = email.trim().toLowerCase();
    const account = users.find(
      registeredUser => registeredUser.email.toLowerCase() === normalizedEmail
        && registeredUser.password === password
    );

    if (!account) return false;

    setUser({ name: account.name, email: account.email, role: account.role });
    return true;
  };

  const signup = (name, email, password, role) => {
    const normalizedEmail = email.trim().toLowerCase();
    const exists = users.find(u => u.email.toLowerCase() === normalizedEmail);
    if (exists) return false;

    const newUser = { name: name.trim(), email: normalizedEmail, password, role };
    setUsers([...users, newUser]);
    return true;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}