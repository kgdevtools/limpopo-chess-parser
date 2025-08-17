export function logAction(file: string, fn: string, msg: string) {
  console.log(`[${file}]::${fn} -> ${msg}`);
}
