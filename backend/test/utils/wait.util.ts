const POLL_INTERVAL_MS = 50;
const POLL_TIMEOUT_MS = 3000;

export async function waitFor<T>(
  read: () => Promise<T>,
  isReady: (value: T) => boolean,
): Promise<T> {
  const deadline = Date.now() + POLL_TIMEOUT_MS;
  for (;;) {
    const value = await read();
    if (isReady(value) || Date.now() > deadline) {
      return value;
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
}
