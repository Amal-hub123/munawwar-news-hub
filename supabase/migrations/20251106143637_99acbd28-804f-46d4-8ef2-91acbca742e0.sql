-- Update the handle_new_user_signup function
-- New users will NOT get any role until approved by admin
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  admin_count integer;
BEGIN
  -- Create profile for the new user
  INSERT INTO public.profiles (user_id, name, email, status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'مستخدم جديد'),
    NEW.email,
    'pending'  -- Always start as pending
  );

  -- Check if there are any existing admins
  SELECT COUNT(*) INTO admin_count
  FROM public.user_roles
  WHERE role = 'admin';

  -- If no admins exist, make this user an admin and auto-approve
  IF admin_count = 0 THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin');
    
    -- Auto-approve only the first admin
    UPDATE public.profiles
    SET status = 'approved'
    WHERE user_id = NEW.id;
  END IF;
  -- For all other users: NO role is assigned until admin approves them

  RETURN NEW;
END;
$function$;