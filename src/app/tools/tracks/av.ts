// tslint:disable: no-bitwise

// port from https://github.com/audiocogs/aurora.js/tree/master/src/core

export namespace AV {
	export type Encoding = 'ascii' | 'latin1' | 'utf8' | 'utf16be' | 'utf16le' | 'utf16bom' | 'url';

	export class Buffer {
		data: Uint8Array;
		length: number;
		next: Buffer;
		prev: Buffer;

		constructor(input: Uint8Array | ArrayBuffer | Buffer | number) {
			if (input instanceof Uint8Array) {
				this.data = input;
			} else if (input instanceof ArrayBuffer) {
				this.data = new Uint8Array(input);
			} else if (typeof input === 'number') {
				this.data = new Uint8Array(input);
			} else if (input instanceof Buffer) {
				this.data = input.data;
			} else {
				throw new Error('Constructing buffer with unknown type.');
			}
			this.length = this.data.length;
		}

		static allocate(size: number) {
			return new Buffer(size);
		}

		copy() {
			return new Buffer(new Uint8Array(this.data));
		}

		slice(position: number, length: number) {
			if (length == null) {
				length = this.length;
			}
			if (position === 0 && length >= this.length) {
				return new Buffer(this.data);
			} else {
				return new Buffer(this.data.subarray(position, position + length));
			}
		}
	}

	export class BufferList {
		first: Buffer;
		last: Buffer;
		numBuffers = 0;
		availableBytes = 0;
		availableBuffers = 0;

		copy() {
			const result = new BufferList();
			result.first = this.first;
			result.last = this.last;
			result.numBuffers = this.numBuffers;
			result.availableBytes = this.availableBytes;
			result.availableBuffers = this.availableBuffers;
			return result;
		}

		append(buffer: Buffer) {
			buffer.prev = this.last;
			const ref = this.last;
			if (ref != null) {
				ref.next = buffer;
			}
			this.last = buffer;
			if (this.first == null) {
				this.first = buffer;
			}
			this.availableBytes += buffer.length;
			this.availableBuffers++;
			return this.numBuffers++;
		}

		advance() {
			if (this.first) {
				this.availableBytes -= this.first.length;
				this.availableBuffers--;
				this.first = this.first.next;
				return this.first != null;
			}
			return false;
		}

		rewind() {
			let _ref: Buffer | null;
			if (this.first && !this.first.prev) {
				return false;
			}
			this.first = ((_ref = this.first) != null ? _ref.prev : void 0) || this.last;
			if (this.first) {
				this.availableBytes += this.first.length;
				this.availableBuffers++;
			}
			return this.first != null;
		}

		reset() {
			while (this.rewind()) {}
			return [];
		}
	}

	export class Stream {
		buf = new ArrayBuffer(16);
		uint8 = new Uint8Array(this.buf);
		int8 = new Int8Array(this.buf);
		uint16 = new Uint16Array(this.buf);
		int16 = new Int16Array(this.buf);
		uint32 = new Uint32Array(this.buf);
		int32 = new Int32Array(this.buf);
		float32 = new Float32Array(this.buf);
		float64 = typeof Float64Array !== 'undefined' && Float64Array !== null ? new Float64Array(this.buf) : null;

		nativeEndian = new Uint16Array(new Uint8Array([0x12, 0x34]).buffer)[0] === 0x3412;

		localOffset = 0;
		offset = 0;

		constructor(public list: BufferList) {}

		static fromBuffer(buffer: Buffer): Stream {
			const list = new BufferList();
			list.append(buffer);
			return new Stream(list);
		}

		copy() {
			const result = new Stream(this.list.copy());
			result.localOffset = this.localOffset;
			result.offset = this.offset;
			return result;
		}

		available(bytes: number) {
			return bytes <= this.list.availableBytes - this.localOffset;
		}

		remainingBytes() {
			return this.list.availableBytes - this.localOffset;
		}

