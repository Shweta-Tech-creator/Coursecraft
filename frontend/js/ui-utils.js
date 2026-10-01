/**
 * CourseCraft UI Utilities (Toasts, Modals, Formatters)
 */

window.UIUtils = (function() {
  // Toast Notification System
  function showToast(message, type = 'info', duration = 3500) {
    let container = document.getElementById('coursecraft-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'coursecraft-toast-container';
      container.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 99999;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 380px;
      `;
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    const bgColors = {
      success: '#059669',
      error: '#dc2626',
      warning: '#d97706',
      info: '#2563eb'
    };
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };

    toast.style.cssText = `
      background: ${bgColors[type] || bgColors.info};
      color: #ffffff;
      padding: 14px 18px;
      border-radius: 8px;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      gap: 12px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 14px;
      font-weight: 500;
      opacity: 0;
      transform: translateY(15px);
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    `;

    toast.innerHTML = `<span style="font-size:18px;font-weight:700;">${icons[type] || 'ℹ'}</span> <div>${message}</div>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    }, 10);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(15px)';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  // Modal Manager
  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  // Open Firebase Configuration Modal
  function openFirebaseConfigModal() {
    let modal = document.getElementById('modal-firebase-config');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modal-firebase-config';
      modal.className = 'modal-overlay';
      const currentConfig = window.CourseCraftFirebase ? window.CourseCraftFirebase.getConfig() : {};

      modal.innerHTML = `
        <div class="modal-card" style="max-width: 550px; background:#1e293b; color:#fff; border: 1px solid #334155; border-radius: 12px; padding: 24px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 16px;">
            <h3 style="margin:0; font-size: 18px; font-weight: 700; color:#38bdf8; display:flex; align-items:center; gap:8px;">
              🔥 Firebase Configuration (Project: coursecraft-c31f9)
            </h3>
            <button onclick="UIUtils.closeModal('modal-firebase-config')" style="background:none; border:none; color:#94a3b8; font-size:22px; cursor:pointer;">&times;</button>
          </div>
          <p style="font-size: 13px; color: #94a3b8; line-height: 1.5; margin-bottom: 16px;">
            CourseCraft is connected to your live Firebase project (<code>${currentConfig.projectId || 'coursecraft-c31f9'}</code>). You can review or adjust credentials below.
          </p>
          <div style="display:flex; flex-direction:column; gap:10px; font-size:13px;">
            <div>
              <label style="color:#cbd5e1; font-weight:600; display:block; margin-bottom:4px;">Project ID</label>
              <input id="cfg-proj-id" type="text" value="${currentConfig.projectId || ''}" style="width:100%; padding:8px 12px; background:#0f172a; border:1px solid #334155; color:#fff; border-radius:6px; font-family:monospace;">
            </div>
            <div>
              <label style="color:#cbd5e1; font-weight:600; display:block; margin-bottom:4px;">API Key</label>
              <input id="cfg-api-key" type="text" value="${currentConfig.apiKey || ''}" style="width:100%; padding:8px 12px; background:#0f172a; border:1px solid #334155; color:#fff; border-radius:6px; font-family:monospace;">
            </div>
            <div>
              <label style="color:#cbd5e1; font-weight:600; display:block; margin-bottom:4px;">Auth Domain</label>
              <input id="cfg-auth-dom" type="text" value="${currentConfig.authDomain || ''}" style="width:100%; padding:8px 12px; background:#0f172a; border:1px solid #334155; color:#fff; border-radius:6px; font-family:monospace;">
            </div>
            <div>
              <label style="color:#cbd5e1; font-weight:600; display:block; margin-bottom:4px;">Storage Bucket</label>
              <input id="cfg-storage" type="text" value="${currentConfig.storageBucket || ''}" style="width:100%; padding:8px 12px; background:#0f172a; border:1px solid #334155; color:#fff; border-radius:6px; font-family:monospace;">
            </div>
          </div>
          <div style="margin-top: 20px; display:flex; justify-content:space-between; align-items:center;">
            <button onclick="CourseCraftFirebase.resetConfig()" style="background:#475569; color:#fff; border:none; padding:8px 14px; border-radius:6px; cursor:pointer; font-size:13px;">Reset to Default</button>
            <div style="display:flex; gap:8px;">
              <button onclick="UIUtils.closeModal('modal-firebase-config')" style="background:transparent; color:#94a3b8; border:1px solid #475569; padding:8px 14px; border-radius:6px; cursor:pointer; font-size:13px;">Cancel</button>
              <button onclick="UIUtils.saveFirebaseConfig()" style="background:#0284c7; color:#fff; border:none; padding:8px 16px; border-radius:6px; cursor:pointer; font-weight:600; font-size:13px;">Save & Apply</button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }
    openModal('modal-firebase-config');
  }

  function saveFirebaseConfig() {
    const updated = {
      projectId: document.getElementById('cfg-proj-id').value,
      apiKey: document.getElementById('cfg-api-key').value,
      authDomain: document.getElementById('cfg-auth-dom').value,
      storageBucket: document.getElementById('cfg-storage').value
    };
    if (window.CourseCraftFirebase) {
      window.CourseCraftFirebase.saveConfig(updated);
      showToast('Firebase settings updated!', 'success');
    }
  }

  return {
    showToast,
    openModal,
    closeModal,
    openFirebaseConfigModal,
    saveFirebaseConfig
  };
})();
