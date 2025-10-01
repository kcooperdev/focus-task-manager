-- Add categories table
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7) DEFAULT '#6366f1', -- Default indigo color
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add category_id to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_category_id ON projects(category_id);

-- Enable RLS (Row Level Security)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for categories
CREATE POLICY "Users can view their own categories" ON categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own categories" ON categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories" ON categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories" ON categories
  FOR DELETE USING (auth.uid() = user_id);

-- Insert default categories for all users
INSERT INTO categories (user_id, name, color)
SELECT DISTINCT user_id, 'Work', '#3b82f6'
FROM projects
WHERE user_id IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM categories WHERE user_id = projects.user_id AND name = 'Work'
);

INSERT INTO categories (user_id, name, color)
SELECT DISTINCT user_id, 'Personal', '#10b981'
FROM projects
WHERE user_id IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM categories WHERE user_id = projects.user_id AND name = 'Personal'
);

INSERT INTO categories (user_id, name, color)
SELECT DISTINCT user_id, 'Learning', '#8b5cf6'
FROM projects
WHERE user_id IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM categories WHERE user_id = projects.user_id AND name = 'Learning'
);

INSERT INTO categories (user_id, name, color)
SELECT DISTINCT user_id, 'Health', '#ef4444'
FROM projects
WHERE user_id IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM categories WHERE user_id = projects.user_id AND name = 'Health'
);

INSERT INTO categories (user_id, name, color)
SELECT DISTINCT user_id, 'Finance', '#f59e0b'
FROM projects
WHERE user_id IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM categories WHERE user_id = projects.user_id AND name = 'Finance'
);

INSERT INTO categories (user_id, name, color)
SELECT DISTINCT user_id, 'Side Projects', '#06b6d4'
FROM projects
WHERE user_id IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM categories WHERE user_id = projects.user_id AND name = 'Side Projects'
);
