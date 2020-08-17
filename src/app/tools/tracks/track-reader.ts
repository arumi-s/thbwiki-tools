import { AV } from './av';
import { readCUE, readNative, readFLAC, readTTA, readWAV, probeAIFF, readAIFF, probeM4A, readM4A, Track } from './media-formats';

function readArrayBuffer(file: File | Blob): Promise<ArrayBuffer> {
	if ('Response' in window) {
		return new Response(file).arrayBuffer();
	}
	return new Promise(resolve => {
		const fr = new FileReader();
		fr.onload = () => resolve(fr.result as ArrayBuffer);
		fr.readAsArrayBuffer(file);
	});
}

export async function readFile(file: File) {
	const title = file.name;
	let duration = -1;
	let type = '';
	if (file.name.toLowerCase().endsWith('.cue')) {
		const buffer = await readArrayBuffer(file);
		const stream = AV.Stream.fromBuffer(new AV.Buffer(buffer));
		return await readCUE(title, stream);
	}
	if (new Audio().canPlayType(file.type) !== '') {
		try {
			duration = await readNative(file);
			type = file.type.replace('audio/', '');
		} catch (e) {
			duration = -1;
		}
	}
	if (duration === -1) {
		const buffer = await readArrayBuffer(file.slice(0, 4096));
		const stream = AV.Stream.fromBuffer(new AV.Buffer(buffer));
		const sniff = stream.peekString(0, 4);
		switch (sniff) {
			case 'fLaC':
				duration = readFLAC(stream);
				type = 'flac';
				break;
			case 'TTA1':
				duration = readTTA(stream);
				type = 'tta';
				break;
			case 'RIFF':
				duration = readWAV(stream);
				type = 'wav';
				break;
			default:
				if (probeAIFF(stream)) {
					duration = readAIFF(stream);
					type = 'aiff';
					break;
				}
				if (probeM4A(stream)) {
					duration = readM4A(stream);
					type = 'm4a';
					break;
				}
				console.log('Unknown Format: ' + sniff);
				type = title.substr(1 + title.lastIndexOf('.')).substr(0, 5);
				break;
		}
	}
	if (duration >= 0) {
		return new Track(title, Math.round(duration), type);
	}
	return null;
}
