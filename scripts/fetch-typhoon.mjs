import { mkdir, writeFile } from 'node:fs/promises';

const API = 'https://typhoon.slt.zj.gov.cn/Api';
const headers = { Referer: 'https://typhoon.slt.zj.gov.cn/', Accept: 'application/json' };

async function getJson(url) {
  const response = await fetch(url, { headers, signal: AbortSignal.timeout(20_000) });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`);
  return response.json();
}

const number = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const maxRadius = (value) => {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return null;
  const values = value.split('|').map(Number).filter((item) => item > 0);
  return values.length ? Math.max(...values) : null;
};

const active = await getJson(`${API}/TyhoonActivity`);
const storms = [];

for (const item of Array.isArray(active) ? active : []) {
  const detail = await getJson(`${API}/TyphoonInfo/${item.tfid}`);
  const points = Array.isArray(detail.points) ? detail.points : [];
  const current = points.at(-1) || item;
  const agency = current.forecast?.find((entry) => entry.tm === '中国') || current.forecast?.[0];

  storms.push({
    id: String(item.tfid ?? ''), name: item.name || item.chname || '未命名台风', enName: item.enname || '',
    level: item.strong || current.strong || '', power: number(item.power ?? current.power),
    lat: number(item.lat ?? current.lat), lng: number(item.lng ?? current.lng),
    windSpeed: number(item.speed ?? current.speed), pressure: number(item.pressure ?? current.pressure),
    moveDirection: item.movedirection || current.movedirection || '', moveSpeed: number(item.movespeed ?? current.movespeed),
    radius7: maxRadius(item.radius7 ?? current.radius7), radius10: maxRadius(item.radius10 ?? current.radius10),
    time: item.time || current.time || new Date().toISOString(),
    track: points.map((point) => ({ time: point.time, lat: number(point.lat), lng: number(point.lng), power: number(point.power) })).filter((point) => point.lat !== null && point.lng !== null),
    forecast: (agency?.forecastpoints || []).map((point) => ({ time: point.time, lat: number(point.lat), lng: number(point.lng), power: number(point.power), windSpeed: number(point.speed) })).filter((point) => point.lat !== null && point.lng !== null),
    source: '浙江省水利厅台风路径实时发布系统', sourceUrl: 'https://typhoon.slt.zj.gov.cn/',
  });
}

const payload = { fetchedAt: new Date().toISOString(), source: '浙江省水利厅台风路径实时发布系统', sourceUrl: 'https://typhoon.slt.zj.gov.cn/', storms };
await mkdir('data', { recursive: true });
await writeFile('data/typhoon.json', `${JSON.stringify(payload, null, 2)}\n`);
console.log(`Saved ${storms.length} active storm(s) at ${payload.fetchedAt}`);
