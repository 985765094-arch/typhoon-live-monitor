const toast = document.querySelector('#toast');
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

noticeBtn.addEventListener('click', () => document.querySelector('.action-list').scrollIntoView({ behavior: 'smooth', block: 'center' }));
learnBtn.addEventListener('click', () => showToast('风圈是达到某级风力的可能影响范围')); 

document.querySelectorAll('.map-control').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.map-control').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    showToast(button.dataset.layer === 'wind' ? '已切换至风圈示意图（演示）' : '已切换至路径示意图（演示）');
  });
});
