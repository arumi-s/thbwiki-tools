export namespace EncodingDetect {
	/**
	 * ISO-2022-JP (JIS)
	 *
	 * RFC1468 Japanese Character Encoding for Internet Messages
	 * RFC1554 ISO-2022-JP-2: Multilingual Extension of ISO-2022-JP
	 * RFC2237 Japanese Character Encoding for Internet Messages
	 */
	export function isJIS(data: Uint8Array) {
		let i = 0;
		const len = data && data.length;
		let b, esc1, esc2;

		for (; i < len; i++) {
			b = data[i];
			if (b > 0xff || (b >= 0x80 && b <= 0xff)) {
				return false;
			}

			if (b === 0x1b) {
				if (i + 2 >= len) {
					return false;
				}

				esc1 = data[i + 1];
				esc2 = data[i + 2];
				if (esc1 === 0x24) {
					if (
						esc2 === 0x28 || // JIS X 0208-1990/2000/2004
						esc2 === 0x40 || // JIS X 0208-1978
						esc2 === 0x42
					) {
						// JIS X 0208-1983
						return true;
					}
				} else if (
					esc1 === 0x26 && // JIS X 0208-1990
					esc2 === 0x40
				) {
					return true;
				} else if (esc1 === 0x28) {
					if (
						esc2 === 0x42 || // ASCII
						esc2 === 0x49 || // JIS X 0201 Halfwidth Katakana
						esc2 === 0x4a
					) {
						// JIS X 0201-1976 Roman set
						return true;
					}
				}
			}
		}

		return false;
	}

	/**
	 * EUC-JP
	 */
	export function isEUCJP(data: Uint8Array) {
		let i = 0;
		const len = data && data.length;
		let b;

		for (; i < len; i++) {
			b = data[i];
			if (b < 0x80) {
				continue;
			}

			if (b > 0xff || b < 0x8e) {
				return false;
			}

			if (b === 0x8e) {
				if (i + 1 >= len) {
					return false;
				}

				b = data[++i];
				if (b < 0xa1 || 0xdf < b) {
					return false;
				}
			} else if (b === 0x8f) {
				if (i + 2 >= len) {
					return false;
				}

				b = data[++i];
				if (b < 0xa2 || 0xed < b) {
					return false;
				}

				b = data[++i];
				if (b < 0xa1 || 0xfe < b) {
					return false;
				}
			} else if (0xa1 <= b && b <= 0xfe) {
				if (i + 1 >= len) {
					return false;
				}

				b = data[++i];
				if (b < 0xa1 || 0xfe < b) {
					return false;
				}
			} else {
				return false;
			}
		}

		return true;
	}

	/**
	 * Shift-JIS (SJIS)
	 */
	export function isSJIS(data: Uint8Array) {
		let i = 0;
		const len = data && data.length;
		let b;

		while (i < len && data[i] > 0x80) {
			if (data[i++] > 0xff) {
				return false;
			}
		}

		for (; i < len; i++) {
			b = data[i];
			if (b <= 0x80 || (0xa1 <= b && b <= 0xdf)) {
				continue;
			}

			if (b === 0xa0 || b > 0xef || i + 1 >= len) {
				return false;
			}

			b = data[++i];
			if (b < 0x40 || b === 0x7f || b > 0xfc) {
				return false;
			}
		}

		return true;
	}

	/**
	 * UTF-8
	 */
	export function isUTF8(data: Uint8Array) {
		let i = 0;
		const len = data && data.length;
		let b;

		for (; i < len; i++) {
			b = data[i];
			if (b > 0xff) {
				return false;
			}

			if (b === 0x09 || b === 0x0a || b === 0x0d || (b >= 0x20 && b <= 0x7e)) {
				continue;
			}

			if (b >= 0xc2 && b <= 0xdf) {
				if (i + 1 >= len || data[i + 1] < 0x80 || data[i + 1] > 0xbf) {
					return false;
				}
				i++;
			} else if (b === 0xe0) {
				if (i + 2 >= len || data[i + 1] < 0xa0 || data[i + 1] > 0xbf || data[i + 2] < 0x80 || data[i + 2] > 0xbf) {
					return false;
				}
				i += 2;
			} else if ((b >= 0xe1 && b <= 0xec) || b === 0xee || b === 0xef) {
				if (i + 2 >= len || data[i + 1] < 0x80 || data[i + 1] > 0xbf || data[i + 2] < 0x80 || data[i + 2] > 0xbf) {
					return false;
				}
				i += 2;
			} else if (b === 0xed) {
				if (i + 2 >= len || data[i + 1] < 0x80 || data[i + 1] > 0x9f || data[i + 2] < 0x80 || data[i + 2] > 0xbf) {
					return false;
				}
				i += 2;
			} else if (b === 0xf0) {
				if (
					i + 3 >= len ||
					data[i + 1] < 0x90 ||
					data[i + 1] > 0xbf ||
					data[i + 2] < 0x80 ||
					data[i + 2] > 0xbf ||
					data[i + 3] < 0x80 ||
					data[i + 3] > 0xbf
				) {
					return false;
				}
				i += 3;
			} else if (b >= 0xf1 && b <= 0xf3) {
				if (
					i + 3 >= len ||
					data[i + 1] < 0x80 ||
					data[i + 1] > 0xbf ||
					data[i + 2] < 0x80 ||
					data[i + 2] > 0xbf ||
					data[i + 3] < 0x80 ||
					data[i + 3] > 0xbf
				) {
					return false;
				}
				i += 3;
			} else if (b === 0xf4) {
				if (
					i + 3 >= len ||
					data[i + 1] < 0x80 ||
					data[i + 1] > 0x8f ||
					data[i + 2] < 0x80 ||
					data[i + 2] > 0xbf ||
					data[i + 3] < 0x80 ||
					data[i + 3] > 0xbf
				) {
					return false;
				}
				i += 3;
			} else {
				return false;
			}
		}

		return true;
	}
}
