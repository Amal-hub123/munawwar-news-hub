/**
 * Storage Guard (conservative)
 * ------------------------------------------------------------------
 * الهدف: معالجة QuotaExceededError عند كتابة جلسة Supabase في localStorage
 * بشكل شفاف تمامًا للمستخدم، **دون** المساس بأي جلسة صالحة (لا للمشروع
 * الحالي ولا للمشاريع الأخرى قد تكون مفتوحة في تبويب آخر).
 *
 * قواعد صارمة:
 *  - لا نلمس أي مفتاح لا يبدأ بـ `sb-` (أي لا نلمس بيانات المستخدم إطلاقًا:
 *    مقالات، إعدادات، bookmarks، highlights، ...).
 *  - لا نحذف أبدًا رمز المصادقة النشط للمشروع الحالي
 *    (`sb-<currentRef>-auth-token`).
 *  - لا نحذف أي `sb-<ref>-auth-token` لمشروع آخر إذا بدا أنه جلسة صالحة
 *    (JSON صالح فيه access_token وexpires_at في المستقبل) — قد يكون
 *    المستخدم مسجّل دخول في تبويب آخر.
 *  - نسخ backup و PKCE verifier: تُحذف فقط إذا كانت لمشروع آخر أو
 *    كانت مكرّرة/زائدة (وتم الاحتفاظ بالأحدث للمشروع الحالي).
 *  - لا نُسجّل خروج أحد. لا نُطلق أحداث storage غير مبرّرة.
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

const SB_PREFIX = "sb-";

const isSupabaseKey = (k: string) => k.startsWith(SB_PREFIX);

/** يستخرج ref المشروع من مفتاح `sb-<ref>-...`. */
const extractRef = (k: string): string | null => {
  if (!isSupabaseKey(k)) return null;
  const rest = k.slice(SB_PREFIX.length);
  const dashIdx = rest.indexOf("-");
  return dashIdx > 0 ? rest.slice(0, dashIdx) : null;
};

const isAuthTokenKey = (k: string) =>
  /^sb-[^-]+.*-auth-token(?:\.\d+)?$/.test(k);

const isBackupKey = (k: string) =>
  isSupabaseKey(k) && (k.endsWith(".backup") || k.includes("-provider-token-backup"));

const isVerifierKey = (k: string) =>
  isSupabaseKey(k) && k.includes("-code-verifier");

const isQuotaError = (err: unknown): boolean => {
  if (!err || typeof err !== "object") return false;
  const name = (err as { name?: string }).name || "";
  const msg = (err as { message?: string }).message || "";
  return (
    name === "QuotaExceededError" ||
    name === "NS_ERROR_DOM_QUOTA_REACHED" ||
    /quota/i.test(msg)
  );
};

/** يفحص إن كان محتوى مفتاح auth-token يمثّل جلسة صالحة غير منتهية. */
const looksLikeValidSession = (raw: string | null): boolean => {
  if (!raw) return false;
  try {
    const obj = JSON.parse(raw);
    const token = obj?.access_token ?? obj?.currentSession?.access_token;
    const expires =
      obj?.expires_at ?? obj?.currentSession?.expires_at ?? null;
    if (!token) return false;
    if (typeof expires === "number") {
      // expires_at بالثواني منذ epoch — نعتبرها صالحة إن كانت لم تنتهِ بعد.
      return expires * 1000 > Date.now();
    }
    // إن لم يتوفّر expires_at نبقى محافظين ونعتبرها صالحة.
    return true;
  } catch {
    return false;
  }
};

const allKeys = (store: Storage): string[] => {
  const out: string[] = [];
  for (let i = 0; i < store.length; i++) {
    const k = store.key(i);
    if (k) out.push(k);
  }
  return out;
};

/**
 * تنظيف آمن ومحدود. يعيد عدد المفاتيح المحذوفة.
 * يستهدف فقط:
 *  1) رموز مصادقة لمشاريع Supabase أخرى **منتهية أو تالفة** (ليست جلسة صالحة).
 *  2) نُسخ backup لمشاريع أخرى.
 *  3) code-verifier لمشاريع أخرى.
 *  4) مفاتيح مجزّأة قديمة (`...auth-token.<n>`) لا يقابلها مفتاح أساسي.
 */
