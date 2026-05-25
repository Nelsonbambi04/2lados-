// Serviço de acesso à API (frontend React)
// Ajuste API_BASE via env Vite: VITE_API_URL

export interface Property {
  id: string | number;
  title: string;
  price: number;
  location: string;
  image?: string;
  image_url?: string;
}

export interface PortfolioItem {
  id: number;
  title: string;
  description?: string;
  category: string;
  image_url?: string;
  location?: string;
  area_sqm?: number;
  year?: number;
  is_active?: boolean;
}

export interface Quote {
  id: number;
  client_name: string;
  client_email: string;
  service_type: string;
  status: string;
  admin_notes?: string;
}

export interface MessageItem {
  id: number;
  user_id?: number;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  content: string;
  sender_role?: 'admin' | 'client';
  attachment_url?: string;
  attachment_name?: string;
  attachment_type?: string;
  created_at: string;
  is_read: boolean;
  is_replied?: boolean;
}

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  is_admin: boolean;
  is_active: boolean;
  created_at: string;
  projects_count: number;
}

export type PublicationCategory = 'noticia' | 'atividade' | 'evento' | 'publicidade' | 'obra' | 'recrutamento';

export interface Publication {
  id: number;
  title: string;
  summary?: string;
  content: string;
  category: PublicationCategory;
  image_url?: string;
  link_url?: string;
  event_date?: string;
  location?: string;
  is_featured?: boolean;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ClientProfile {
  user: { id: number; username: string; email: string; created_at: string };
  projects: Array<{
    id: number;
    title: string;
    description?: string;
    category?: string;
    status?: string;
    location?: string;
    area_sqm?: number;
    created_at: string;
  }>;
  messages: Array<{
    id: number;
    subject?: string;
    content: string;
    created_at: string;
    is_read: boolean;
    is_replied: boolean;
    sender_role?: 'admin' | 'client';
    attachment_url?: string;
    attachment_name?: string;
    attachment_type?: string;
  }>;
}

export const API_BASE = (import.meta.env.VITE_API_URL ?? 'https://twolados.onrender.com/api').replace(/\/+$/, '');

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const apiPath = path.startsWith('/') ? path : `/${path}`;
  const res = await fetch(`${API_BASE}${apiPath}`, {
    credentials: 'include',
    headers: {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers || {}),
    },
    ...options,
    body:
      options.body instanceof FormData
        ? options.body
        : options.body
        ? JSON.stringify(options.body)
        : undefined,
  });
  const data = (await res.json().catch(() => ({}))) as any;
  if (!res.ok) throw new Error(data.error || data.message || `Erro ${res.status}`);
  return data as T;
}

// Imóveis (exemplo existente)
export async function getProperties(): Promise<Property[]> {
  return request<Property[]>('/properties');
}

// Portfolio admin
export const getAdminPortfolio = () =>
  request<{ portfolio: PortfolioItem[] }>('/admin/portfolio');

export const getPublicPortfolio = () =>
  request<{ portfolio: PortfolioItem[] }>('/portfolio');

export const createPortfolio = (payload: Partial<PortfolioItem>) =>
  request<{ item: { id: number } }>('/admin/portfolio', { method: 'POST', body: payload as any });

export const updatePortfolio = (id: number, payload: Partial<PortfolioItem>) =>
  request<{ message: string }>(`/admin/portfolio/${id}`, { method: 'PUT', body: payload as any });

export const deletePortfolio = (id: number) =>
  request<{ message: string }>(`/admin/portfolio/${id}`, { method: 'DELETE' });

export const uploadPortfolioImage = (id: number, file: File) => {
  const fd = new FormData();
  fd.append('image', file);
  return request<{ message: string }>(`/admin/portfolio/${id}/image`, {
    method: 'POST',
    body: fd,
  });
};

// Utilizadores / clientes admin
export const getAdminUsers = () =>
  request<{ users: AdminUser[] }>('/admin/users');

export const createAdminUser = (payload: {
  username: string;
  email: string;
  password: string;
  is_admin?: boolean;
}) =>
  request<{ user: AdminUser; message: string }>('/admin/users', {
    method: 'POST',
    body: payload as any,
  });

export const updateAdminUser = (id: number, payload: Partial<Pick<AdminUser, 'is_admin' | 'is_active'>>) =>
  request<{ message: string }>(`/admin/users/${id}`, {
    method: 'PUT',
    body: payload as any,
  });

export const deleteAdminUser = (id: number) =>
  request<{ message: string }>(`/admin/users/${id}`, { method: 'DELETE' });

// Publicacoes
export const getPublicPublications = (category?: PublicationCategory | '') =>
  request<{ publications: Publication[] }>(
    category ? `/publications?category=${encodeURIComponent(category)}` : '/publications'
  );

export const getAdminPublications = () =>
  request<{ publications: Publication[] }>('/admin/publications');

export const createPublication = (payload: Partial<Publication>) =>
  request<{ publication: Publication }>('/admin/publications', {
    method: 'POST',
    body: payload as any,
  });

export const updatePublication = (id: number, payload: Partial<Publication>) =>
  request<{ publication: Publication }>(`/admin/publications/${id}`, {
    method: 'PUT',
    body: payload as any,
  });

export const deletePublication = (id: number) =>
  request<{ message: string }>(`/admin/publications/${id}`, { method: 'DELETE' });

export const submitJobApplication = (payload: {
  publication_id: number;
  publication_title: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  cv: File;
}) => {
  const fd = new FormData();
  fd.append('publication_id', String(payload.publication_id));
  fd.append('publication_title', payload.publication_title);
  fd.append('name', payload.name);
  fd.append('email', payload.email);
  fd.append('phone', payload.phone);
  fd.append('message', payload.message);
  fd.append('cv', payload.cv);
  return request<{ message: string }>('/applications', {
    method: 'POST',
    body: fd,
  });
};

// Mensagens admin (marcar lida/arquivar)
export const markMessageRead = (id: number, is_read = true) =>
  request<{ message: string }>(`/admin/messages/${id}`, {
    method: 'PUT',
    body: { is_read },
  });

export const deleteMessage = (id: number) =>
  request<{ message: string }>(`/admin/messages/${id}`, { method: 'DELETE' });

// Mensagens admin
export const getAdminMessages = () =>
  request<{ messages: MessageItem[] }>('/admin/messages');

// Orçamentos admin
export const getAdminQuotes = () => request<{ quotes: Quote[] }>('/admin/quotes');
export const updateQuoteStatus = (id: number, status: string, admin_notes?: string) =>
  request<{ message: string }>(`/admin/quotes/${id}`, {
    method: 'PUT',
    body: { status, admin_notes },
  });

// Perfil cliente
export const getClientProfile = () => request<ClientProfile>('/client/profile');

export const sendClientMessage = (payload: { subject?: string; content: string; attachment?: File | null }) => {
  const fd = new FormData();
  fd.append('subject', payload.subject || '');
  fd.append('content', payload.content);
  if (payload.attachment) fd.append('attachment', payload.attachment);
  return request<{ message: string; item: ClientProfile['messages'][number] }>('/client/messages', {
    method: 'POST',
    body: fd,
  });
};

export const sendAdminMessage = (payload: {
  user_id: number;
  subject?: string;
  content: string;
  attachment?: File | null;
}) => {
  const fd = new FormData();
  fd.append('user_id', String(payload.user_id));
  fd.append('subject', payload.subject || '');
  fd.append('content', payload.content);
  if (payload.attachment) fd.append('attachment', payload.attachment);
  return request<{ message: string; item: MessageItem }>('/admin/messages', {
    method: 'POST',
    body: fd,
  });
};
