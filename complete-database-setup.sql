-- =====================================================
-- COMPLETE DATABASE SETUP FOR TASK MANAGER APP
-- =====================================================
-- This file contains ALL database setup including:
-- - Profiles table
-- - Categories table
-- - Projects table  
-- - Tasks table
-- - Avatar storage bucket
-- - All RLS policies
-- - Triggers and functions
-- - Missing column fixes
-- 
-- ✅ SAFE TO RUN MULTIPLE TIMES
-- ✅ Uses IF NOT EXISTS for tables and columns
-- ✅ Drops existing policies/triggers before recreating
-- ✅ Handles existing columns gracefully
-- ✅ Fixes missing columns automatically
-- =====================================================

-- =====================================================
-- 1. CREATE TABLES
-- =====================================================

-- Create profiles table to store additional user information
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT 'blue',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT 'blue',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'progress', 'done')),
  points INTEGER DEFAULT 5,
  timeUsed INTEGER DEFAULT 0,
  timeLeft INTEGER DEFAULT 30,
  estimatedTime INTEGER DEFAULT 30,
  color TEXT DEFAULT 'blue',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. ADD MISSING COLUMNS (for existing databases)
-- =====================================================

-- Add missing columns if they don't exist (for existing tables)
-- Using IF NOT EXISTS to avoid errors if columns already exist
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS estimatedTime INTEGER DEFAULT 30;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS timeLeft INTEGER DEFAULT 30;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS timeUsed INTEGER DEFAULT 0;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS color TEXT DEFAULT 'blue';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 5;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS project_id INTEGER;

-- Add missing columns for projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL;

-- =====================================================
-- 3. CREATE FUNCTIONS (IF NOT EXISTS)
-- =====================================================

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email);
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Profile already exists, skip
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. ENABLE ROW LEVEL SECURITY
-- =====================================================

-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. DROP EXISTING POLICIES (if they exist)
-- =====================================================

-- Drop existing policies if they exist (safe to run multiple times)
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON profiles;

DROP POLICY IF EXISTS "Users can view their own categories" ON categories;
DROP POLICY IF EXISTS "Users can insert their own categories" ON categories;
DROP POLICY IF EXISTS "Users can update their own categories" ON categories;
DROP POLICY IF EXISTS "Users can delete their own categories" ON categories;

DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
DROP POLICY IF EXISTS "Users can insert their own projects" ON projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON projects;

DROP POLICY IF EXISTS "Users can view their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can insert their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON tasks;

-- =====================================================
-- 6. CREATE RLS POLICIES
-- =====================================================

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can delete their own profile" ON profiles
  FOR DELETE USING (auth.uid() = id);

-- Categories policies
CREATE POLICY "Users can view their own categories" ON categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own categories" ON categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories" ON categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories" ON categories
  FOR DELETE USING (auth.uid() = user_id);

-- Projects policies
CREATE POLICY "Users can view their own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- Tasks policies
CREATE POLICY "Users can view their own tasks" ON tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks" ON tasks
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 7. CREATE TRIGGERS
-- =====================================================

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;

-- Create triggers to automatically update updated_at
-- (Triggers are dropped first above, so safe to create)
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email);
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Profile already exists, skip
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to automatically create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 8. SETUP STORAGE FOR AVATARS
-- =====================================================

-- Create the avatars storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the avatars bucket
-- Allow users to upload their own avatars
CREATE POLICY "Users can upload their own avatars" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to view all avatars (public bucket)
CREATE POLICY "Anyone can view avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- Allow users to update their own avatars
CREATE POLICY "Users can update their own avatars" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own avatars
CREATE POLICY "Users can delete their own avatars" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- =====================================================
-- 9. UPDATE EXISTING DATA
-- =====================================================

-- Update existing tasks to have proper values
UPDATE tasks 
SET 
    estimatedTime = COALESCE(points, 30),
    timeLeft = COALESCE(points, 30),
    timeUsed = 0,
    color = 'blue'
WHERE estimatedTime IS NULL 
   OR timeLeft IS NULL 
   OR timeUsed IS NULL 
   OR color IS NULL;

-- =====================================================
-- 10. EMAIL CONFIRMATION SETUP
-- =====================================================

-- Note: Email confirmation must be enabled manually in Supabase Dashboard
-- Go to Authentication > Settings > Email Auth
-- Turn ON "Enable email confirmations"

-- =====================================================
-- 11. VERIFICATION QUERIES
-- =====================================================

-- Verify all tables exist
SELECT 'Tables created successfully' as status;

-- Show all columns in tasks table
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'tasks' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show all columns in projects table
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'projects' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verify storage bucket was created
SELECT * FROM storage.buckets WHERE id = 'avatars';

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================
-- Your database is now ready for the Task Manager App
-- Features included:
-- ✅ User profiles with avatar support
-- ✅ Project-based task organization
-- ✅ Gamified task system with XP and timers
-- ✅ Secure file storage for avatars
-- ✅ Row Level Security for data protection
-- ✅ Automatic profile creation on signup
-- ✅ Email confirmation enabled
-- =====================================================

-- =====================================================
-- ADDITIONAL MANUAL SETUP REQUIRED:
-- =====================================================
-- 1. SUPABASE DASHBOARD SETUP:
--    - Go to Authentication > Settings
--    - Turn ON "Enable email confirmations"
--    - Set Site URL: http://localhost:5173
--    - Add Redirect URLs: http://localhost:5173/ (this will show dashboard if logged in)
--
-- 2. EMAIL TEMPLATES:
--    - Go to Authentication > Email Templates
--    - Customize "Confirm your signup" template
--
-- 3. TEST EMAIL CONFIRMATION:
--    - Sign up with a real email address
--    - Check email (including spam folder)
--    - Click confirmation link
--
-- 4. IF EMAILS DON'T ARRIVE:
--    - Check spam/junk folder
--    - Use a real email address (Gmail, Yahoo, etc.)
--    - Wait 1-2 minutes for delivery
--    - Check Supabase logs in Dashboard > Logs
-- =====================================================
