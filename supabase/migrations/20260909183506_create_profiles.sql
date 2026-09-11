-- Migration: Create profiles table and auth synchronization trigger
-- Specifications:
-- - Decouples auth.users from client-facing operations
-- - Auto-creates profile on auth.users insert (via Magic Link signup)
-- - Supports organizer identity, contact info, and roles (admin, organizer, user)
-- - Strict RLS: Public read, owner-only update

CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    full_name text,
    organization_name text,
    avatar_url text,
    bio text,
    website text,
    instagram_handle text,
    contact_email text,
    role text DEFAULT 'organizer' NOT NULL,

    CONSTRAINT check_role CHECK (role IN ('admin', 'organizer', 'user'))
);

CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Trigger function to synchronize from auth.users on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        full_name,
        avatar_url,
        contact_email,
        role
    ) VALUES (
        NEW.id,
        coalesce(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.email,
        coalesce(NEW.raw_user_meta_data->>'role', 'organizer')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Register trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
CREATE POLICY "Public profiles are viewable by everyone"
    ON public.profiles
    FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

COMMENT ON TABLE public.profiles IS 'Public user profiles synchronized with Supabase Auth.';