		advance(bytes: number) {
			if (!this.available(bytes)) {
				throw new Error('Underflow');
			}
			this.localOffset += bytes;
			this.offset += bytes;
			while (this.list.first && this.localOffset >= this.list.first.length) {
				this.localOffset -= this.list.first.length;
				this.list.advance();
			}
			return this;
		}

		rewind(bytes: number) {
			if (bytes > this.offset) {
				throw new Error('Underflow');
			}
			if (!this.list.first) {
				this.list.rewind();
				this.localOffset = ((this.list.first as any) as Buffer).length;
			}
			this.localOffset -= bytes;
			this.offset -= bytes;
			while (this.list.first.prev && this.localOffset < 0) {
				this.list.rewind();
				this.localOffset += this.list.first.length;
			}
			return this;
		}

		seek(position: number) {
			if (position > this.offset) {
				return this.advance(position - this.offset);
			} else if (position < this.offset) {
				return this.rewind(this.offset - position);
			}
			return this;
		}

		readUInt8() {
			if (!this.available(1)) {
				throw new Error('Underflow');
			}
			const a = this.list.first.data[this.localOffset];
			this.localOffset += 1;
			this.offset += 1;
			if (this.localOffset === this.list.first.length) {
				this.localOffset = 0;
				this.list.advance();
			}
			return a;
		}

		peekUInt8(offset?: number) {
			if (offset == null) {
				offset = 0;
			}
			if (!this.available(offset + 1)) {
				throw new Error('Underflow');
			}
			offset = this.localOffset + offset;
			let buffer = this.list.first;
			while (buffer) {
				if (buffer.length > offset) {
					return buffer.data[offset];
				}
				offset -= buffer.length;
				buffer = buffer.next;
			}
			return 0;
		}

		read(bytes: number, littleEndian?: boolean) {
			let i, _i, _j, _ref;
			if (littleEndian == null) littleEndian = false;
			if (littleEndian === this.nativeEndian) {
				for (i = _i = 0; _i < bytes; i = _i += 1) {
					this.uint8[i] = this.readUInt8();
				}
			} else {
				for (i = _j = _ref = bytes - 1; _j >= 0; i = _j += -1) {
					this.uint8[i] = this.readUInt8();
				}
			}
		}

		peek(bytes: number, offset?: number, littleEndian?: boolean) {
			let i, _i, _j;
			if (offset == null) {
				offset = 0;
			}
			if (littleEndian == null) {
				littleEndian = false;
			}
			if (littleEndian === this.nativeEndian) {
				for (i = _i = 0; _i < bytes; i = _i += 1) {
					this.uint8[i] = this.peekUInt8(offset + i);
				}
			} else {
				for (i = _j = 0; _j < bytes; i = _j += 1) {
					this.uint8[bytes - i - 1] = this.peekUInt8(offset + i);
				}
			}
		}

		readInt8() {
			this.read(1);
			return this.int8[0];
		}

		peekInt8(offset?: number) {
			if (offset == null) {
				offset = 0;
			}
			this.peek(1, offset);
			return this.int8[0];
		}

		readUInt16(littleEndian?: boolean) {
			this.read(2, littleEndian);
			return this.uint16[0];
		}

		peekUInt16(offset?: number, littleEndian?: boolean) {
			if (offset == null) {
				offset = 0;
			}
			this.peek(2, offset, littleEndian);
			return this.uint16[0];
		}

		readInt16(littleEndian?: boolean) {
			this.read(2, littleEndian);
			return this.int16[0];
		}

		peekInt16(offset?: number, littleEndian?: boolean) {
			if (offset == null) {
				offset = 0;
			}
			this.peek(2, offset, littleEndian);
			return this.int16[0];
		}

		readUInt24(littleEndian?: boolean) {
			if (littleEndian) {
				return this.readUInt16(true) + (this.readUInt8() << 16);
			} else {
				return (this.readUInt16() << 8) + this.readUInt8();
			}
		}

