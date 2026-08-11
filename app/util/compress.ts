export async function compress(data: BufferSource | undefined): Promise<Uint8Array> {
    const cs = new CompressionStream("deflate-raw");
    const writer = cs.writable.getWriter();
    writer.write(data as BufferSource);
    writer.close();
    return new Uint8Array(await new Response(cs.readable).arrayBuffer());
}

function CRC32(data: Uint8Array): number {
    let crc = 0xffffffff;
    const table = new Int32Array(256);
    for(let i = 0; i < 256; i++){
        let c = i;
        for(let j = 0; j < 8; j++){
            c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
        }
        table[i] = c;
    }
    for(let i = 0; i < data.length; i++){
       crc = table[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ -1) >>> 0;
}

// Helper to write DOS date/time (simplified to 0 or current time)
function getDosTime(date: Date = new Date()): { time: number, date: number } {
    return {
        time: (date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1),
        date: ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate()
    };
}

// Helper to create Local File Header
function createLocalHeader(filename: string, compressedSize: number, uncompressedSize: number, crc: number): Uint8Array {
    const encoder = new TextEncoder();
    const nameBuffer = encoder.encode(filename);
    const { time, date } = getDosTime();
    
    const buffer = new ArrayBuffer(30 + nameBuffer.length);
    const view = new DataView(buffer);
    
    view.setUint32(0, 0x04034b50, true);
    view.setUint16(4, 20, true);
    view.setUint16(6, 0, true);
    view.setUint16(8, 8, true);
    view.setUint16(10, time, true);
    view.setUint16(12, date, true);
    view.setUint32(14, crc, true);
    view.setUint32(18, compressedSize, true);
    view.setUint32(22, uncompressedSize, true);
    view.setUint16(26, nameBuffer.length, true);
    view.setUint16(28, 0, true);
    
    new Uint8Array(buffer, 30).set(nameBuffer);
    return new Uint8Array(buffer);
}

// Helper to create Central Directory Header
function createCentralHeader(filename: string, compressedSize: number, uncompressedSize: number, crc: number, offset: number): Uint8Array {
    const encoder = new TextEncoder();
    const nameBuffer = encoder.encode(filename);
    const { time, date } = getDosTime();
    
    const buffer = new ArrayBuffer(46 + nameBuffer.length);
    const view = new DataView(buffer);
    
    view.setUint32(0, 0x02014b50, true);
    view.setUint16(4, 3 * 256 + 20, true);
    view.setUint16(6, 20, true); 
    view.setUint16(8, 0, true); 
    view.setUint16(10, 8, true);
    view.setUint16(12, time, true);
    view.setUint16(14, date, true);
    view.setUint32(16, crc, true); 
    view.setUint32(20, compressedSize, true);
    view.setUint32(24, uncompressedSize, true);
    view.setUint16(28, nameBuffer.length, true);
    view.setUint16(30, 0, true);        
    view.setUint16(32, 0, true);    
    view.setUint16(34, 0, true);       
    view.setUint16(36, 0, true);         
    view.setUint32(38, 0, true);         
    view.setUint32(42, offset, true); 
    
    new Uint8Array(buffer, 46).set(nameBuffer);
    return new Uint8Array(buffer);
}

// Helper to create End of Central Directory
function createEndOfCentralDir(totalFiles: number, centralDirSize: number, centralDirOffset: number): Uint8Array {
    const buffer = new ArrayBuffer(22);
    const view = new DataView(buffer);
    
    view.setUint32(0, 0x06054b50, true);
    view.setUint16(4, 0, true);
    view.setUint16(6, 0, true);
    view.setUint16(8, totalFiles, true);
    view.setUint16(10, totalFiles, true);
    view.setUint32(12, centralDirSize, true);
    view.setUint32(16, centralDirOffset, true);
    view.setUint16(20, 0, true);
    
    return new Uint8Array(buffer);
}

// MAIN FUNCTION: Create ZIP from files object
export async function Zip(files: Record<string, Uint8Array | Blob | string>): Promise<Blob> {
    const parts: Uint8Array[] = [];
    const centralHeaders: Uint8Array[] = [];
    let offset = 0;

    for (const [filename, data] of Object.entries(files)) {
        let rawData: Uint8Array;
        if (data instanceof Blob) {
            rawData = new Uint8Array(await data.arrayBuffer());
        } else if (data instanceof Uint8Array) {
            rawData = data;
        } else {
            rawData = new TextEncoder().encode(data as string);
        }

        const crc = CRC32(rawData);
        const compressed = await compress(rawData as BufferSource);

        const localHeader = createLocalHeader(filename, compressed.length, rawData.length, crc);
        parts.push(localHeader);
        parts.push(compressed);

        centralHeaders.push(createCentralHeader(filename, compressed.length, rawData.length, crc, offset));

        offset += localHeader.length + compressed.length;
    }

    const centralDirOffset = offset;
    const centralDirData = new Uint8Array(centralHeaders.reduce((acc, h) => acc + h.length, 0));
    let currentPos = 0;
    for (const header of centralHeaders) {
        centralDirData.set(header, currentPos);
        currentPos += header.length;
    }

    parts.push(centralDirData);

    const endRecord = createEndOfCentralDir(Object.keys(files).length, centralDirData.length, centralDirOffset);
    parts.push(endRecord);

    const totalSize = parts.reduce((acc, part) => acc + part.length, 0);
    const zipBuffer = new Uint8Array(totalSize);
    let pos = 0;
    for (const part of parts) {
        zipBuffer.set(part, pos);
        pos += part.length;
    }

    return new Blob([zipBuffer], {
        type: "application/zip"
    });
}   