/* base85+1 reference decoder in lua (read string -> memory poke):


-- base85 decode (ASCII85-style) for TIC-80 Lua
-- Decodes 's' into memory starting at 'dst', writing exactly expectedLen bytes.
-- Returns the number of bytes written (should equal expectedLen or error).

-- BTW, justification for using this instead of typical tonumber() method:
-- ASCII85 is 1.25 chars per byte
-- HEX is 2 chars per byte
-- the ascii85 lua decoder is about 600 bytes.
-- so in lua,
-- ascii85's payload is 600 + (1.25 * N) bytes
-- hex's payload is 2 * N bytes, and probably some tiny amount of decoder like 30 bytes.
-- the break-even point is @
--      let d85 = ascii85 decoder size 600 bytes
--      let d16 = hex decoder size / 30 bytes
--      d85 + 1.25 * N < d16 + 2 * N
--      2 N - 1.25 N > d85 - d16
--      0.75 N > d85 - d16
-- 	    N > (d85 - d16) / 0.75
-- -> Break-even point = (ascii85 decoder size - hex decoder size) / 0.75
-- -> (600 - 30) / 0.75 = 760 bytes
-- So for patterns larger than that, ascii85 is more size-efficient.

local function base85Plus1Decode(s, d)
	local miss = s:byte(1) - 33
	s = s:sub(2)
	local n = (#s // 5) * 4 - miss
	local i = 1
	for o = 0, n - 1, 4 do
		local v = 0
		for j = i, i + 4 do
			v = v * 85 + s:byte(j) - 33
		end
		i = i + 5
		for k = 3, 0, -1 do
			if o + k < n then
				poke(d + o + k, v % 256)
			end
			v = v // 256
		end
	end
	return n
end


*/

// #143 base85 encoding is annoying because we need to carry around the true length
// of the decoded data for proper decoding to the precise length. but we can prefix the string
// with a single char which describes the "bytes to subtract" from the deduced length.
// b85 string length is always multiple of 5, so decoded length is always multiple of 4.
// deduced length is therefore possibly a couple bytes too long (0..3).
//
// let's make a kind of derived format that prefixes a "bytes to subtract from the end" value.

// Custom ASCII85-style base85: digits 0..84 map to chars 33..117 ('!'..'u')
const BASE85_RADIX = 85;
const BASE85_OFFSET = 33; // '!' in ASCII

export function base85Encode(data: Uint8Array): string {
  let out = "";
  const n = data.length;

  for (let i = 0; i < n; i += 4) {
    const b0 = data[i] ?? 0;
    const b1 = data[i + 1] ?? 0;
    const b2 = data[i + 2] ?? 0;
    const b3 = data[i + 3] ?? 0;

    // avoid signed-int32 behavior from bitwise ops
    let v = b0 * 2 ** 24 + b1 * 2 ** 16 + b2 * 2 ** 8 + b3; // 0..2^32-1

    const digits = new Array<number>(5);
    for (let d = 4; d >= 0; d--) {
      digits[d] = v % 85;
      v = Math.floor(v / 85);
    }

    for (let d = 0; d < 5; d++) {
      out += String.fromCharCode(33 + digits[d]);
    }
  }

  return out;
}

export function base85Decode(str: string, expectedLength: number): Uint8Array {
  if (str.length % 5 !== 0) {
    throw new Error(`base85Decode: input length ${str.length} is not a multiple of 5`);
  }

  const tmp: number[] = [];
  const groups = str.length / 5;
  let idx = 0;

  for (let g = 0; g < groups; g++) {
    let v = 0;

    for (let d = 0; d < 5; d++) {
      const code = str.charCodeAt(idx++);
      const digit = code - BASE85_OFFSET;
      if (digit < 0 || digit >= BASE85_RADIX) {
        throw new Error(`base85Decode: invalid base85 char '${str[idx - 1]}' at index ${idx - 1}`);
      }
      v = v * BASE85_RADIX + digit;
    }

    // Unpack 32-bit value into 4 bytes
    const b0 = (v >>> 24) & 0xff;
    const b1 = (v >>> 16) & 0xff;
    const b2 = (v >>> 8) & 0xff;
    const b3 = v & 0xff;

    tmp.push(b0, b1, b2, b3);
  }

  // Trim padding to the expected raw byte length
  if (expectedLength > tmp.length) {
    throw new Error(`base85Decode: expectedLength ${expectedLength} > decoded length ${tmp.length}`);
  }

  return new Uint8Array(tmp.slice(0, expectedLength));
}

export function base85Plus1Encode(data: Uint8Array): string {
  const n = data.length;
  const miss = (4 - (n & 3)) & 3; // 0..3
  return String.fromCharCode(BASE85_OFFSET + miss) + base85Encode(data);
}

export function base85Plus1Decode(str: string): Uint8Array {
  if (str.length < 1) {
    throw new Error("base85Decode1: empty input");
  }

  const miss = str.charCodeAt(0) - BASE85_OFFSET;
  if (miss < 0 || miss > 3) {
    throw new Error(`base85Decode1: invalid miss ${miss}`);
  }

  const body = str.slice(1);
  if (body.length % 5 !== 0) {
    throw new Error(`base85Decode1: body length ${body.length} is not a multiple of 5`);
  }

  const expectedLength = (body.length / 5) * 4 - miss;
  return base85Decode(body, expectedLength);
}
