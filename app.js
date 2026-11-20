const toast = document.querySelector('#toast');
const demoBanner = document.querySelector('.demo-banner');
const sourceName = document.querySelector('.source-top strong');
const sourceDescription = document.querySelector('.source-card p');
const sourceTime = document.querySelector('.source-time strong');
const stormTitle = document.querySelector('.section-heading h2');
const dataCards = document.querySelectorAll('.stat-card');
const refreshBtn = document.querySelector('#refreshBtn');
const noticeBtn = document.querySelector('#noticeBtn');
const learnBtn = document.querySelector('#learnBtn');

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 2400);
}

refreshBtn.addEventListener('click', () => {
  refreshBtn.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(360deg)' }], { duration: 500 });
  showToast('演示数据已刷新 · 更新时间仍为模拟值');
});

function formatTime(value) {
  if (!value) return '暂无更新时间';
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? value : date.toLocaleString('zh-CN', { hour12: false }).replaceAll('/', '/');
}

function renderStorm(storm, fetchedAt) {
  if (!storm) {
    stormTitle.textContent = '当前暂无活跃台风';
    sourceName.textContent = '浙江省台风路径实时发布系统';
    sourceDescription.textContent = '当前接口未返回活跃台风。页面仍会持续由 GitHub Actions 每 15 分钟检查更新。';
    sourceTime.textContent = formatTime(fetchedAt);
    return;
  }
  demoBanner.innerHTML = '<span class="demo-dot"></span>实时数据 · 信息来自浙江省水利厅台风路径实时发布系统，请以当地官方预警为准';
  stormTitle.textContent = `台风「${storm.name}」${storm.enName ? ` / ${storm.enName}` : ''}`;
  const values = [
    `${storm.lat ?? '—'}<span>°N</span> · ${storm.lng ?? '—'}<span>°E</span>`,
    `${storm.moveDirection || '—'} <b>↖</b>`,
    `${storm.power ?? '—'} <span>级</span>`,
    `${storm.pressure ?? '—'} <span>hPa</span>`,
  ];
  dataCards.forEach((card, index) => { const value = card.querySelector('strong'); if (value) value.innerHTML = values[index]; });
  sourceName.textContent = storm.source;
  sourceDescription.textContent = '数据由浙江省水利厅台风路径实时发布系统提供，本站仅做信息展示，不发布或替代官方预警。';
  sourceTime.textContent = formatTime(fetchedAt || storm.time);
}

fetch('data/typhoon.json', { cache: 'no-store' })
  .then((response) => response.ok ? response.json() : Promise.reject(new Error('data unavailable')))
  .then((payload) => renderStorm(payload.storms?.[0], payload.fetchedAt))
  .catch(() => showToast('实时数据暂时不可用，页面保留上次展示内容'));

noticeBtn.addEventListener('click', () => document.querySelector('.action-list').scrollIntoView({ behavior: 'smooth', block: 'center' }));
learnBtn.addEventListener('click', () => showToast('风圈是达到某级风力的可能影响范围')); 

document.querySelectorAll('.map-control').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.map-control').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    showToast(button.dataset.layer === 'wind' ? '已切换至风圈示意图（演示）' : '已切换至路径示意图（演示）');
  });
});
