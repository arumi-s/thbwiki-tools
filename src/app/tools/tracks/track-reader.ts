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
	if (file.name.toLowerCase().endsWith('.cue')) {
		const buffer = await readArrayBuffer(file);
		const stream = AV.Stream.fromBuffer(new AV.Buffer(buffer));
		return await readCUE(title, stream);
	}
	if (new Audio().canPlayType(file.type) !== '') {
		try {
			duration = await readNative(file);
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
				break;
			case 'TTA1':
				duration = readTTA(stream);
				break;
			case 'RIFF':
				duration = readWAV(stream);
				break;
			default:
				if (probeAIFF(stream)) {
					duration = readAIFF(stream);
					break;
				}
				if (probeM4A(stream)) {
					duration = readM4A(stream);
					break;
				}
				console.log('Unknown Format: ' + sniff);
				break;
		}
	}
	if (duration >= 0) {
		return new Track(title, Math.round(duration));
	}
	return null;
}
