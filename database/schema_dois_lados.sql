-- ============================================
-- DOIS LADOS - Schema MySQL Completo
-- ============================================
-- Escritório de Arquitetura e Construção
-- Luanda, Angola
-- Versão: 1.0.0
-- ============================================

-- Criar base de dados
CREATE DATABASE IF NOT EXISTS dois_lados 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE dois_lados;

-- ============================================
-- TABELA: users (Utilizadores)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(80) NOT NULL UNIQUE,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(256) NOT NULL,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: projects (Projetos)
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL DEFAULT 'residencial',
    status VARCHAR(30) NOT NULL DEFAULT 'orcamento',
    client_id INT,
    budget DECIMAL(12, 2),
    location VARCHAR(200),
    area_sqm DECIMAL(10, 2),
    start_date DATE,
    end_date DATE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_category (category),
    INDEX idx_status (status),
    INDEX idx_client (client_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: project_phases (Fases do Projeto)
-- ============================================
CREATE TABLE IF NOT EXISTS project_phases (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    phase_name VARCHAR(100) NOT NULL,
    description TEXT,
    phase_order INT NOT NULL DEFAULT 1,
    start_date DATE,
    end_date DATE,
    status VARCHAR(30) NOT NULL DEFAULT 'pendente',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    INDEX idx_project (project_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: project_images (Imagens do Projeto)
-- ============================================
CREATE TABLE IF NOT EXISTS project_images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    caption VARCHAR(200),
    is_main BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    INDEX idx_project (project_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: quotes (Orçamentos)
-- ============================================
CREATE TABLE IF NOT EXISTS quotes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    client_name VARCHAR(100) NOT NULL,
    client_email VARCHAR(120) NOT NULL,
    client_phone VARCHAR(20),
    service_type VARCHAR(50) NOT NULL,
    project_type VARCHAR(50),
    description TEXT NOT NULL,
    budget_range VARCHAR(50),
    location VARCHAR(200),
    status VARCHAR(30) NOT NULL DEFAULT 'pendente',
    admin_notes TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_email (client_email),
    INDEX idx_service (service_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: messages (Mensagens de Contacto)
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL,
    phone VARCHAR(20),
    subject VARCHAR(200),
    content TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    is_replied BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_is_read (is_read),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: portfolio_items (Portfólio)
-- ============================================
CREATE TABLE IF NOT EXISTS portfolio_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    location VARCHAR(100),
    area_sqm DECIMAL(10, 2),
    year INT,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_featured (is_featured),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: newsletter
-- ============================================
CREATE TABLE IF NOT EXISTS newsletter (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(120) NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: system_logs (Logs de Auditoria)
-- ============================================
CREATE TABLE IF NOT EXISTS system_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_action (action),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- DADOS INICIAIS (SEED DATA)
-- ============================================

-- Administrador padrão
INSERT INTO users (username, email, password_hash, is_admin, is_active)
VALUES ('admin', 'admin@doislados.co.ao', 
        'pbkdf2:sha256:600000$Xr3vT9kP$a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2', 
        TRUE, TRUE)
ON DUPLICATE KEY UPDATE username=username;

-- Cliente de exemplo
INSERT INTO users (username, email, password_hash, is_admin, is_active)
VALUES ('cliente', 'joao.silva@email.com', 
        'pbkdf2:sha256:600000$Yq4wE8mN$b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3', 
        FALSE, TRUE)
ON DUPLICATE KEY UPDATE username=username;

-- Categorias de projeto (exemplo)
INSERT INTO portfolio_items (title, description, category, image_url, location, area_sqm, year, is_featured)
VALUES 
('Villa Talatona', 'Moradia de luxo com 4 suítes, piscina e jardim tropical', 'residencial', '/static/uploads/portfolio/villa_talatona.jpg', 'Talatona, Luanda', 450.00, 2024, TRUE),
('Edifício Kokoke', 'Prédio comercial com 8 andares no centro de Luanda', 'comercial', '/static/uploads/portfolio/edificio_kokoke.jpg', 'Centro, Luanda', 2800.00, 2023, TRUE),
('Urbanismo Cacuaco', 'Projeto de urbanização com 50 habitações', 'urbanismo', '/static/uploads/portfolio/urbanismo_cacuaco.jpg', 'Cacuaco, Luanda', 15000.00, 2024, FALSE),
('Residências Ilha', 'Conjunto habitacional de média densidade', 'residencial', '/static/uploads/portfolio/residencias_ilha.jpg', 'Ilha, Luanda', 5200.00, 2023, FALSE)
ON DUPLICATE KEY UPDATE title=title;

-- Projeto de exemplo
INSERT INTO projects (title, description, category, status, location, budget, start_date, end_date)
VALUES ('Edifício Residencial Talatona', 'Complexo residencial de 12 andares em Talatona', 'residencial', 'em_progresso', 'Talatona, Luanda', 850000.00, '2024-01-15', '2025-06-30')
ON DUPLICATE KEY UPDATE title=title;

-- Fases do projeto
INSERT INTO project_phases (project_id, phase_name, description, phase_order, status)
VALUES 
(1, 'Estudo Prévio', 'Análise de requisitos e estudo de viabilidade', 1, 'concluido'),
(1, 'Anteprojeto', 'Desenvolvimento de plantas preliminares', 2, 'concluido'),
(1, 'Projeto de Execução', 'Detalhamento técnico completo', 3, 'em_progresso'),
(1, 'Licenciamento', 'Submissão e aprovação de licenças', 4, 'pendente'),
(1, 'Fiscalização', 'Acompanhamento da construção', 5, 'pendente'),
(1, 'Entrega', 'Entrega final ao cliente', 6, 'pendente')
ON DUPLICATE KEY UPDATE phase_name=phase_name;

-- Orçamento de exemplo
INSERT INTO quotes (client_name, client_email, client_phone, service_type, project_type, description, budget_range, location, status)
VALUES ('Maria dos Santos', 'maria.santos@email.com', '+244 928 035 347', 'Projeto Arquitetônico', 'Residencial', 'Procuro projeto para moradia de 3 quartos em Talatona, com área de aproximadamente 250m2. Pretendo incluir garagem para 2 viaturas e uma piscina pequena.', '50.000 - 100.000 USD', 'Talatona, Luanda', 'pendente')
ON DUPLICATE KEY UPDATE client_name=client_name;

-- Mensagem de contacto exemplo
INSERT INTO messages (name, email, subject, content)
VALUES ('João Manuel', 'joao.manuel@email.com', 'Solicitação de Reunião', 'Gostaria de agendar uma reunião para discutir um projeto de construção de uma moradia em Luanda. Qual a disponibilidade da equipa?')
ON DUPLICATE KEY UPDATE name=name;

-- ============================================
-- STORED PROCEDURES (Opcionais)
-- ============================================

DELIMITER //

-- Procedure para atualizar status de projeto
CREATE PROCEDURE update_project_status(IN p_id INT, IN p_status VARCHAR(30))
BEGIN
    UPDATE projects 
    SET status = p_status, 
        updated_at = CURRENT_TIMESTAMP 
    WHERE id = p_id;
END //

-- Procedure para obter estatísticas
CREATE PROCEDURE get_dashboard_stats()
BEGIN
    SELECT 
        (SELECT COUNT(*) FROM users WHERE is_admin = FALSE) AS total_clients,
        (SELECT COUNT(*) FROM projects) AS total_projects,
        (SELECT COUNT(*) FROM projects WHERE status = 'em_progresso') AS projects_in_progress,
        (SELECT COUNT(*) FROM projects WHERE status = 'concluido') AS projects_completed,
        (SELECT COUNT(*) FROM quotes WHERE status = 'pendente') AS pending_quotes,
        (SELECT COUNT(*) FROM messages WHERE is_read = FALSE) AS unread_messages;
END //

DELIMITER ;

-- ============================================
-- VISTAS (Views)
-- ============================================

-- Vista de projetos com informações do cliente
CREATE OR REPLACE VIEW v_projects_full AS
SELECT 
    p.id,
    p.title,
    p.description,
    p.category,
    p.status,
    p.budget,
    p.location,
    p.area_sqm,
    p.start_date,
    p.end_date,
    p.created_at,
    u.username AS client_name,
    u.email AS client_email,
    COUNT(DISTINCT ph.id) AS total_phases,
    COUNT(DISTINCT CASE WHEN ph.status = 'concluido' THEN ph.id END) AS completed_phases
FROM projects p
LEFT JOIN users u ON p.client_id = u.id
LEFT JOIN project_phases ph ON p.id = ph.project_id
GROUP BY p.id;

-- ============================================
-- FIM DO SCHEMA
-- ============================================
