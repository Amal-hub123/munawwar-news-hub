-- السماح للمستخدمين بإنشاء profile عند التسجيل
CREATE POLICY "Users can insert their own profile on signup"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- إنشاء trigger لإضافة profile تلقائياً عند التسجيل
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- إضافة profile للمستخدم الجديد
  INSERT INTO public.profiles (user_id, name, email, status)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', ''),
    new.email,
    'pending'
  );
  
  -- إضافة دور writer للمستخدم
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'writer');
  
  RETURN new;
END;
$$;

-- ربط الـ trigger بجدول المستخدمين
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();