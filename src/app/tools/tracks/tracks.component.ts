import { Component, OnInit } from '@angular/core';
import { readFile } from './track-reader';
import { Track, Cue, supportFormats } from './media-formats';

declare global {
	interface String {
		splice: (start: number, delCount: number, newSubStr: string) => string;
	}
}
String.prototype.splice = function(start, delCount, newSubStr) {
	return this.slice(0, start) + newSubStr + this.slice(start + Math.abs(delCount));
};

interface Token {
	text: string;
	start: number;
	ref?: string;
}

@Component({
	selector: 'app-tracks',
	templateUrl: './tracks.component.html',
	styleUrls: ['./tracks.component.less']
})
export class TracksComponent implements OnInit {
	supportFormats = supportFormats();
	logs: Array<string> = [];
	tracks: Array<Track> = [];
	loadingTotal = 0;
	loadingProgress = 0;
	wikitext = '';

	constructor() {}

	ngOnInit(): void {}

	async dropFiles(files: Array<File>) {
		this.loadingTotal += files.length;
		if (files.length === 0) {
			this.logIn('没有选择文件');
			return;
		} else {
			const cues: Array<Cue> = [];
			const tracks: Array<Track> = [];
			const results: Array<Track> = [];
			try {
				for (let index = 0; index < files.length; index++) {
					const file = files[index];
					const data = await readFile(file);
					this.loadingProgress++;
					if (data instanceof Cue) cues.push(data);
					else if (data instanceof Track) tracks.push(data);
				}
			} catch (e) {
				this.logIn('读取文件失败');
				console.log(e);
				return;
			}
			for (let index = 0; index < cues.length; index++) {
				const data = cues[index];
				const match = tracks.findIndex(track => track instanceof Track && track.title === data.file);
				if (match !== -1) {
					results.push(...data.split((tracks.splice(match, 1)[0] as Track).duration));
				} else {
					this.logIn(`并未为CUE文件：${data.title}提供音频：${data.file}`);
					results.push(...data.split(0));
				}
			}
			tracks.forEach(track => {
				track.title = track.title.slice(0, track.title.lastIndexOf('.'));
				results.push(track);
			});
			if (results.length === 0) {
				this.logIn('没有可读取的音频文件');
				return;
			}
			this.tracks.push(...results);
		}
	}

	logIn(text: string) {
		this.logs.push(text);
	}

	clear() {
		this.tracks = [];
		this.loadingTotal = 0;
		this.loadingProgress = 0;
	}

	insert() {
		if (this.tracks.length === 0) {
			this.logIn('没有可读取的音频文件');
			return;
		}
		const tokens = extractTokens(this.wikitext);
		let offset = 0;
		for (let index = 0; index < this.tracks.length; index++) {
			const track = this.tracks[index];
			if (tokens[index] != null) {
				const token = tokens[index];
				const time = token.ref === '' ? track.getTime() : `${token.ref}${track.getTime()}\n`;
				this.wikitext = this.wikitext.splice(token.start + offset, token.text.length, time);
				offset += time.length - token.text.length;
			} else {
				this.wikitext += `
{{同人曲目信息|
|名称 = ${track.title}
|时长 = ${track.getTime()}
|编曲 = 
|演唱 = 
|作词 = 
|原曲 = 
}}`;
			}
		}
	}
}

function extractTokens(text: string) {
	const tokens: Array<Token> = [];
	const regex = /\{\{\s*同人曲目信息[\s\|]/g;
	let match: RegExpExecArray | null = null;
	while ((match = regex.exec(text)) != null) {
		const start = match.index + 2;
		const end = findNext(text, start, '}}');
		if (end === -1) continue;
		const targetToken = findTargetToken(text, start, end);
		if (targetToken == null) continue;
		tokens.push(targetToken);
	}
	return tokens;
}

function findTargetToken(text: string, start: number, end: number): Token | null {
	let token: Token | null = null;
	let pipe = 0;
	const innerText = text.substring(start, end);
	let nextPipe = findNext(innerText, 0, '|');

	while ((pipe = nextPipe) !== -1) {
		nextPipe = findNext(innerText, pipe + 1, '|');
		const paramStart = start + pipe + 1;
		const paramEnd = nextPipe === -1 ? end : start + nextPipe;
		const paramText = text.substring(paramStart, paramEnd);
		const paramPair = paramText.match(/(\S[^|=]*?)(\s*= *[\r\n]*?)([\s\S]*?)[\r\n]*$/);
		if (paramPair != null) {
			const [, paramName, paramMid, paramContent] = paramPair;
			const paramContentStart = paramStart + (paramPair.index ?? 0) + paramName.length + paramMid.length;
			if (paramName === '时长') {
				token = {
					text: paramContent,
					start: paramContentStart,
					ref: ''
				};
				break;
			} else if (paramName === '名称' || token == null) {
				token = {
					text: '',
					start: paramEnd,
					ref: '|时长 = '
				};
			}
		}
	}
	return token;
}

function findNext(text: string, offset = 0, find: '{{' | '|' | '}}' | '[[' | ']]' = '}}') {
	const regex = /\]\]|}}|\||{{|\[\[/g;
	let level = 0;
	let match: RegExpExecArray | null = null;
	if (offset > 0) text = text.substr(offset);
	while ((match = regex.exec(text)) != null) {
		if (level === 0 && match[0] === find) return offset + match.index;
		if (match[0] === '{{' || match[0] === '[[') ++level;
		else if (match[0] === '}}' || match[0] === ']]') --level;
	}
	return -1;
}
