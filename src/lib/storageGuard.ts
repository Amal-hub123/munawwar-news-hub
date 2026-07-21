/**
 * Storage Guard
 * ------------------------------------------------------------------
 * يعالج مشكلة QuotaExceededError عند حفظ جلسة Supabase في localStorage
 * دون المساس ببيانات المستخدم (مقالات، صور، إعدادات، ...).
 *
 * ما الذي يفعله:
 * 1) عند الإقلاع: يحذف رموز مصادقة Supabase القديمة/التالفة
 *    (`sb-<ref>-auth-token*`) العائدة لمشاريع أخرى غير المشروع الحالي.
 * 2) يعترض localStorage.setItem: إذا حدث QuotaExceededError، يحاول
 *    تحرير المساحة بأمان عبر:
 *      - حذف أي رموز sb-* لمشاريع Supabase أخرى.
 *      - حذف نسخ Supabase الاحتياطية (`*-code-verifier`, `*.backup`).
 *    ثم يعيد المحاولة. لا يمسح أي بيانات غير مرتبطة بالمصادقة.
 */

const PROJECT_REF = (() => {
  try {
    const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
    if (!url) return null;
    const m = url.match(/https?:\/\/([^.]+)\.supabase\.co/);
    return m ? m[1] : null;
  } catch {
    return null;
  }
})();

const isSbAuthKey = (key: string) => /^sb-[^-]+.*-auth-token/.test(key);
const isCurrentProjectKey = (key: string) =>
  PROJECT_REF ? key.startsWith(`sb-${PROJECT_REF}-`) : false;

const isQuotaError = (err: unknown): boolean => {
  if (!(err instanceof Error)) return false;
  const name = err.name || "";
  return (
    name === "QuotaExceededError" ||
    name === "NS_ERROR_DOM_QUOTA_REACHED" ||
    /quota/i.test(err.message)
  );
};

/** يحذف بأمان رموز مصادقة Supabase لمشاريع أخرى (ليست المشروع الحالي). */
const purgeStaleSupabaseAuth = (): number => {
  let removed = 0;
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k) keys.push(k);
    }
    for (const k of keys) {
      // نحذف فقط مفاتيح Supabase auth العائدة لمشاريع أخرى، أو نسخ احتياطية/verifier
      const isSupabaseNs = k.startsWith("sb-");
      if (!isSupabaseNs) continue;

      const isOtherProject = isSbAuthKey(k) && !isCurrentProjectKey(k);
      const isBackupOrVerifier =
        k.endsWith(".backup") ||
        k.includes("-code-verifier") ||
        k.includes("-provider-token-backup");

      if (isOtherProject || isBackupOrVerifier) {
        try {
          localStorage.removeItem(k);
          removed++;
        } catch {
          /* ignore */
        }
      }
    }
  } catch {
    /* localStorage غير متاح */
  }
  return removed;
};

/** يغلّف localStorage.setItem لالتقاط QuotaExceededError ومحاولة الإصلاح. */
const installQuotaSafeSetItem = () => {
  try {
    const proto = Storage.prototype;
    const original = proto.setItem;
    // حماية من التركيب المزدوج
    if ((original as any).__quotaSafeInstalled) return;

    const patched = function (this: Storage, key: string, value: string) {
      try {
        return original.call(this, key, value);
      } catch (err) {
        if (!isQuotaError(err)) throw err;

        // محاولة أولى: تنظيف رموز Supabase القديمة/الاحتياطية
        try {
          purgeStaleSupabaseAuth();
          return original.call(this, key, value);
        } catch (err2) {
          if (!isQuotaError(err2)) throw err2;
        }

        // محاولة ثانية: إن كان المفتاح نفسه رمز مصادقة، أزل أي نسخة قديمة
        // بنفس البادئة قبل الكتابة (لا نمس شيئاً آخر).
        if (isSbAuthKey(key)) {
          try {
            const toRemove: string[] = [];
            for (let i = 0; i < this.length; i++) {
              const k = this.key(i);
              if (
                k &&
                k !== key &&
                (k.startsWith(key) || (isSbAuthKey(k) && isCurrentProjectKey(k)))
              ) {
                toRemove.push(k);
              }
            }
            for (const k of toRemove) {
              try {
                this.removeItem(k);
              } catch {
                /* ignore */
              }
            }
            return original.call(this, key, value);
          } catch (err3) {
            if (!isQuotaError(err3)) throw err3;
          }
        }

        // فشل نهائي: نُعيد رمي الخطأ الأصلي حتى يتعامل معه Supabase.
        throw err;
      }
    };

    (patched as any).__quotaSafeInstalled = true;
    proto.setItem = patched;
  } catch {
    /* البيئة لا تدعم Storage prototype patching */
  }
};

export const initStorageGuard = () => {
  try {
    purgeStaleSupabaseAuth();
  } catch {
    /* ignore */
  }
  installQuotaSafeSetItem();
};
