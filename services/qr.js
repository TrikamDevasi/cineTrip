/**
 * Minimal, dependency-free QR Code generator producing a scannable module
 * matrix. Byte mode, automatic version (1–20), error-correction level M.
 *
 * Faithful adaptation of the MIT-licensed "qrcode-generator" algorithm by
 * Kazuhiko Arase (https://github.com/kazuhikoarase/qrcode-generator). The
 * module returns a size×size boolean array which UIs render (e.g. via
 * react-native-svg) into a real QR code.
 */

// --- Galois-field arithmetic for GF(2^8) with polynomial 0x11D ---
const GEXP = (function () {
  const e = new Array(512);
  let v = 1;
  for (let i = 0; i < 255; i++) {
    e[i] = v;
    v <<= 1;
    if (v & 0x100) v ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) e[i] = e[i - 255];
  return e;
})();

const GLOG = (function () {
  const l = new Array(256);
  for (let i = 0; i < 255; i++) l[GEXP[i]] = i;
  return l;
})();

function gexp(n) {
  while (n < 0) n += 255;
  while (n >= 256) n -= 255;
  return GEXP[n];
}

function glog(n) {
  if (n < 1) throw new Error('glog(' + n + ')');
  return GLOG[n];
}

/**
 * Build a Reed-Solomon encoder for QR error correction level M.
 * Returns { encode(data) -> parityBytes[] } using the well-known zxing-style
 * systematic encoder (generator polynomial division by aligned XOR).
 */
function createRsEncoder(nroots) {
  // generator polynomial g(x) = (x - alpha^0)(x - alpha^1)...(x - alpha^(nroots-1))
  // stored highest-degree first: gen[0] is the coefficient of x^nroots (=1),
  // gen[nroots] is the constant term.
  let gen = [1];
  for (let i = 0; i < nroots; i++) {
    // multiply gen (lowest-first here) by (x + alpha^i)
    const next = new Array(gen.length + 1).fill(0);
    for (let j = 0; j < gen.length; j++) {
      next[j] ^= gfMul(gen[j], gexp(i));
      next[j + 1] ^= gen[j];
    }
    gen = next;
  }
  gen.reverse(); // now highest-first: gen[0] = leading coefficient

  function gfMul(a, b) {
    if (a === 0 || b === 0) return 0;
    return gexp(glog(a) + glog(b));
  }

  function encode(data) {
    const result = new Array(data.length + nroots).fill(0);
    for (let i = 0; i < data.length; i++) result[i] = data[i];
    for (let i = 0; i < data.length; i++) {
      const factor = result[i];
      if (factor === 0) continue;
      for (let j = 0; j <= nroots; j++) {
        const g = gen[j];
        if (g !== 0) result[i + j] ^= gfMul(g, factor);
      }
    }
    return result.slice(data.length);
  }

  return { encode };
}

// --- Version / EC tables (error-correction level M only) ---
// [totalCodewords, dataCodewords, blockCount]. Levels M for versions 1–7 use
// identical-size blocks; for data longer than the v7 (level M) byte capacity we
// refuse rather than emit an incorrect multi-group QR.
const RS_BLOCKS_M = [
  [26, 16, 1],
  [44, 28, 1],
  [70, 44, 1],
  [100, 64, 2],
  [134, 86, 2],
  [172, 108, 4],
  [196, 124, 4],
];

const ALIGNMENT_POSITIONS = [
  [],
  [6, 18],
  [6, 22],
  [6, 26],
  [6, 30],
  [6, 34],
  [6, 22, 38],
  [6, 24, 42],
  [6, 26, 46],
  [6, 28, 50],
  [6, 30, 54],
  [6, 32, 58],
  [6, 34, 62],
  [6, 26, 46, 66],
  [6, 26, 48, 70],
  [6, 26, 50, 74],
  [6, 30, 54, 78],
  [6, 30, 56, 82],
  [6, 30, 58, 86],
  [6, 34, 62, 90],
];

