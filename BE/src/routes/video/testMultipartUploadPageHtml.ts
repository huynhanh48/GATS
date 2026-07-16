/**
 * Dev-only HTML test page for S3 presigned multipart upload.
 * Bucket CORS must allow PUT from this origin and expose ETag header.
 */
export function renderTestMultipartUploadPageHtml(): string {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Multipart Upload Test – GATS ACADEMY</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            primary: '#0070EB',
            secondary: '#FF7622',
            background: '#F9F9FE',
            card: '#FFFFFF',
            'text-dark': '#1A1A2E',
            'text-body': '#374151',
            'text-muted': '#6B7280',
            border: '#E5E7EB',
            success: '#22C55E',
            error: '#EF4444',
            warning: '#F59E0B',
          },
          fontFamily: { sans: ['Inter', 'sans-serif'] },
          boxShadow: {
            card: '0 2px 12px rgba(0, 112, 235, 0.08)',
          },
        },
      },
    };
  </script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" />
</head>
<body class="bg-background font-sans min-h-screen text-text-body">
  <div class="max-w-3xl mx-auto px-4 py-12">
    <h1 class="text-3xl font-bold text-text-dark mb-2">
      <i class="fa-solid fa-cloud-arrow-up text-primary mr-2"></i>
      Multipart Upload Test
    </h1>
    <p class="text-sm text-text-muted mb-6">
      Upload trực tiếp lên S3 LongVan qua presigned URL. Yêu cầu đăng nhập admin (cookie).
      Bucket CORS: <code class="text-xs bg-card px-1 rounded">ExposeHeaders: ETag</code>
    </p>

    <div class="bg-card rounded-2xl shadow-card p-6 border border-border mb-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-bold text-text-dark">
          <i class="fa-solid fa-lock text-primary mr-2"></i> Đăng nhập admin
        </h2>
        <span id="authStatus" class="text-sm text-text-muted">Đang kiểm tra...</span>
      </div>
      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <label class="block text-sm font-medium text-text-dark mb-1">Email</label>
          <input id="loginEmail" type="email" placeholder="admin@gmail.com" class="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
        </div>
        <div>
          <label class="block text-sm font-medium text-text-dark mb-1">Password</label>
          <input id="loginPassword" type="password" placeholder="••••••••" class="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
        </div>
      </div>
      <div class="flex gap-4 mt-4">
        <button id="loginBtn" class="bg-primary hover:bg-blue-600 active:scale-95 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-sm">
          <i class="fa-solid fa-right-to-bracket mr-2"></i> Đăng nhập
        </button>
        <button id="logoutBtn" class="border border-border text-text-body hover:bg-background font-semibold px-6 py-3 rounded-xl transition-all duration-200">
          <i class="fa-solid fa-right-from-bracket mr-2"></i> Đăng xuất
        </button>
      </div>
    </div>

    <div class="bg-card rounded-2xl shadow-card p-6 border border-border mb-6">
      <div class="grid gap-4">
        <div>
          <label class="block text-sm font-medium text-text-dark mb-1">
            Course
            <button id="reloadCourses" type="button" class="ml-2 text-primary text-xs hover:underline"><i class="fa-solid fa-rotate"></i> Tải lại</button>
          </label>
          <select id="courseId" class="w-full border border-border rounded-xl px-4 py-3 text-sm bg-card focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
            <option value="">-- Đang tải danh sách khóa học --</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-text-dark mb-1">
            Lesson (chỉ hiện bài học dạng video)
          </label>
          <select id="lessonId" class="w-full border border-border rounded-xl px-4 py-3 text-sm bg-card focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
            <option value="">-- Chọn khóa học trước --</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-text-dark mb-1">Title</label>
          <input id="title" type="text" value="Test multipart upload" class="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
        </div>
        <div>
          <label class="block text-sm font-medium text-text-dark mb-1">Video file</label>
          <input id="fileInput" type="file" accept="video/mp4,video/quicktime,video/webm" class="w-full text-sm" />
        </div>
        <div>
          <label class="block text-sm font-medium text-text-dark mb-1">Concurrency</label>
          <input id="concurrency" type="number" value="4" min="1" max="16" class="w-32 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary" />
        </div>
      </div>
      <div class="flex gap-4 mt-6">
        <button id="startBtn" class="bg-secondary hover:bg-orange-500 active:scale-95 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-sm">
          <i class="fa-solid fa-play mr-2"></i> Start Upload
        </button>
        <button id="abortBtn" disabled class="bg-error hover:bg-red-600 active:scale-95 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-sm disabled:opacity-50">
          <i class="fa-solid fa-stop mr-2"></i> Abort
        </button>
      </div>
    </div>

    <div class="bg-card rounded-2xl shadow-card p-6 border border-border">
      <h2 class="text-lg font-bold text-text-dark mb-4"><i class="fa-solid fa-chart-line text-primary mr-2"></i>Progress</h2>
      <div class="w-full bg-border rounded-full h-3 mb-4 overflow-hidden">
        <div id="progressBar" class="bg-primary h-3 rounded-full transition-all duration-300" style="width:0%"></div>
      </div>
      <pre id="log" class="text-xs text-text-muted whitespace-pre-wrap font-mono bg-background p-4 rounded-xl border border-border min-h-[200px] max-h-[400px] overflow-y-auto"></pre>
    </div>
  </div>

  <script>
    const API = '/api/admin/videos';
    const MAX_RETRIES = 3;
    let abortController = null;
    let session = null;

    const logEl = document.getElementById('log');
    const progressBar = document.getElementById('progressBar');
    const startBtn = document.getElementById('startBtn');
    const abortBtn = document.getElementById('abortBtn');
    const courseSelect = document.getElementById('courseId');
    const lessonSelect = document.getElementById('lessonId');
    const reloadCoursesBtn = document.getElementById('reloadCourses');
    const authStatus = document.getElementById('authStatus');
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const loginEmail = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword');

    function log(msg) {
      logEl.textContent += msg + '\\n';
      logEl.scrollTop = logEl.scrollHeight;
    }

    function setProgress(pct) {
      progressBar.style.width = Math.min(100, pct) + '%';
    }

    async function api(path, options = {}) {
      const res = await fetch(API + path, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
        ...options,
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || res.statusText || 'Request failed');
      return body;
    }

    function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

    async function loadCourses() {
      courseSelect.innerHTML = '<option value="">-- Đang tải --</option>';
      lessonSelect.innerHTML = '<option value="">-- Chọn khóa học trước --</option>';
      try {
        const res = await fetch('/api/courses?limit=100', { credentials: 'include' });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.error || 'Không tải được khóa học');
        const courses = body.data || [];
        if (courses.length === 0) {
          courseSelect.innerHTML = '<option value="">(Không có khóa học)</option>';
          return;
        }
        courseSelect.innerHTML = '<option value="">-- Chọn khóa học --</option>';
        for (const c of courses) {
          const opt = document.createElement('option');
          opt.value = c.id;
          opt.textContent = c.title + ' [' + (c.status || '?') + ']';
          courseSelect.appendChild(opt);
        }
      } catch (err) {
        courseSelect.innerHTML = '<option value="">Lỗi: ' + err.message + '</option>';
        log('Load courses error: ' + err.message);
      }
    }

    async function loadLessons(courseId) {
      lessonSelect.innerHTML = '<option value="">-- Đang tải --</option>';
      if (!courseId) {
        lessonSelect.innerHTML = '<option value="">-- Chọn khóa học trước --</option>';
        return;
      }
      try {
        const res = await fetch('/api/courses/' + courseId + '/curriculum', { credentials: 'include' });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.error || 'Không tải được bài học');
        const sections = body.data || [];
        const videoLessons = [];
        for (const section of sections) {
          for (const lesson of (section.lessons || [])) {
            if (lesson.type === 'video') {
              videoLessons.push({ id: lesson.id, label: section.title + ' › ' + lesson.title });
            }
          }
        }
        if (videoLessons.length === 0) {
          lessonSelect.innerHTML = '<option value="">(Không có bài học video)</option>';
          return;
        }
        lessonSelect.innerHTML = '<option value="">-- Chọn bài học --</option>';
        for (const l of videoLessons) {
          const opt = document.createElement('option');
          opt.value = l.id;
          opt.textContent = l.label;
          lessonSelect.appendChild(opt);
        }
      } catch (err) {
        lessonSelect.innerHTML = '<option value="">Lỗi: ' + err.message + '</option>';
        log('Load lessons error: ' + err.message);
      }
    }

    async function checkAuth() {
      try {
        const res = await fetch('/api/user/me', { credentials: 'include' });
        if (!res.ok) throw new Error('unauthorized');
        const body = await res.json().catch(() => ({}));
        const user = body.user || body.data || body;
        const email = user.email || user.userName || 'admin';
        authStatus.textContent = 'Đã đăng nhập: ' + email;
        authStatus.className = 'text-sm text-success font-medium';
        await loadCourses();
        return true;
      } catch {
        authStatus.textContent = 'Chưa đăng nhập';
        authStatus.className = 'text-sm text-error font-medium';
        courseSelect.innerHTML = '<option value="">-- Đăng nhập trước --</option>';
        lessonSelect.innerHTML = '<option value="">-- Đăng nhập trước --</option>';
        return false;
      }
    }

    loginBtn.addEventListener('click', async () => {
      const email = loginEmail.value.trim();
      const password = loginPassword.value;
      if (!email || !password) {
        alert('Nhập email và mật khẩu');
        return;
      }
      loginBtn.disabled = true;
      try {
        const res = await fetch('/api/user/login', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.error || 'Đăng nhập thất bại');
        log('Đăng nhập thành công.');
        await checkAuth();
      } catch (err) {
        log('Login error: ' + err.message);
        alert('Đăng nhập thất bại: ' + err.message);
      } finally {
        loginBtn.disabled = false;
      }
    });

    logoutBtn.addEventListener('click', async () => {
      try {
        await fetch('/api/user/logout', { method: 'POST', credentials: 'include' });
      } catch (err) {
        log('Logout error: ' + err.message);
      }
      await checkAuth();
    });

    courseSelect.addEventListener('change', () => loadLessons(courseSelect.value));
    reloadCoursesBtn.addEventListener('click', loadCourses);
    checkAuth();

    async function uploadPartWithRetry(file, partNumber, partSize, videoId, uploadId, stats) {
      const start = (partNumber - 1) * partSize;
      const end = Math.min(start + partSize, file.size);
      const blob = file.slice(start, end);
      const partBytes = end - start;

      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        if (abortController?.signal.aborted) throw new Error('Aborted');
        try {
          const { data } = await api('/' + videoId + '/multipart/part-url', {
            method: 'POST',
            body: JSON.stringify({ uploadId, partNumber }),
          });

          const putRes = await fetch(data.url, {
            method: 'PUT',
            body: blob,
            signal: abortController?.signal,
          });

          if (!putRes.ok) throw new Error('PUT part ' + partNumber + ' failed: ' + putRes.status);

          const etag = putRes.headers.get('ETag') || putRes.headers.get('etag');
          if (!etag) throw new Error('Missing ETag header – check bucket CORS ExposeHeaders: ETag');

          stats.uploadedBytes += partBytes;
          stats.completedParts += 1;
          const elapsed = (Date.now() - stats.startTime) / 1000;
          const speed = stats.uploadedBytes / elapsed / 1024 / 1024;
          const pct = (stats.uploadedBytes / file.size) * 100;
          setProgress(pct);
          log('Part ' + partNumber + '/' + stats.totalParts + ' OK (' + pct.toFixed(1) + '%, ' + speed.toFixed(2) + ' MB/s)');

          return { partNumber, etag };
        } catch (err) {
          stats.retries += 1;
          if (attempt === MAX_RETRIES) throw err;
          log('Retry part ' + partNumber + ' attempt ' + (attempt + 1) + '...');
          await sleep(1000 * attempt);
        }
      }
    }

    async function runPool(tasks, concurrency) {
      const results = [];
      let index = 0;
      async function worker() {
        while (index < tasks.length) {
          const i = index++;
          results[i] = await tasks[i]();
        }
      }
      await Promise.all(Array.from({ length: concurrency }, worker));
      return results;
    }

    startBtn.addEventListener('click', async () => {
      const file = document.getElementById('fileInput').files[0];
      const courseId = document.getElementById('courseId').value.trim();
      const lessonId = document.getElementById('lessonId').value.trim();
      const title = document.getElementById('title').value.trim();
      const concurrency = parseInt(document.getElementById('concurrency').value, 10) || 4;

      if (!file || !courseId || !lessonId) {
        alert('Nhập courseId, lessonId và chọn file');
        return;
      }

      logEl.textContent = '';
      startBtn.disabled = true;
      abortBtn.disabled = false;
      abortController = new AbortController();
      setProgress(0);

      try {
        log('Init multipart upload...');
        const init = await api('/init-multipart-upload', {
          method: 'POST',
          body: JSON.stringify({
            courseId, lessonId, title,
            filename: file.name,
            contentType: file.type || 'video/mp4',
            size: file.size,
          }),
        });

        const { videoId, uploadId, partSize, totalParts, originalKey } = init.data;
        session = { videoId, uploadId, originalKey };
        log('videoId=' + videoId + ', parts=' + totalParts + ', partSize=' + (partSize/1024/1024).toFixed(1) + 'MB');

        const stats = { uploadedBytes: 0, completedParts: 0, totalParts, startTime: Date.now(), retries: 0 };
        const tasks = [];
        for (let p = 1; p <= totalParts; p++) {
          const partNum = p;
          tasks.push(() => uploadPartWithRetry(file, partNum, partSize, videoId, uploadId, stats));
        }

        log('Uploading ' + totalParts + ' parts (concurrency=' + concurrency + ')...');
        const parts = await runPool(tasks, concurrency);

        log('Completing multipart upload...');
        const complete = await api('/' + videoId + '/multipart/complete', {
          method: 'POST',
          body: JSON.stringify({ uploadId, parts }),
        });

        log('Done! status=' + complete.data.status);
        log('originalKey=' + complete.data.originalKey);
        log('size=' + complete.data.size + ' bytes, retries=' + stats.retries);
        setProgress(100);
      } catch (err) {
        log('ERROR: ' + err.message);
      } finally {
        startBtn.disabled = false;
        abortBtn.disabled = true;
        session = null;
      }
    });

    abortBtn.addEventListener('click', async () => {
      if (abortController) abortController.abort();
      if (session) {
        try {
          await api('/' + session.videoId + '/multipart/abort', {
            method: 'POST',
            body: JSON.stringify({ uploadId: session.uploadId }),
          });
          log('Upload aborted, video record deleted.');
        } catch (err) {
          log('Abort error: ' + err.message);
        }
      }
      abortBtn.disabled = true;
      startBtn.disabled = false;
    });
  </script>
</body>
</html>`;
}
