/**
 * CourseCraft Route Protection Guard & Portal Navigation Bar
 */

(function() {
  function checkAccess() {
    const user = window.CourseCraftAuth ? window.CourseCraftAuth.getCurrentUser() : null;
    const path = window.location.pathname;

    if (!user && !path.endsWith('login.html') && !path.endsWith('index.html') && path !== '/') {
      window.location.href = '/login.html?redirect=' + encodeURIComponent(path);
      return;
    }

    // Role-specific route boundaries
    if (path.includes('/faculty/') && user.role !== 'faculty' && user.role !== 'admin') {
      window.CourseCraftAuth.switchPersona('faculty');
      window.location.reload();
      return;
    }

    if (path.includes('/administrator/') && user.role !== 'admin') {
      window.CourseCraftAuth.switchPersona('admin');
      window.location.reload();
      return;
    }
  }

  // Run access check on load
  document.addEventListener('DOMContentLoaded', () => {
    checkAccess();
    renderCommonUserWidget();
  });

  // Global search shortcut (Cmd+K / Ctrl+K)
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      const searchInput = document.getElementById('nav-global-search') || 
                          document.getElementById('catalog-search') || 
                          document.getElementById('course-search-input');
      if (searchInput) {
        e.preventDefault();
        searchInput.focus();
        if (searchInput.select) searchInput.select();
      }
    }
  });

  // Toggle user dropdown
  window.toggleUserNavDropdown = function(e) {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const dropdown = document.getElementById('user-nav-dropdown');
    const chevron = document.getElementById('user-dropdown-chevron');
    if (dropdown) {
      const isOpen = dropdown.classList.toggle('open');
      if (chevron) {
        chevron.style.transform = isOpen ? 'rotate(180deg)' : 'rotate(0deg)';
      }
    }
  };

  // Close dropdown on click outside
  document.addEventListener('click', (e) => {
    const wrap = document.getElementById('user-dropdown-wrapper');
    const dropdown = document.getElementById('user-nav-dropdown');
    const chevron = document.getElementById('user-dropdown-chevron');
    if (dropdown && dropdown.classList.contains('open')) {
      if (!wrap || !wrap.contains(e.target)) {
        dropdown.classList.remove('open');
        if (chevron) chevron.style.transform = 'rotate(0deg)';
      }
    }
  });

  // Render sleek SaaS user menu widget in navigation bar
  function renderCommonUserWidget() {
    const widgetTarget = document.getElementById('user-profile-badge');
    if (!widgetTarget) return;

    const user = window.CourseCraftAuth ? window.CourseCraftAuth.getCurrentUser() : null;
    if (!user) return;

    const roleName = user.role === 'admin' ? 'Administrator' : (user.role === 'faculty' ? 'Faculty Lead' : 'Enrolled Student');
    const roleBadgeBg = user.role === 'admin' ? '#fee2e2' : (user.role === 'faculty' ? '#ede9fe' : '#ecfdf5');
    const roleBadgeColor = user.role === 'admin' ? '#b91c1c' : (user.role === 'faculty' ? '#6d28d9' : '#047857');
    const roleBorder = user.role === 'admin' ? '#fca5a5' : (user.role === 'faculty' ? '#ddd6fe' : '#a7f3d0');

    let menuLinksHtml = '';
    if (user.role === 'student') {
      menuLinksHtml = `
        <a href="/student/dashboard.html?tab=overview" class="dropdown-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
          <span>Dashboard Overview</span>
        </a>
        <a href="/student/dashboard.html?tab=enrolled" class="dropdown-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-0.5-.05"/><path d="M6 6h10"/><path d="M6 10h10"/></svg>
          <span>My Enrolled Courses</span>
        </a>
        <a href="/student/dashboard.html?tab=certificates" class="dropdown-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
          <span>Verified Certificates</span>
        </a>
        <a href="/student/dashboard.html?tab=payments" class="dropdown-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
          <span>Payment Receipts</span>
        </a>
        <a href="/student/dashboard.html?tab=feedback" class="dropdown-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <span>Queries &amp; Feedback</span>
        </a>
        <a href="/student/dashboard.html?tab=settings" class="dropdown-item" onclick="if(window.switchTab){window.switchTab('settings'); return false;}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          <span>Account Settings &amp; Password</span>
        </a>
      `;
    } else if (user.role === 'faculty') {
      menuLinksHtml = ``;
    } else if (user.role === 'admin') {
      menuLinksHtml = ``;
    }

    widgetTarget.innerHTML = `
      <div class="user-profile-menu-wrap" id="user-dropdown-wrapper">
        <div class="user-profile-capsule" onclick="window.toggleUserNavDropdown(event)" title="Account options">
          <img src="${user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}" alt="${user.name}" class="user-avatar-img">
          <div class="user-info-text">
            <div class="user-info-name">${user.name}</div>
            <div class="user-info-role">${roleName}</div>
          </div>
          <svg id="user-dropdown-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 2px; transition: transform 0.15s ease;"><path d="m6 9 6 6 6-6"/></svg>
        </div>

        <div class="nav-dropdown-popover" id="user-nav-dropdown">
          <div style="padding: 10px 12px; border-bottom: 1px solid #f1f5f9; margin-bottom: 4px;">
            <div style="font-weight: 700; font-size: 13.5px; color: #0f172a; line-height: 1.2;">${user.name}</div>
            <div style="font-size: 11.5px; color: #64748b; margin-top: 2px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${user.email}</div>
            <div style="margin-top: 6px;">
              <span style="display: inline-block; font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 4px; background: ${roleBadgeBg}; color: ${roleBadgeColor}; border: 1px solid ${roleBorder}; letter-spacing: 0.3px; text-transform: uppercase;">${roleName}</span>
            </div>
          </div>

          ${menuLinksHtml}

          <div style="height: 1px; background: #f1f5f9; margin: 4px 0;"></div>

          <button onclick="window.CourseCraftAuth.logout()" class="dropdown-item dropdown-item-danger">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    `;
  }
})();
