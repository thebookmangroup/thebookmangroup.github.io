// 밤편지 알림 (시안) — 내용 없는 알림을 받으면 오늘 편지를 읽어 와서 보여 준다
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('push', (e) => e.waitUntil((async () => {
  let title = '밤편지가 도착했어요', body = '오늘 밤의 편지를 열어 보세요', no = '';
  try {
    const t = await (await fetch('letters.js', { cache: 'no-store' })).text();
    let rev = {}; try { rev = await (await fetch('/api/letter/review', { cache: 'no-store' })).json() } catch (_) {}
    const L = JSON.parse(t.slice(t.indexOf('['), t.lastIndexOf(']') + 1)).filter(x => x.status !== 'draft' || (rev.letters || {})['n' + x.no]?.status === 'ok');   // 통과 안 한 초안은 알림에도 안 씀
    const now = Date.now(), l = [...L].reverse().find((x) => now >= new Date(`${x.date}T22:00:00+09:00`).getTime()) || L[L.length - 1];
    title = `밤편지 No.${l.no} · ${l.title}`; body = l.hook || l.greeting.split(/(?<=[.?!])\s/)[0]; no = l.no;
  } catch (_) {}
  await self.registration.showNotification(title, { body, tag: 'letter', icon: 'icon-192.png', badge: 'icon-192.png', data: { url: no ? `./#/l/${no}` : './' } });
})()));
self.addEventListener('notificationclick', (e) => { e.notification.close(); e.waitUntil(self.clients.openWindow(e.notification.data?.url || './')) });