		peekUInt24(offset?: number, littleEndian?: boolean) {
			if (offset == null) {
				offset = 0;
			}
			if (littleEndian) {
				return this.peekUInt16(offset, true) + (this.peekUInt8(offset + 2) << 16);
			} else {
				return (this.peekUInt16(offset) << 8) + this.peekUInt8(offset + 2);
			}
		}

		readInt24(littleEndian?: boolean) {
			if (littleEndian) {
				return this.readUInt16(true) + (this.readInt8() << 16);
			} else {
				return (this.readInt16() << 8) + this.readUInt8();
			}
		}

		peekInt24(offset?: number, littleEndian?: boolean) {
			if (offset == null) {
				offset = 0;
			}
			if (littleEndian) {
				return this.peekUInt16(offset, true) + (this.peekInt8(offset + 2) << 16);
			} else {
				return (this.peekInt16(offset) << 8) + this.peekUInt8(offset + 2);
			}
		}

		readUInt32(littleEndian?: boolean) {
			this.read(4, littleEndian);
			return this.uint32[0];
		}

		peekUInt32(offset?: number, littleEndian?: boolean) {
			if (offset == null) {
				offset = 0;
			}
			this.peek(4, offset, littleEndian);
			return this.uint32[0];
		}

		readInt32(littleEndian?: boolean) {
			this.read(4, littleEndian);
			return this.int32[0];
		}

		peekInt32(offset?: number, littleEndian?: boolean) {
			if (offset == null) {
				offset = 0;
			}
			this.peek(4, offset, littleEndian);
			return this.int32[0];
		}

		readFloat32(littleEndian?: boolean) {
			this.read(4, littleEndian);
			return this.float32[0];
		}

		peekFloat32(offset?: number, littleEndian?: boolean) {
			if (offset == null) {
				offset = 0;
			}
			this.peek(4, offset, littleEndian);
			return this.float32[0];
		}

		readFloat64(littleEndian?: boolean) {
			this.read(8, littleEndian);
			if (this.float64) {
				return this.float64[0];
			} else {
				return this.float64Fallback();
			}
		}

		float64Fallback() {
			let exp, frac, high, low, out, sign;
			(low = this.uint32[0]), (high = this.uint32[1]);
			if (!high || high === 0x80000000) {
				return 0.0;
			}
			sign = 1 - (high >>> 31) * 2;
			exp = (high >>> 20) & 0x7ff;
			frac = high & 0xfffff;
			if (exp === 0x7ff) {
				if (frac) {
					return NaN;
				}
				return sign * Infinity;
			}
			exp -= 1023;
			out = (frac | 0x100000) * Math.pow(2, exp - 20);
			out += low * Math.pow(2, exp - 52);
			return sign * out;
		}

		peekFloat64(offset?: number, littleEndian?: boolean) {
			if (offset == null) {
				offset = 0;
			}
			this.peek(8, offset, littleEndian);
			if (this.float64) {
				return this.float64[0];
			} else {
				return this.float64Fallback();
			}
		}

		readFloat80(littleEndian?: boolean) {
			this.read(10, littleEndian);
			return this.float80();
		}

		float80() {
			let a0, a1, exp, high, low, out, sign;
			(high = this.uint32[0]), (low = this.uint32[1]);
			a0 = this.uint8[9];
			a1 = this.uint8[8];
			sign = 1 - (a0 >>> 7) * 2;
			exp = ((a0 & 0x7f) << 8) | a1;
			if (exp === 0 && low === 0 && high === 0) {
				return 0;
			}
			if (exp === 0x7fff) {
				if (low === 0 && high === 0) {
					return sign * Infinity;
				}
				return NaN;
			}
			exp -= 16383;
			out = low * Math.pow(2, exp - 31);
			out += high * Math.pow(2, exp - 63);
			return sign * out;
		}

		peekFloat80(offset?: number, littleEndian?: boolean) {
			if (offset == null) {
				offset = 0;
			}
			this.peek(10, offset, littleEndian);
			return this.float80();
		}

