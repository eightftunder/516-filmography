// 516 filmography service worker
// network-first 전략: 항상 최신을 먼저 시도, 오프라인일 때만 캐시 사용

const CACHE='516-filmography-v1';
const ASSETS=[
  './',
  './filmography.html'
];

// 설치: 새 버전 즉시 대기 없이 활성화 준비
self.addEventListener('install',e=>{
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c=>c.addAll(ASSETS).catch(()=>{}))
  );
});

// 활성화: 옛 캐시 삭제 + 즉시 컨트롤 장악
self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(
      keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))
    )).then(()=>self.clients.claim())
  );
});

// fetch: 네트워크 우선, 실패 시 캐시
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  e.respondWith(
    fetch(e.request).then(res=>{
      // 성공한 응답은 캐시에 갱신 저장
      const copy=res.clone();
      caches.open(CACHE).then(c=>c.put(e.request,copy).catch(()=>{}));
      return res;
    }).catch(()=>caches.match(e.request))
  );
});