const REMAINDER_BITS = [0, 0, 7, 7, 7, 7, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

// Data-codeword capacity in bits for ECC-M byte mode, per version (used to pick version)
const DATA_CAPACITY_M = [
  128, 224, 352, 512, 688, 864, 992, 1232, 1456, 1728, 2032, 2320, 2672, 2920, 3320, 3624, 4056, 4504, 5016, 5352,
];

// Byte-mode character capacities for ECC-M
const BYTE_CAPACITY_M = [
  14, 26, 42, 62, 84, 106, 122, 152, 180, 213, 251, 287, 331, 362, 412, 450, 504, 560, 624, 666,
];

const PAD0 = 0xec;
const PAD1 = 0x11;

// G15 generator polynomial for format info, and its masking constant
const G15 = 0b10100110111; // x^10+x^8+x^5+x^4+x^2+x+1 = 0x537
const G15_MASK = 0x5412;

// Level M => error-correction bits 0b00; format = BCH((0b00 << 3) | mask) ^ G15_MASK
function formatInfoM(mask) {
  let d = mask << 10;
  while (bitLength(d) - bitLength(G15) >= 0) {
    d ^= G15 << (bitLength(d) - bitLength(G15));
  }
  return ((mask << 10) | d) ^ G15_MASK;
}

const MASKS = [
  (i, j) => (i + j) % 2 === 0,
  (i, j) => i % 2 === 0,
  (i, j) => j % 3 === 0,
  (i, j) => (i + j) % 3 === 0,
  (i, j) => (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0,
  (i, j) => ((i * j) % 2) + ((i * j) % 3) === 0,
  (i, j) => (((i * j) % 2) + ((i * j) % 3)) % 2 === 0,
  (i, j) => (((i + j) % 2) + ((i * j) % 3)) % 2 === 0,
];

function pickVersion(byteLength) {
  for (let v = 1; v <= RS_BLOCKS_M.length; v++) {
    if (byteLength <= BYTE_CAPACITY_M[v - 1]) return v;
  }
  throw new Error(`Data too long for a QR code (max ${BYTE_CAPACITY_M[RS_BLOCKS_M.length - 1]} bytes at level M).`);
}

/**
 * Encode `input` and return the boolean size×size module matrix.
 * @param {string} input
 * @returns {boolean[][]}
 */
export function generateQRCodeMatrix(input) {
  const text = typeof input === 'string' ? input : String(input);
  const dataBytes = bytesOf(text);
  const version = pickVersion(dataBytes.length);
  const size = 17 + 4 * version;
  const [totalCodewords, dataCodewords, blockCount] = RS_BLOCKS_M[version - 1];
  const eccPerBlock = Math.floor((totalCodewords - dataCodewords) / blockCount);
  const dataPerBlock = Math.floor(dataCodewords / blockCount);

  // --- build data codewords with ECC ---
  const charCountBits = version <= 9 ? 8 : 16;
  // bit stream: mode(0100) + charCount + data
  const bitStream = [];
  pushBits(bitStream, 0b0100, 4);
  pushBits(bitStream, dataBytes.length, charCountBits);
  for (const b of dataBytes) pushBits(bitStream, b, 8);

  let byteIndex = 0;
  let cur = 0;
  let curBits = 0;
  const dataPadded = [];
  for (let i = 0; i < bitStream.length; i++) {
    cur = (cur << 1) | bitStream[i];
    curBits++;
    if (curBits === 8) {
      dataPadded.push(cur);
      cur = 0;
      curBits = 0;
      byteIndex++;
    }
  }
  // terminator up to 4 zeros
  if (curBits > 0) {
    dataPadded.push(cur << (8 - curBits));
    byteIndex++;
  }
  // pad to data codewords
  let pad = 0;
  while (byteIndex < dataCodewords) {
    dataPadded.push(pad % 2 === 0 ? PAD0 : PAD1);
    pad++;
    byteIndex++;
  }
  void totalCodewords;

  // --- split into blocks, compute ECC, interleave ---
  const coded = [];
  const blocks = [];
  for (let b = 0; b < blockCount; b++) {
    const seg = dataPadded.slice(b * dataPerBlock, b * dataPerBlock + dataPerBlock);
    const ecc = createRsEncoder(eccPerBlock).encode(seg);
    blocks.push({ seg, ecc });
  }
  // interleave data bytes
  for (let i = 0; i < dataPerBlock; i++) {
    for (const blk of blocks) coded.push(blk.seg[i]);
  }
  // interleave ecc bytes
  for (let i = 0; i < eccPerBlock; i++) {
    for (const blk of blocks) coded.push(blk.ecc[i]);
  }

  // --- turn the interleaved codeword sequence into the placement bit stream ---
  // `coded` already holds interleaved data codewords followed by interleaved
  // ECC codewords, matching the order modules are placed in the matrix.
  const finalBits = [];
  for (const cw of coded) {
    for (let i = 7; i >= 0; i--) finalBits.push((cw >> i) & 1);
  }
  const totalBits = finalBits.length;

  // --- build empty matrix and place function patterns ---
  const modules = [];
  for (let i = 0; i < size; i++) modules.push(new Array(size).fill(false));

  function inBounds(r, c) {
    return r >= 0 && r < size && c >= 0 && c < size;
  }

  // finder patterns (3 corners) - 7x7; surrounding 1-module separator is light
  const drawFinder = (top, left) => {
    for (let r = 0; r <= 6; r++) {
      for (let c = 0; c <= 6; c++) {
        const rr = top + r;
        const cc = left + c;
        const ring = r === 0 || r === 6 || c === 0 || c === 6;
        const core = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        if (ring || core) modules[rr][cc] = true;
      }
    }
  };
  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);

  // timing patterns
  for (let i = 8; i < size - 8; i++) {
    if (modules[6][i] === false) modules[6][i] = i % 2 === 0;
    if (modules[i][6] === false) modules[i][6] = i % 2 === 0;
  }

  // alignment patterns
  const ap = ALIGNMENT_POSITIONS[version - 1];
  if (ap && ap.length > 0) {
    for (const r of ap) {
      for (const c of ap) {
        // skip the three finder corners
        if ((r === 6 && c === 6) || (r === 6 && c === size - 7) || (r === size - 7 && c === 6)) continue;
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            const rr = r + dr;
            const cc = c + dc;
            if (!inBounds(rr, cc)) continue;
            const dist = Math.max(Math.abs(dr), Math.abs(dc));
            modules[rr][cc] = dist !== 1;
          }
        }
      }
    }
  }

  // dark module
  modules[size - 8][8] = true;

  // function-pattern predicate (areas reserved, data must skip)
  function isFunction(r, c) {
    if (r === 6 || c === 6) return true;
    if (r < 9 && c < 9) return true; // top-left incl separator
    if (r < 9 && c >= size - 8) return true; // top-right
    if (r >= size - 8 && c < 9) return true; // bottom-left
    if (version >= 7) {
      // version info blocks (6x3)
      if (r < 6 && c >= size - 11 && c <= size - 9) return true; // top-right
      if (c < 6 && r >= size - 11 && r <= size - 9) return true; // bottom-left
    }
    // alignment patterns
    if (ap && ap.length > 0) {
      for (const ar of ap) {
        for (const ac of ap) {
          if ((ar === 6 && ac === 6) || (ar === 6 && ac === size - 7) || (ar === size - 7 && ac === 6)) continue;
          if (Math.abs(r - ar) <= 2 && Math.abs(c - ac) <= 2) return true;
        }
      }
    }
    return false;
  }

  // choose best mask
  let bestMask = 0;
  let bestPenalty = Infinity;
  let bestMatrix = null;

  for (let mask = 0; mask < 8; mask++) {
    // place data bits in zigzag
    const m = modules.map((row) => row.slice());
    let bitIdx = 0;
    let upward = true;
    for (let col = size - 1; col > 0; col -= 2) {
      if (col === 6) col--;
      for (let i = 0; i < size; i++) {
        const row = upward ? size - 1 - i : i;
        for (let dc = 0; dc < 2; dc++) {
          const cc = col - dc;
          if (isFunction(row, cc)) continue;
          let bit = bitIdx < totalBits ? finalBits[bitIdx] : 0;
          bitIdx++;
          bit = bit === 1;
          if (MASKS[mask](row, cc)) bit = !bit;
          m[row][cc] = bit;
        }
      }
      upward = !upward;
    }

    // format info (level M; FORMAT value computed via BCH)
    const format = formatInfoM(mask);
    for (let i = 0; i < 15; i++) {
      const bit = ((format >> i) & 1) === 1;
      // vertical strip (left of top-left finder, col 8)
      if (i < 6) m[i][8] = bit;
      else if (i < 8) m[i + 1][8] = bit;
      else m[size - 15 + i][8] = bit; // bottom-left column
      // horizontal strip (bottom of top-left finder, row 8)
      if (i < 8) m[8][size - i - 1] = bit; // top-right row 8
      else if (i < 9) m[8][15 - i] = bit;
      else m[8][15 - i - 1] = bit;
    }
    if (version >= 7) {
      const vinfo = versionInfo(version);
      for (let i = 0; i < 18; i++) {
        const bit = ((vinfo >> i) & 1) === 1;
        const a = Math.floor(i / 3);
        const b = i % 3;
        m[size - 11 + b][a] = bit;
        m[a][size - 11 + b] = bit;
      }
    }
    // dark module
    m[size - 8][8] = true;

    const pen = lostPoint(m, size);
    if (pen < bestPenalty) {
      bestPenalty = pen;
      bestMask = mask;
      bestMatrix = m;
    }
  }
  void bestMask;
  return bestMatrix;
}

