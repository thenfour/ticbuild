// utilities for dealing with binary data / parsing / etc

export function kbToBytes(kb: number): number {
  return kb * 1024;
}
export function bytesToKb(bytes: number): number {
  return bytes / 1024;
}

export function readUint16LE(data: Uint8Array, offset: number): number {
  return data[offset] | (data[offset + 1] << 8);
}
