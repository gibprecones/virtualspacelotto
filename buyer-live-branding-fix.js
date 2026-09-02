(function () {
  function read(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
    catch (error) { return fallback; }
  }

  function sellerProfile() {
    const profiles = read('vslSellerProfiles', {});
    const emails = Object.keys(profiles);
    if (emails.length) return profiles[emails[0]];
    const apps = read('vslApplications', []);
    const approved = apps.find((item) => String(item.status || '').toLowerCase() === 'approved') || {};
    return { companyName: approved.businessName || approved.name || 'Virtual Space Lotto', storeId: approved.storeId || 'VSL-DEMO' };
  }

  function liveViewerCount() {
    const viewers = read('vslLiveViewers', []);
    const now = Date.now();
    if (Array.isArray(viewers)) return viewers.filter((item) => now - (item.lastSeen || item.seen || 0) < 15000).length;
    return Number(localStorage.getItem('vslLiveViewerCount') || 0);
  }

  function followingCount() {
    const followers = read('vslFollowers', []);
    if (Array.isArray(followers)) return followers.length;
    return Number(localStorage.getItem('vslFollowerCount') || document.getElementById('followers')?.textContent || 0);
  }

  function ensureBrandBar() {
    const video = document.querySelector('.video');
    if (!video || document.querySelector('.buyer-live-brandbar')) return;
    const bar = document.createElement('div');
    bar.className = 'buyer-live-brandbar';
    bar.innerHTML = '<div><span class="buyer-live-company">Virtual Space Lotto</span><small class="buyer-live-store-id">VSL-DEMO</small></div><div class="buyer-live-metrics"><span id="buyerFollowingMetric">0 following</span><span id="buyerViewerMetric">0 viewers</span></div>';
    video.appendChild(bar);
  }

  function restoreControlPlacement() {
    const video = document.querySelector('.video');
    if (!video) return;
    const play = document.querySelector('.viewer-play-link');
    if (play && play.parentElement !== video) video.appendChild(play);
    const top = video.querySelector('.viewer-top-controls');
    const guide = document.querySelector('.video-guide-button');
    if (top && guide && guide.parentElement !== top) top.appendChild(guide);
    document.querySelectorAll('.customer-top-actions button, .customer-top-actions .account-button').forEach((button) => {
      button.hidden = false;
      button.style.removeProperty('display');
    });
  }

  function updateBrandBar() {
    ensureBrandBar();
    restoreControlPlacement();
    const profile = sellerProfile();
    const company = document.querySelector('.buyer-live-company');
    const store = document.querySelector('.buyer-live-store-id');
    const following = document.getElementById('buyerFollowingMetric');
    const viewers = document.getElementById('buyerViewerMetric');
    if (company) company.textContent = profile.companyName || 'Virtual Space Lotto';
    if (store) store.textContent = profile.storeId || 'VSL-DEMO';
    if (following) following.textContent = followingCount() + ' following';
    if (viewers) viewers.textContent = liveViewerCount() + ' viewers';
  }

  function removeDuplicateLoading() {
    document.body.classList.add('buyer-live-ready');
    document.querySelectorAll('.loading,.page-loading,#loading').forEach((node) => { node.style.display = 'none'; });
  }

  document.addEventListener('DOMContentLoaded', () => { updateBrandBar(); removeDuplicateLoading(); });
  setInterval(updateBrandBar, 400);
  setTimeout(removeDuplicateLoading, 1200);
})();
