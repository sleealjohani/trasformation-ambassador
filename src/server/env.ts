/** قراءة متغيرات البيئة على الخادم فقط، بفشل صريح لا صامت. */
function required(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`متغير البيئة ${key} غير مضبوط.`);
  return value;
}

export const env = {
  get refCodePepper() {
    return required("REF_CODE_PEPPER");
  },
  get adminPasscode() {
    return required("ADMIN_PASSCODE");
  },
  get cronSecret() {
    return process.env.CRON_SECRET ?? "";
  },
};
