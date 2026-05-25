// Conexão do front-end (HTML + Bootstrap) com a API Flask
// Ajuste API_BASE se o backend estiver noutro host/porta.
const API_BASE = (window.API_BASE || 'https://twolados.onrender.com/api').replace(/\/+$/, '');

// Helper genérico para GET/POST com fetch + cookies de sessão
async function apiRequest(path, { method = 'GET', body } = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include', // mantém cookie de sessão Flask
  });

  // Tenta extrair JSON mesmo em erros 4xx/5xx
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const msg = data.error || data.message || `Erro ${response.status}`;
    throw new Error(msg);
  }
  return data;
}

// ---------- PORTFÓLIO PÚBLICO ----------
async function loadPortfolio() {
  const container = document.getElementById('portfolio-grid');
  if (!container) return;

  container.innerHTML = '<div class="text-muted">A carregar portfólio...</div>';
  try {
    const { portfolio } = await apiRequest('/portfolio');
    if (!portfolio || !portfolio.length) {
      container.innerHTML = '<div class="text-muted">Nenhum item disponível.</div>';
      return;
    }
    container.innerHTML = '';
    portfolio.forEach((item) => container.appendChild(renderPortfolioCard(item)));
  } catch (err) {
    container.innerHTML = `<div class="text-danger">Erro: ${err.message}</div>`;
  }
}

function renderPortfolioCard(item) {
  const col = document.createElement('div');
  col.className = 'col-md-4 col-sm-6 mb-4';
  col.innerHTML = `
    <div class="card h-100 shadow-sm">
      ${item.image_url ? `<img src="${item.image_url}" class="card-img-top" alt="${item.title}">` : ''}
      <div class="card-body">
        <h5 class="card-title mb-2">${item.title}</h5>
        <p class="text-secondary small mb-1">${item.category || 'Projeto'}</p>
        <p class="card-text">${item.description || ''}</p>
        <p class="text-muted small mb-0">
          ${item.location ? `<span class="me-2">📍 ${item.location}</span>` : ''}
          ${item.year ? `<span class="me-2">📅 ${item.year}</span>` : ''}
          ${item.area_sqm ? `<span>📐 ${item.area_sqm} m²</span>` : ''}
        </p>
      </div>
    </div>
  `;
  return col;
}

// ---------- PROJETOS PÚBLICOS ----------
async function loadPublicProjects() {
  const container = document.getElementById('projects-grid');
  if (!container) return;

  container.innerHTML = '<div class="text-muted">A carregar projetos...</div>';
  try {
    const { projects } = await apiRequest('/projects/public');
    if (!projects || !projects.length) {
      container.innerHTML = '<div class="text-muted">Nenhum projeto disponível.</div>';
      return;
    }
    container.innerHTML = '';
    projects.forEach((project) => container.appendChild(renderProjectCard(project)));
  } catch (err) {
    container.innerHTML = `<div class="text-danger">Erro: ${err.message}</div>`;
  }
}

function renderProjectCard(project) {
  const col = document.createElement('div');
  col.className = 'col-md-4 col-sm-6 mb-4';
  const badgeClass =
    project.status === 'concluido'
      ? 'bg-success'
      : project.status === 'em_progresso'
      ? 'bg-warning text-dark'
      : 'bg-secondary';

  col.innerHTML = `
    <div class="card h-100 border-0 shadow-sm">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-start mb-2">
          <h5 class="card-title mb-0">${project.title}</h5>
          <span class="badge ${badgeClass} text-uppercase">${project.status || 'N/D'}</span>
        </div>
        <p class="text-secondary small mb-1">${project.category || 'Projeto'}</p>
        <p class="card-text">${project.description || ''}</p>
        <p class="text-muted small mb-0">
          ${project.location ? `<span class="me-2">📍 ${project.location}</span>` : ''}
          ${project.area_sqm ? `<span>📐 ${project.area_sqm} m²</span>` : ''}
        </p>
      </div>
    </div>
  `;
  return col;
}

// ---------- FORMULÁRIOS (CONTACTO & AGENDAMENTO/ORÇAMENTO) ----------
async function handleContactSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const btn = form.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.innerText = 'A enviar...';

  const payload = {
    name: form.querySelector('#contact-name')?.value?.trim() || '',
    email: form.querySelector('#contact-email')?.value?.trim() || '',
    phone: form.querySelector('#contact-phone')?.value?.trim() || '',
    subject: form.querySelector('#contact-subject')?.value?.trim() || '',
    content: form.querySelector('#contact-message')?.value?.trim() || '',
  };

  try {
    await apiRequest('/contact', { method: 'POST', body: payload });
    showAlert('contact-alert', 'Mensagem enviada! Vamos responder em breve.', 'success');
    form.reset();
  } catch (err) {
    showAlert('contact-alert', err.message, 'danger');
  } finally {
    btn.disabled = false;
    btn.innerText = 'Enviar';
  }
}

