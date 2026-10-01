/**
 * CourseCraft Authentication Service
 * Manages Multi-Role Identity, Firebase Auth tokens, and 1-Click Demo Personas
 */

window.CourseCraftAuth = (function() {
  const SESSION_KEY = 'coursecraft_session_user';

  // Available Demo Personas
  const PERSONAS = {
    student: {
      uid: "usr_student_01",
      name: "Priya Sharma",
      email: "student@university.edu",
      role: "student",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      department: "B.Tech Computer Science & Engineering",
      semester: "Semester III (2025–29)"
    },
    faculty: {
      uid: "usr_faculty_01",
      name: "Dr. Aarav Sharma",
      email: "faculty@university.edu",
      role: "faculty",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      department: "Continuing Education Centre",
      designation: "Professor & Head of Software Systems"
    },
    admin: {
      uid: "usr_admin_01",
      name: "Prof. Rajesh Nair",
      email: "admin@university.edu",
      role: "admin",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      department: "Continuing Education Centre",
      designation: "Dean of Academic & Continuing Education"
    }
  };

  // Get current logged-in user (null if not logged in)
  function getCurrentUser() {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Error reading session:', e);
    }
    return null;
  }

  // Set active user session
  function setCurrentUser(user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    window.dispatchEvent(new CustomEvent('coursecraft_auth_changed', { detail: user }));
    return user;
  }

  // Switch persona directly
  function switchPersona(role) {
    const persona = PERSONAS[role] || PERSONAS.student;
    setCurrentUser(persona);
    return persona;
  }

  // Login handler
  async function login(email, password, requestedRole) {
    const cleanEmail = (email || '').trim().toLowerCase();

    // 1. Try server API authentication
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password, role: requestedRole })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.user) {
          return setCurrentUser(json.user);
        }
      } else {
        const errJson = await res.json().catch(() => ({}));
        if (errJson.error) {
          throw new Error(errJson.error);
        }
      }
    } catch (apiErr) {
      if (apiErr.message && apiErr.message.includes('Invalid password')) {
        throw apiErr;
      }
      console.warn('API login error, trying persona fallback:', apiErr.message);
    }
    
    // 2. Check if matching any demo persona
    for (const key of Object.keys(PERSONAS)) {
      if (PERSONAS[key].email.toLowerCase() === cleanEmail) {
        return setCurrentUser(PERSONAS[key]);
      }
    }

    // Role-based lookup
    if (requestedRole && PERSONAS[requestedRole]) {
      return setCurrentUser(PERSONAS[requestedRole]);
    }

    // Attempt Firebase Auth if available
    const auth = window.CourseCraftFirebase?.getAuth();
    if (auth && firebase.auth) {
      try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = {
          uid: userCredential.user.uid,
          name: userCredential.user.displayName || email.split('@')[0],
          email: userCredential.user.email,
          role: requestedRole || 'student',
          avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
        };
        return setCurrentUser(user);
      } catch (fbErr) {
        console.warn('Firebase login failed, falling back to local session:', fbErr.message);
      }
    }

    // Local custom user fallback
    const customUser = {
      uid: 'usr_' + Date.now(),
      name: email.split('@')[0].toUpperCase(),
      email: email,
      role: requestedRole || 'student',
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
    };
    return setCurrentUser(customUser);
  }

  // Change Password
  async function changePassword(currentPassword, newPassword) {
    const user = getCurrentUser();
    if (!user) throw new Error('No active user session');

    const res = await fetch('/api/users/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email, uid: user.uid, currentPassword, newPassword })
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Failed to update password');
    }

    if (json.user) {
      user.passwordChangedAt = json.user.passwordChangedAt;
      setCurrentUser(user);
    }
    return json;
  }

  // Logout
  function logout() {
    localStorage.removeItem(SESSION_KEY);
    const auth = window.CourseCraftFirebase?.getAuth();
    if (auth && auth.signOut) {
      auth.signOut().catch(() => {});
    }
    window.location.href = '/login.html';
  }

  // Check role helper
  function hasRole(requiredRole) {
    const user = getCurrentUser();
    if (!user) return false;
    if (user.role === 'admin') return true; // Admin has universal access
    return user.role === requiredRole;
  }

  return {
    getCurrentUser,
    setCurrentUser,
    switchPersona,
    login,
    changePassword,
    logout,
    hasRole,
    PERSONAS
  };
})();
