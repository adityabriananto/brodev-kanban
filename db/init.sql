CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE user_role AS ENUM ('owner', 'art');
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'done');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    role user_role NOT NULL
);

CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status task_status DEFAULT 'todo',
    assigned_hours NUMERIC(5,2),
    hour_change_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Data for Users
INSERT INTO users (name, role) VALUES 
('Bapak', 'owner'),
('Ibu', 'owner');

-- Seed Data for Tasks
INSERT INTO tasks (title, description, status, assigned_hours) VALUES 
('Sapu Lantai Ruang Tamu', 'Sapu hingga bersih, perhatikan kolong meja.', 'todo', 0.5),
('Cuci Piring', 'Gunakan sabun cuci piring secukupnya.', 'todo', 1.0),
('Pel Lantai Dapur', 'Pastikan tidak licin setelah dipel.', 'todo', 1.5);