async function handleScheduleSubmit(event) {
  // Usa o endpoint público de orçamentos/agendamento: POST /quotes
  event.preventDefault();
  const form = event.target;
  const btn = form.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.innerText = 'A enviar...';

  const payload = {
    name: form.querySelector('#schedule-name')?.value?.trim() || '',
    email: form.querySelector('#schedule-email')?.value?.trim() || '',
    phone: form.querySelector('#schedule-phone')?.value?.trim() || '',
    project_type: form.querySelector('#schedule-type')?.value?.trim() || '',
    preferred_date: form.querySelector('#schedule-date')?.value?.trim() || '',
    description: form.querySelector('#schedule-notes')?.value?.trim() || '',
    budget: form.querySelector('#schedule-budget')?.value?.trim() || '',
  };

  try {
    await apiRequest('/quotes', { method: 'POST', body: payload });
    showAlert('schedule-alert', 'Pedido enviado! Confirmaremos por e-mail.', 'success');
    form.reset();
  } catch (err) {
    showAlert('schedule-alert', err.message, 'danger');
  } finally {
    btn.disabled = false;
    btn.innerText = 'Enviar';
  }
}

function showAlert(alertId, message, type = 'info') {
  const el = document.getElementById(alertId);
  if (el) {
    el.className = `alert alert-${type}`;
    el.innerText = message;
    el.classList.remove('d-none');
  } else {
    // fallback console
    console[type === 'danger' ? 'error' : 'log'](message);
  }
}

// ---------- AUTENTICAÇÃO + DASHBOARD ----------
async function handleLogin(event) {
  event.preventDefault();
  const form = event.target;
  const btn = form.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.innerText = 'A entrar...';

  const payload = {
    email: form.querySelector('#login-email')?.value?.trim() || '',
    password: form.querySelector('#login-password')?.value || '',
    remember: true,
  };

  try {
    const data = await apiRequest('/login', { method: 'POST', body: payload });
    // guarda utilizador para uso no dashboard
    localStorage.setItem('dl_user', JSON.stringify(data.user));
    window.location.href = '/dashboard.html';
  } catch (err) {
    showAlert('login-alert', err.message, 'danger');
  } finally {
    btn.disabled = false;
    btn.innerText = 'Entrar';
  }
}

async function loadDashboard() {
  const container = document.getElementById('dashboard-container');
  if (!container) return;

  container.innerHTML = '<div class="text-muted">A carregar dashboard...</div>';
  try {
    const data = await apiRequest('/admin/dashboard');
    renderDashboard(container, data);
  } catch (err) {
    container.innerHTML = `<div class="alert alert-danger">Erro: ${err.message}. Confirme se a sessão continua ativa.</div>`;
  }
}

function renderDashboard(container, data) {
  const user = JSON.parse(localStorage.getItem('dl_user') || '{}');
  const welcome = user.username ? `Olá, ${user.username}!` : 'Dashboard';

  container.innerHTML = `
    <div class="mb-4">
      <h4 class="mb-1">${welcome}</h4>
      <p class="text-muted mb-0">Resumo rápido das suas métricas.</p>
    </div>
    <div class="row g-3">
      ${renderStatCard('Projetos Ativos', data?.projects_active)}
      ${renderStatCard('Projetos Concluídos', data?.projects_completed)}
      ${renderStatCard('Mensagens Novas', data?.messages_new)}
      ${renderStatCard('Orçamentos Pendentes', data?.quotes_pending)}
    </div>
  `;
}

function renderStatCard(label, value) {
  return `
    <div class="col-6 col-md-3">
      <div class="card shadow-sm border-0 h-100">
        <div class="card-body text-center">
          <div class="display-6 fw-bold">${value ?? 0}</div>
          <p class="text-muted mb-0">${label}</p>
        </div>
      </div>
    </div>
  `;
}

// ---------- BOOTSTRAP ----------
document.addEventListener('DOMContentLoaded', () => {
  // Listagens públicas
  loadPortfolio();
  loadPublicProjects();

  // Formulários
  const contactForm = document.getElementById('contact-form');
  if (contactForm) contactForm.addEventListener('submit', handleContactSubmit);

  const scheduleForm = document.getElementById('schedule-form');
  if (scheduleForm) scheduleForm.addEventListener('submit', handleScheduleSubmit);

  const loginForm = document.getElementById('login-form');
  if (loginForm) loginForm.addEventListener('submit', handleLogin);

  // Dashboard (apenas na página de dashboard)
  loadDashboard();
});