		readBuffer(length: number) {
			let i, result, to, _i;
			result = Buffer.allocate(length);
			to = result.data;
			for (i = _i = 0; _i < length; i = _i += 1) {
				to[i] = this.readUInt8();
			}
			return result;
		}

		peekBuffer(offset: number | null, length: number) {
			let i, result, to, _i;
			if (offset == null) {
				offset = 0;
			}
			result = Buffer.allocate(length);
			to = result.data;
			for (i = _i = 0; _i < length; i = _i += 1) {
				to[i] = this.peekUInt8(offset + i);
			}
			return result;
		}

		readSingleBuffer(length: number) {
			let result;
			result = this.list.first.slice(this.localOffset, length);
			this.advance(result.length);
			return result;
		}

		peekSingleBuffer(offset: number, length: number) {
			let result;
			result = this.list.first.slice(this.localOffset + offset, length);
			return result;
		}

		readString(length?: number, encoding?: Encoding) {
			if (encoding == null) {
				encoding = 'ascii';
			}
			return this.decodeString(0, length, encoding, true);
		}

		peekString(offset?: number, length?: number, encoding?: Encoding) {
			if (offset == null) {
				offset = 0;
			}
			if (encoding == null) {
				encoding = 'ascii';
			}
			return this.decodeString(offset, length, encoding, false);
		}

		decodeString(offset: number, length: number | null | undefined, encoding: Encoding, advance: boolean) {
			let b1, b2, b3, b4, bom, c, end, littleEndian, nullEnd, pt, result, w1, w2;
			nullEnd = length === null ? 0 : -1;
			if (length == null) {
				length = Infinity;
			}
			end = offset + length;
			result = '';
			switch (encoding) {
				case 'ascii':
				case 'latin1':
					while (offset < end && (c = this.peekUInt8(offset++)) !== nullEnd) {
						result += String.fromCharCode(c);
					}
					break;
				case 'utf8':
					while (offset < end && (b1 = this.peekUInt8(offset++)) !== nullEnd) {
						if ((b1 & 0x80) === 0) {
							result += String.fromCharCode(b1);
						} else if ((b1 & 0xe0) === 0xc0) {
							b2 = this.peekUInt8(offset++) & 0x3f;
							result += String.fromCharCode(((b1 & 0x1f) << 6) | b2);
						} else if ((b1 & 0xf0) === 0xe0) {
							b2 = this.peekUInt8(offset++) & 0x3f;
							b3 = this.peekUInt8(offset++) & 0x3f;
							result += String.fromCharCode(((b1 & 0x0f) << 12) | (b2 << 6) | b3);
						} else if ((b1 & 0xf8) === 0xf0) {
							b2 = this.peekUInt8(offset++) & 0x3f;
							b3 = this.peekUInt8(offset++) & 0x3f;
							b4 = this.peekUInt8(offset++) & 0x3f;
							pt = (((b1 & 0x0f) << 18) | (b2 << 12) | (b3 << 6) | b4) - 0x10000;
							result += String.fromCharCode(0xd800 + (pt >> 10), 0xdc00 + (pt & 0x3ff));
						}
					}
					break;
				case 'utf16be':
				case 'utf16le':
				case 'utf16bom':
					switch (encoding) {
						case 'utf16be':
							littleEndian = false;
							break;
						case 'utf16le':
							littleEndian = true;
							break;
						case 'utf16bom':
							if (length < 2 || (bom = this.peekUInt16(offset)) === nullEnd) {
								if (advance) {
									this.advance((offset += 2));
								}
								return result;
							}
							littleEndian = bom === 0xfffe;
							offset += 2;
					}
					while (offset < end && (w1 = this.peekUInt16(offset, littleEndian)) !== nullEnd) {
						offset += 2;
						if (w1 < 0xd800 || w1 > 0xdfff) {
							result += String.fromCharCode(w1);
						} else {
							if (w1 > 0xdbff) {
								throw new Error('Invalid utf16 sequence.');
							}
							w2 = this.peekUInt16(offset, littleEndian);
							if (w2 < 0xdc00 || w2 > 0xdfff) {
								throw new Error('Invalid utf16 sequence.');
							}
							result += String.fromCharCode(w1, w2);
							offset += 2;
						}
					}
					if (w1 === nullEnd) {
						offset += 2;
					}
					break;
				case 'url':
					while (offset < end && (c = this.peekUInt8(offset++)) !== nullEnd) {
						result += '%' + (c < 16 ? '0' : '') + c.toString(16);
					}
					break;
				default:
					throw new Error('Unknown encoding: ' + encoding);
			}
			if (advance) {
				this.advance(offset);
			}
			return result;
		}
	}

