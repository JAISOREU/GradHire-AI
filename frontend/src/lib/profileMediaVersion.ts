let version = 0;

export function bumpProfileMediaVersion(): void {
  version += 1;
}

export function getProfileMediaVersion(): number {
  return version;
}