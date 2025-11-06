-- حذف الـ trigger والدالة الجديدة
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- تعديل دالة التسجيل الأصلية لإضافة دور writer للكتّاب
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_count integer;
BEGIN
  -- Create profile for the new user
  INSERT INTO public.profiles (user_id, name, email, status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'مستخدم جديد'),
    NEW.email,
    'pending'
  );

  -- Check if there are any existing admins
  SELECT COUNT(*) INTO admin_count
  FROM public.user_roles
  WHERE role = 'admin';

  -- If no admins exist, make this user an admin
  IF admin_count = 0 THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin');
    
    -- Also approve their profile automatically
    UPDATE public.profiles
    SET status = 'approved'
    WHERE user_id = NEW.id;
  ELSE
    -- Otherwise, make them a writer
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'writer');
  END IF;

  RETURN NEW;
END;
$$;