	export class Bitstream {
		bitPosition = 0;

		constructor(public stream: Stream) {}

		copy() {
			const result = new Bitstream(this.stream.copy());
			result.bitPosition = this.bitPosition;
			return result;
		}

		offset() {
			return 8 * this.stream.offset + this.bitPosition;
		}

		available(bits: number) {
			return this.stream.available((bits + this.bitPosition + 7) >> 3);
		}

		advance(bits: number) {
			let pos;
			pos = this.bitPosition + bits;
			this.stream.advance(pos >> 3);
			return (this.bitPosition = pos & 7);
		}

		rewind(bits: number) {
			let pos;
			pos = this.bitPosition - bits;
			this.stream.rewind(Math.abs(pos >> 3));
			return (this.bitPosition = pos & 7);
		}

		seek(offset: number) {
			let curOffset;
			curOffset = this.offset();
			if (offset > curOffset) {
				return this.advance(offset - curOffset);
			} else if (offset < curOffset) {
				return this.rewind(curOffset - offset);
			}
			return 0;
		}

		align() {
			if (this.bitPosition !== 0) {
				this.bitPosition = 0;
				return this.stream.advance(1);
			}
			return this.stream;
		}

		read(bits: number, signed?: boolean) {
			let a, a0, a1, a2, a3, a4, mBits;
			if (bits === 0) {
				return 0;
			}
			mBits = bits + this.bitPosition;
			if (mBits <= 8) {
				a = ((this.stream.peekUInt8() << this.bitPosition) & 0xff) >>> (8 - bits);
			} else if (mBits <= 16) {
				a = ((this.stream.peekUInt16() << this.bitPosition) & 0xffff) >>> (16 - bits);
			} else if (mBits <= 24) {
				a = ((this.stream.peekUInt24() << this.bitPosition) & 0xffffff) >>> (24 - bits);
			} else if (mBits <= 32) {
				a = (this.stream.peekUInt32() << this.bitPosition) >>> (32 - bits);
			} else if (mBits <= 40) {
				a0 = this.stream.peekUInt8(0) * 0x0100000000;
				a1 = (this.stream.peekUInt8(1) << 24) >>> 0;
				a2 = this.stream.peekUInt8(2) << 16;
				a3 = this.stream.peekUInt8(3) << 8;
				a4 = this.stream.peekUInt8(4);
				a = a0 + a1 + a2 + a3 + a4;
				a %= Math.pow(2, 40 - this.bitPosition);
				a = Math.floor(a / Math.pow(2, 40 - this.bitPosition - bits));
			} else {
				throw new Error('Too many bits!');
			}
			if (signed) {
				if (mBits < 32) {
					if (a >>> (bits - 1)) {
						a = (((1 << bits) >>> 0) - a) * -1;
					}
				} else {
					if ((a / Math.pow(2, bits - 1)) | 0) {
						a = (Math.pow(2, bits) - a) * -1;
					}
				}
			}
			this.advance(bits);
			return a;
		}

