const KEY = 'ganpati_device_id';

export function getDeviceId(): string {
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      if (typeof crypto !== "undefined" && crypto.randomUUID) {
        id = crypto.randomUUID();
      } else {
        id = `dev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      }
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return 'anon_device';
  }
}
