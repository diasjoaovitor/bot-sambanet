export async function delay(value?: number) {
  await new Promise(r => setTimeout(r, value || 5000))
}