		peek(bits: number, signed?: boolean) {
			let a, a0, a1, a2, a3, a4, mBits;
			if (bits === 0) {
				return 0;
			}
			mBits = bits + this.bitPosition;
			if (mBits <= 8) {
				a = ((this.stream.peekUInt8() << this.bitPosition) & 0xff) >>> (8 - bits);
			} else if (mBits <= 16) {
				a = ((this.stream.peekUInt16() << this.bitPosition) & 0xffff) >>> (16 - bits);
			} else if (mBits <= 24) {
				a = ((this.stream.peekUInt24() << this.bitPosition) & 0xffffff) >>> (24 - bits);
			} else if (mBits <= 32) {
				a = (this.stream.peekUInt32() << this.bitPosition) >>> (32 - bits);
			} else if (mBits <= 40) {
				a0 = this.stream.peekUInt8(0) * 0x0100000000;
				a1 = (this.stream.peekUInt8(1) << 24) >>> 0;
				a2 = this.stream.peekUInt8(2) << 16;
				a3 = this.stream.peekUInt8(3) << 8;
				a4 = this.stream.peekUInt8(4);
				a = a0 + a1 + a2 + a3 + a4;
				a %= Math.pow(2, 40 - this.bitPosition);
				a = Math.floor(a / Math.pow(2, 40 - this.bitPosition - bits));
			} else {
				throw new Error('Too many bits!');
			}
			if (signed) {
				if (mBits < 32) {
					if (a >>> (bits - 1)) {
						a = (((1 << bits) >>> 0) - a) * -1;
					}
				} else {
					if ((a / Math.pow(2, bits - 1)) | 0) {
						a = (Math.pow(2, bits) - a) * -1;
					}
				}
			}
			return a;
		}

		readLSB(bits: number, signed?: boolean) {
			let a, mBits;
			if (bits === 0) {
				return 0;
			}
			if (bits > 40) {
				throw new Error('Too many bits!');
			}
			mBits = bits + this.bitPosition;
			a = this.stream.peekUInt8(0) >>> this.bitPosition;
			if (mBits > 8) {
				a |= this.stream.peekUInt8(1) << (8 - this.bitPosition);
			}
			if (mBits > 16) {
				a |= this.stream.peekUInt8(2) << (16 - this.bitPosition);
			}
			if (mBits > 24) {
				a += (this.stream.peekUInt8(3) << (24 - this.bitPosition)) >>> 0;
			}
			if (mBits > 32) {
				a += this.stream.peekUInt8(4) * Math.pow(2, 32 - this.bitPosition);
			}
			if (mBits >= 32) {
				a %= Math.pow(2, bits);
			} else {
				a &= (1 << bits) - 1;
			}
			if (signed) {
				if (mBits < 32) {
					if (a >>> (bits - 1)) {
						a = (((1 << bits) >>> 0) - a) * -1;
					}
				} else {
					if ((a / Math.pow(2, bits - 1)) | 0) {
						a = (Math.pow(2, bits) - a) * -1;
					}
				}
			}
			this.advance(bits);
			return a;
		}

		peekLSB(bits: number, signed?: boolean) {
			let a, mBits;
			if (bits === 0) {
				return 0;
			}
			if (bits > 40) {
				throw new Error('Too many bits!');
			}
			mBits = bits + this.bitPosition;
			a = this.stream.peekUInt8(0) >>> this.bitPosition;
			if (mBits > 8) {
				a |= this.stream.peekUInt8(1) << (8 - this.bitPosition);
			}
			if (mBits > 16) {
				a |= this.stream.peekUInt8(2) << (16 - this.bitPosition);
			}
			if (mBits > 24) {
				a += (this.stream.peekUInt8(3) << (24 - this.bitPosition)) >>> 0;
			}
			if (mBits > 32) {
				a += this.stream.peekUInt8(4) * Math.pow(2, 32 - this.bitPosition);
			}
			if (mBits >= 32) {
				a %= Math.pow(2, bits);
			} else {
				a &= (1 << bits) - 1;
			}
			if (signed) {
				if (mBits < 32) {
					if (a >>> (bits - 1)) {
						a = (((1 << bits) >>> 0) - a) * -1;
					}
				} else {
					if ((a / Math.pow(2, bits - 1)) | 0) {
						a = (Math.pow(2, bits) - a) * -1;
					}
				}
			}
			return a;
		}
	}
}
