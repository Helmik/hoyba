-- Migration: User Administration, Audit Logs, and Account Status Notifications
-- Enhances public.profiles with account status tracking, administrator access policies,
-- and creates an audit logging table to trace account lifecycles (creation, recovery, updates).

-- 1. Extend profiles with account status flags
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true NOT NULL,
    ADD COLUMN IF NOT EXISTS last_sign_in_at timestamptz;

-- 2. Audit logs & account event notifications table
CREATE TABLE IF NOT EXISTS public.account_audit_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type text NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,

    CONSTRAINT check_event_type CHECK (
        event_type IN (
            'account_created',
            'password_recovery_requested',
            'password_reset_completed',
            'profile_updated',
            'status_changed',
            'role_changed'
        )
    )
);

CREATE INDEX IF NOT EXISTS idx_account_audit_logs_user_id ON public.account_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_account_audit_logs_created_at ON public.account_audit_logs(created_at DESC);

-- Enable RLS on audit logs
ALTER TABLE public.account_audit_logs ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies for Profiles & Audit Logs
-- Regular users can view their own audit logs
CREATE POLICY "Users can view own audit logs"
    ON public.account_audit_logs
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Admins can view and manage all profiles
CREATE POLICY "Admins can view all profiles"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update any profile"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Admins can view all audit logs
CREATE POLICY "Admins can view all audit logs"
    ON public.account_audit_logs
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 4. Trigger to record account_created audit log automatically on signup
CREATE OR REPLACE FUNCTION public.log_account_creation()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.account_audit_logs (
        user_id,
        event_type,
        metadata
    ) VALUES (
        NEW.id,
        'account_created',
        jsonb_build_object(
            'email', NEW.email,
            'role', coalesce(NEW.raw_user_meta_data->>'role', 'organizer'),
            'registered_at', now()
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created_audit ON auth.users;
CREATE TRIGGER on_auth_user_created_audit
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.log_account_creation();

-- 5. RPC Function for Administrators to set user active status or role
CREATE OR REPLACE FUNCTION public.admin_set_user_status(
    target_user_id uuid,
    new_is_active boolean,
    new_role text DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
    is_caller_admin boolean;
    result jsonb;
BEGIN
    -- Verify caller is an administrator
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    ) INTO is_caller_admin;

    IF NOT is_caller_admin THEN
        RAISE EXCEPTION 'Access denied. Administrator role required.';
    END IF;

    -- Update target profile
    UPDATE public.profiles
    SET
        is_active = new_is_active,
        role = coalesce(new_role, role),
        updated_at = now()
    WHERE id = target_user_id;

    -- Record audit log
    INSERT INTO public.account_audit_logs (
        user_id,
        event_type,
        metadata
    ) VALUES (
        target_user_id,
        'status_changed',
        jsonb_build_object(
            'updated_by', auth.uid(),
            'is_active', new_is_active,
            'role', new_role,
            'timestamp', now()
        )
    );

    result := jsonb_build_object(
        'success', true,
        'user_id', target_user_id,
        'is_active', new_is_active
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION public.admin_set_user_status(uuid, boolean, text) TO authenticated;
GRANT SELECT ON TABLE public.account_audit_logs TO authenticated;
