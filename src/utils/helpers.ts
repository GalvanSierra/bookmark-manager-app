import { randomUUIDv7 } from 'bun';

export function generateGuid(): string {
  return randomUUIDv7();
}