const safeCleanup = (store: Storage = localStorage): number => {
  let removed = 0;
  try {
    const keys = allKeys(store);
    const currentAuthKey = PROJECT_REF ? `sb-${PROJECT_REF}-auth-token` : null;

    for (const k of keys) {
      if (!isSupabaseKey(k)) continue; // لا نلمس بيانات غير Supabase
      if (currentAuthKey && (k === currentAuthKey || k.startsWith(currentAuthKey + "."))) {
        continue; // لا نلمس جلسة المشروع الحالي أبدًا
      }

      const ref = extractRef(k);
      const isOtherProject = ref !== null && ref !== PROJECT_REF;

      // 1) auth-token لمشروع آخر: يُحذف فقط إن لم يكن جلسة صالحة.
      if (isAuthTokenKey(k) && isOtherProject) {
        try {
          if (!looksLikeValidSession(store.getItem(k))) {
            store.removeItem(k);
            removed++;
          }
        } catch {
          /* ignore */
        }
        continue;
      }

      // 2) backup لمشروع آخر: آمن للحذف.
      // 3) verifier لمشروع آخر: آمن للحذف (لا يخص أي flow نشط لدينا).
      if (isOtherProject && (isBackupKey(k) || isVerifierKey(k))) {
        try {
          store.removeItem(k);
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

/**
 * تنظيف "عميق" يُستخدم فقط عند تعذّر كتابة رمز المشروع الحالي (quota فعلي).
 * يزيد الجرأة تدريجيًا لكن يبقى محافظًا على جلسة المشروع الحالي.
 * الخطوات (بالترتيب، وتتوقف عند نجاح الكتابة):
 *   A) safeCleanup الاعتيادي.
 *   B) حذف backup/verifier للمشروع الحالي (باستثناء verifier إذا نحن الآن
 *      بصدد كتابة auth-token — يعني flow انتهى ولا نحتاجه).
 *   C) حذف auth-tokens لمشاريع أخرى حتى لو بدت صالحة (كخيار أخير فقط
 *      عندما تكون الكتابة الحالية هي جلسة المشروع الحالي).
 */
const deepCleanupForCurrentWrite = (
  store: Storage,
  writingKey: string
): number => {
  let removed = 0;
  const currentAuthKey = PROJECT_REF ? `sb-${PROJECT_REF}-auth-token` : null;
  const writingIsCurrentAuth =
    !!currentAuthKey &&
    (writingKey === currentAuthKey || writingKey.startsWith(currentAuthKey + "."));

  try {
    // B) backup/verifier للمشروع الحالي
    for (const k of allKeys(store)) {
      if (!isSupabaseKey(k)) continue;
      const ref = extractRef(k);
      const isCurrent = ref === PROJECT_REF;
      if (!isCurrent) continue;
      if (k === writingKey) continue;

      if (isBackupKey(k) || (isVerifierKey(k) && writingIsCurrentAuth)) {
        try {
          store.removeItem(k);
          removed++;
        } catch {
          /* ignore */
        }
      }
    }

    // C) أخير: auth-tokens لمشاريع أخرى (فقط عند كتابة جلسة المشروع الحالي).
    if (writingIsCurrentAuth) {
      for (const k of allKeys(store)) {
        if (!isSupabaseKey(k)) continue;
        if (!isAuthTokenKey(k)) continue;
        const ref = extractRef(k);
        if (ref === PROJECT_REF) continue;
        try {
          store.removeItem(k);
          removed++;
        } catch {
          /* ignore */
        }
      }
    }
  } catch {
    /* ignore */
  }
  return removed;
};

const installQuotaSafeSetItem = () => {
  try {
    const proto = Storage.prototype;
    const original = proto.setItem;
    if ((original as unknown as { __quotaSafeInstalled?: boolean }).__quotaSafeInstalled) return;

    const patched = function (this: Storage, key: string, value: string) {
      try {
        return original.call(this, key, value);
      } catch (err) {
        if (!isQuotaError(err)) throw err;

        // مرحلة 1: تنظيف آمن
        try {
          safeCleanup(this);
          return original.call(this, key, value);
        } catch (err2) {
          if (!isQuotaError(err2)) throw err2;
        }

        // مرحلة 2: تنظيف أعمق مرتبط بالكتابة الحالية (يظل محافظًا على الجلسة الحالية)
        try {
          deepCleanupForCurrentWrite(this, key);
          return original.call(this, key, value);
        } catch (err3) {
          if (!isQuotaError(err3)) throw err3;
        }

        // نفشل بصمت لا نمس بيانات المستخدم. Supabase سيتعامل مع الاستثناء.
        throw err;
      }
    };

    (patched as unknown as { __quotaSafeInstalled?: boolean }).__quotaSafeInstalled = true;
    proto.setItem = patched;
  } catch {
    /* البيئة لا تدعم Storage prototype patching */
  }
};

export const initStorageGuard = () => {
  try {
    safeCleanup(localStorage);
  } catch {
    /* ignore */
  }
  installQuotaSafeSetItem();
};