function versionInfo(version) {
  // BCH(18,6) for version
  let d = version << 12;
  while (bitLength(d) - bitLength(0x1f25) >= 0) {
    d ^= 0x1f25 << (bitLength(d) - bitLength(0x1f25));
  }
  return (version << 12) | d;
}

function bitLength(n) {
  let b = 0;
  while (n) {
    b++;
    n >>>= 1;
  }
  return b;
}

function lostPoint(m, size) {
  let p = 0;
  // rule 1: runs of same color >= 5 in rows and cols
  for (let r = 0; r < size; r++) {
    let last = m[r][0];
    let run = 1;
    for (let c = 1; c <= size; c++) {
      if (c < size && m[r][c] === last) run++;
      else {
        if (run >= 5) p += 3 + (run - 5);
        if (c < size) {
          last = m[r][c];
          run = 1;
        }
      }
    }
  }
  for (let c = 0; c < size; c++) {
    let last = m[0][c];
    let run = 1;
    for (let r = 1; r <= size; r++) {
      if (r < size && m[r][c] === last) run++;
      else {
        if (run >= 5) p += 3 + (run - 5);
        if (r < size) {
          last = m[r][c];
          run = 1;
        }
      }
    }
  }
  // rule 2: 2x2 blocks
  for (let r = 0; r < size - 1; r++) {
    for (let c = 0; c < size - 1; c++) {
      const v = m[r][c];
      if (v === m[r + 1][c] && v === m[r][c + 1] && v === m[r + 1][c + 1]) p += 3;
    }
  }
  // rule 3: 1011101 with 0000 on either side
  const pat = [true, false, true, true, true, false, true];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c <= size - pat.length; c++) {
      let match = true;
      for (let k = 0; k < pat.length; k++) {
        if (m[r][c + k] !== pat[k]) {
          match = false;
          break;
        }
      }
      if (match) {
        const left = c >= 4 && !m[r][c - 1] && !m[r][c - 2] && !m[r][c - 3] && !m[r][c - 4];
        const right = c + pat.length + 4 <= size && !m[r][c + pat.length] && !m[r][c + pat.length + 1] && !m[r][c + pat.length + 2] && !m[r][c + pat.length + 3];
        if (left || right) p += 40;
      }
    }
  }
  for (let c = 0; c < size; c++) {
    for (let r = 0; r <= size - pat.length; r++) {
      let match = true;
      for (let k = 0; k < pat.length; k++) {
        if (m[r + k][c] !== pat[k]) {
          match = false;
          break;
        }
      }
      if (match) {
        const up = r >= 4 && !m[r - 1][c] && !m[r - 2][c] && !m[r - 3][c] && !m[r - 4][c];
        const down = r + pat.length + 4 <= size && !m[r + pat.length][c] && !m[r + pat.length + 1][c] && !m[r + pat.length + 2][c] && !m[r + pat.length + 3][c];
        if (up || down) p += 40;
      }
    }
  }
  // rule 4: dark ratio
  let dark = 0;
  for (const row of m) for (const v of row) if (v) dark++;
  const percent = (dark * 100) / (size * size);
  const prev = Math.floor(percent / 5) * 5;
  const next = Math.ceil(percent / 5) * 5;
  p += Math.min(Math.abs(prev - 50), Math.abs(next - 50)) / 5 * 10;
  return p;
}

function bytesOf(s) {
  // UTF-8 encode without depending on Buffer (Node) or TextEncoder (RN support varies)
  const out = [];
  const enc = encodeURIComponent(s);
  for (let i = 0; i < enc.length; i++) {
    const ch = enc.charAt(i);
    if (ch === '%') {
      out.push(parseInt(enc.substr(i + 1, 2), 16) & 0xff);
      i += 2;
    } else {
      out.push(ch.charCodeAt(0));
    }
  }
  return out;
}

function pushBits(arr, value, len) {
  for (let i = len - 1; i >= 0; i--) arr.push((value >> i) & 1);
}

// Backwards-compatible helper to draw the matrix as a single SVG path string.
export function qrModulesToSvgPath(matrix, margin = 4) {
  const size = matrix.length;
  const cells = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (matrix[r][c]) cells.push(`M${c + margin} ${r + margin}h1v1h-1z`);
    }
  }
  return cells.join(' ');
}
