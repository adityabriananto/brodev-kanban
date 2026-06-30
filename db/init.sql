CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE user_role AS ENUM ('owner', 'art');
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'done');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255)
);

CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status task_status DEFAULT 'todo',
    assigned_hours NUMERIC(5,2),
    hour_change_reason TEXT,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Data for Users
INSERT INTO users (name, role, email, password_hash) VALUES 
('Bapak', 'owner', 'bapak@rumah.com', '$2b$10$.i5el7CjO7MinWtVm.YjauRz6qepBeDEForvB6ZFaFjsF6aP2QFQC'),
('Ibu', 'owner', 'ibu@rumah.com', '$2b$10$.i5el7CjO7MinWtVm.YjauRz6qepBeDEForvB6ZFaFjsF6aP2QFQC'),
('ART', 'art', 'art@rumah.com', '$2b$10$.i5el7CjO7MinWtVm.YjauRz6qepBeDEForvB6ZFaFjsF6aP2QFQC');

-- Seed Data for Tasks
INSERT INTO tasks (title, description, status, assigned_hours) VALUES 
('Sapu Lantai Ruang Tamu', 'Sapu hingga bersih, perhatikan kolong meja.', 'todo', 0.5),
('Cuci Piring', 'Gunakan sabun cuci piring secukupnya.', 'todo', 1.0),
('Pel Lantai Dapur', 'Pastikan tidak licin setelah dipel.', 'todo', 1.5);
