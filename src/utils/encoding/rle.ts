// Simple byte-wise RLE codec: pairs of [count, value], count in 1..255

export function rleCompress(data: Uint8Array): Uint8Array {
    if (data.length === 0) {
        return new Uint8Array();
    }

    const out: number[] = [];
    let i = 0;
    while (i < data.length) {
        const value = data[i];
        let count = 1;
        while (i + count < data.length && data[i + count] === value && count < 255) {
            count += 1;
        }
        out.push(count, value);
        i += count;
    }

    return new Uint8Array(out);
}

export function rleDecompress(data: Uint8Array): Uint8Array {
    const out: number[] = [];
    for (let i = 0; i < data.length; i += 2) {
        const count = data[i];
        const value = data[i + 1];
        if (count === undefined || value === undefined) {
            throw new Error("RLE decode: truncated data");
        }
        for (let j = 0; j < count; j += 1) {
            out.push(value);
        }
    }
    return new Uint8Array(out);
}
