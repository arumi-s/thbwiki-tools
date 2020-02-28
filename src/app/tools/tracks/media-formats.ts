import { AV } from './av';
import jschardet from 'jschardet';
import { EncodingDetect } from './encoding-detect';

// tslint:disable: no-bitwise

export class Track {
	constructor(public title = '', public duration = -1) {}

	getTime() {
		return (
			Math.floor(this.duration / 60)
				.toString()
				.padStart(2, '0') +
			':' +
			Math.floor(this.duration % 60)
				.toString()
				.padStart(2, '0')
		);
	}
}

export class Cue {
	meta: { [key: string]: string } = {};
	tracks: Array<{
		title: string;
		durationindex: number;
		[key: string]: string | number;
	}> = [];
	file: string;

	constructor(public title = '', public data = '', public encoding = '') {
		this.addData(data);
	}

	addTrackData(n: number, a: string, b: string | number) {
		if (this.tracks[n] == null) this.tracks[n] = { title: '', durationindex: 0 };
		this.tracks[n][a] = b;
	}
	addData(a: string) {
		if (a == null || typeof a !== 'string') return this;
		let b: RegExpExecArray | null = null;
		let tr = -1;
		const r = /^\s*(REM |)(\w+)\s+(.*)[\t\r\n]*$/gim;
		while ((b = r.exec(a)) != null) {
			const rem = b[1] !== '';
			let key = b[2].toLowerCase();
			const value: number | string = b[3];
			if (key === 'track' && !rem) {
				if (/^\d+/.test(value) != null) tr++;
			} else if (tr === -1) {
				if (rem) this.meta[key] = this.trimQuote(value);
				else {
					switch (key) {
						case 'file':
							const match = /^(.*) (\w+)$/i.exec(value.trim());
							if (match != null) this.file = this.trimQuote(match[1]);
							break;
						case 'performer':
						case 'songwriter':
							key = key === 'performer' ? 'artist' : 'composer';
							this.meta[key] = this.trimQuote(value);
							break;
						default:
							this.meta[key] = this.trimQuote(value);
					}
				}
			} else {
				if (rem) this.addTrackData(tr, key, this.trimQuote(value));
				else {
					switch (key) {
						case 'index':
							const match = /^01 ([\d:]+)$/.exec(value.trim());
							if (match != null) this.addTrackData(tr, 'durationindex', this.toTimeValue(match[1]));
							break;
						case 'performer':
						case 'songwriter':
							key = key === 'performer' ? 'artist' : 'composer';
							this.addTrackData(tr, key, this.trimQuote(value));
							break;
						default:
							this.addTrackData(tr, key, this.trimQuote(value));
					}
				}
			}
		}
		return this;
	}
	getData(key: string, def: any, tr: number) {
		if (tr != null) {
			if (this.tracks[tr] != null && this.tracks[tr][key] != null) return this.tracks[tr][key];
			return this.meta[key] == null ? def : this.meta[key];
		}
		return def;
	}
	split(totalDuration: number): Array<Track> {
		return this.tracks.map(
			(data, index) =>
				new Track(
					data.title === '' ? (index + 1).toString().padStart(2, '0') : data.title,
					Math.max((this.tracks[index + 1]?.durationindex ?? totalDuration) - (data.durationindex ?? 0), 0)
				)
		);
	}
	notUsed() {
		return '并未为CUE文件：' + this.title + '提供音频文件：' + this.file;
	}
	toTimeValue(t: string) {
		const match = t.match(/[\d\.]+/g);
		if (match == null) return 0;
		return parseInt(match[0] ?? '0', 10) * 60 + parseInt(match[1] ?? '0', 10) + parseInt(match[2] ?? '0', 10) / 75;
	}
	trimQuote(t: string) {
		return t
			.trim()
			.replace(/^["']|["']$/g, '')
			.trim();
	}
}

export function supportFormats(): Array<string> {
	const audio = new Audio();
	const nativeTypes = ['audio/wav', 'audio/mpeg', 'audio/ogg', 'audio/aac', 'audio/m4a', 'audio/webm', 'audio/opus', 'audio/3gpp']
		.filter(type => audio.canPlayType(type) !== '')
		.map(type => type.replace('audio/', ''));
	return ['cue', ...nativeTypes, 'flac', 'tta', 'aiff'];
}

export function readNative(file: File): Promise<number> {
	return new Promise((resolve, reject) => {
		const audio = new Audio();
		audio.onloadedmetadata = () => {
			resolve(audio.duration);
			audio.src = '';
		};
		audio.onerror = () => {
			reject(-1);
			audio.src = '';
		};
		audio.src = URL.createObjectURL(file);
	});
}

export async function readCUE(title: string, stream: AV.Stream, encoding?: string) {
	const data = stream.list.first.data;
	if (encoding == null) {
		try {
			encoding = jschardet.detect(Buffer.from(data.buffer) as any)?.encoding;
		} catch (e) {
			encoding = undefined;
		}
		if (encoding == null) {
			if (EncodingDetect.isSJIS(data)) encoding = 'SHIFT_JIS';
			else if (EncodingDetect.isJIS(data)) encoding = 'ISO-2022-JP';
			else if (EncodingDetect.isEUCJP(data)) encoding = 'EUC-JP';
			else encoding = 'ascii';
		}
	}
	if (encoding === 'UTF-16BE' || encoding === 'UTF-16LE' || encoding === 'utf16bom') {
		return tryCue(title, stream.readString(stream.list.availableBytes, 'utf16bom'), 'utf16bom');
	} else if (encoding === 'UTF-8' || encoding === 'utf8') {
		return tryCue(title, stream.readString(stream.list.availableBytes, 'utf8'), 'utf8');
	} else {
		if (encoding == null || encoding === '' || encoding === 'latin1' || encoding === 'ascii') {
			return tryCue(title, stream.readString(stream.list.availableBytes, 'ascii'), 'ascii');
		} else {
			return tryCue(title, await readNonUnicodeString(stream, encoding), encoding);
		}
	}
}

export function readNonUnicodeString(stream: AV.Stream, encoding: string): Promise<string> {
	return new Promise(resolve => {
		const xmlhttp = new XMLHttpRequest();
		xmlhttp.onload = () => resolve(xmlhttp.response);
		xmlhttp.onerror = () => resolve('');
		xmlhttp.open('GET', 'data:text/plain;charset=' + encoding + ',' + stream.readString(stream.list.availableBytes, 'url'), true);
		xmlhttp.responseType = 'text';
		xmlhttp.send();
	});
}

export function tryCue(title: string, data: string, encoding: string): Cue {
	const cue = new Cue(title, data, encoding);
	if (cue.file === '') throw new Error('Not a valid cue file');
	return cue;
}

export function readFLAC(stream: AV.Stream): number {
	stream.advance(4);
	if (stream.available(1)) {
		const type = stream.readUInt8() & 0x7f;
		const size = stream.readUInt24();
		if (type !== 0 || size !== 34 || !stream.available(size)) return 0;
		const bitstream = new AV.Bitstream(stream);
		bitstream.advance(80);
		const sampleRate = bitstream.read(20);
		bitstream.advance(8);
		const sampleCount = bitstream.read(36);
		return sampleCount / sampleRate;
	}
	return 0;
}

export function readTTA(stream: AV.Stream): number {
	stream.advance(4);
	if (stream.available(8)) {
		stream.advance(6);
		const sampleRate = stream.readUInt32(true);
		const sampleCount = stream.readUInt32(true);
		return sampleCount / sampleRate;
	}
	return 0;
}

export function readWAV(stream: AV.Stream): number {
	let bitsPerChannel = 1;
	let channelsPerFrame = 1;
	let sampleRate = 1;
	stream.advance(12);
	while (stream.available(9)) {
		const type = stream.readString(4);
		const len = stream.readUInt32(true);
		switch (type) {
			case 'fmt ':
				stream.advance(2);
				channelsPerFrame = stream.readUInt16(true);
				sampleRate = stream.readUInt32(true);
				stream.advance(6);
				bitsPerChannel = stream.readUInt16(true);
				stream.advance(len - 16);
				break;
			case 'data':
				return (8 * len) / bitsPerChannel / channelsPerFrame / sampleRate;
		}
	}
	return 0;
}

export function probeM4A(stream: AV.Stream): boolean {
	const TYPES = ['M4A ', 'M4P ', 'M4B ', 'M4V ', 'isom', 'mp42', 'qt  '];
	return stream.peekString(4, 4) === 'ftyp' && TYPES.includes(stream.peekString(8, 4));
}

export function readM4A(stream: AV.Stream): number {
	return 0;
}

export function probeAIFF(stream: AV.Stream): boolean {
	return stream.peekString(0, 4) === 'FORM' && ['AIFF', 'AIFC'].includes(stream.peekString(8, 4));
}

export function readAIFF(stream: AV.Stream): number {
	stream.advance(12);
	if (stream.available(9)) {
		const type = stream.readString(4);
		const len = stream.readUInt32();
		if (type === 'COMM') {
			if (!stream.available(len)) return 0;
			stream.advance(2);
			const sampleCount = stream.readUInt32();
			stream.advance(2);
			const sampleRate = stream.readFloat80();
			return sampleCount / sampleRate;
		}
	}
	return 0;
}
