-- التأكد من أن عمود bio يقبل حتى 300 حرف
-- إزالة أي قيود موجودة على طول النص
ALTER TABLE profiles 
ALTER COLUMN bio TYPE text;

-- إضافة قيد جديد للتحقق من طول النبذة (300 حرف كحد أقصى)
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS bio_length_check;

ALTER TABLE profiles 
ADD CONSTRAINT bio_length_check 
CHECK (bio IS NULL OR char_length(bio) <= 300);