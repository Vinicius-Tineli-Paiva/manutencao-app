-- Drop tables if they exist (for development/re-initialization)
-- CUIDADO: Se você já tem dados e NÃO quer perdê-los, COMENTE as linhas de DROP TABLE
DROP TABLE IF EXISTS maintenances CASCADE;
DROP TABLE IF EXISTS maintenance_schedules CASCADE; -- Se você não usa, pode remover esta tabela
DROP TABLE IF EXISTS assets CASCADE;
DROP TABLE IF EXISTS users CASCADE;


-- Função auxiliar para atualizar o campo updated_at
-- (Você já tem essa função, apenas garantindo que esteja aqui para referência)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups on username and email
CREATE INDEX idx_users_username ON users (username);
CREATE INDEX idx_users_email ON users (email);

-- Trigger to call the update_updated_at_column function on update of users table
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


-- Create the assets table
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user
        FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- Index for faster lookups on user_id
CREATE INDEX idx_assets_user_id ON assets (user_id);

-- Trigger for assets table (reusing the same function)
CREATE TRIGGER update_assets_updated_at
BEFORE UPDATE ON assets
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


-- Create the maintenances table (COM as ALTERAÇÕES)
CREATE TABLE maintenances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL,
    service_description TEXT NOT NULL,
    completion_date DATE, -- AGORA É OPCIONAL (NULLABLE)
    next_due_date DATE,
    notes TEXT,
    is_completed BOOLEAN DEFAULT FALSE NOT NULL, -- NOVO CAMPO: default FALSE e NOT NULL
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_asset
        FOREIGN KEY(asset_id)
        REFERENCES assets(id)
        ON DELETE CASCADE
);

-- Index for faster lookups on asset_id
CREATE INDEX idx_maintenances_asset_id ON maintenances (asset_id);

-- Trigger for maintenances table
CREATE TRIGGER update_maintenances_updated_at
BEFORE UPDATE ON maintenances
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Se você precisar adicionar as colunas sem dropar a tabela (se já houver dados):
-- EXECUTE APENAS SE VOCÊ NÃO QUER DROPPER A TABELA MAINTENANCES:
-- ALTER TABLE maintenances ADD COLUMN is_completed BOOLEAN DEFAULT FALSE NOT NULL;
-- ALTER TABLE maintenances ALTER COLUMN completion_date DROP NOT NULL;
-- ATENÇÃO: Se a coluna completion_date já existir e tiver NOT NULL, e você tiver linhas com NULL nela,
-- a alteração "DROP NOT NULL" pode falhar. Garanta que não há NULLs ou defina um valor padrão temporário.