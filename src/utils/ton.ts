export function toNanoTON(ton: string | number): number {
  return Math.round(Number(ton) * 1_000_000_000);
}

export function fromNanoTON(nano: number | undefined): number {
  if (nano === undefined || isNaN(nano)) return 0;
  return nano / 1_000_000_000;
}
