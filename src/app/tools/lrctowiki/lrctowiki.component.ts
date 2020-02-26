import { Component, OnInit } from '@angular/core';

type Lines = Array<[string, string]>;

@Component({
	selector: 'app-lrctowiki',
	templateUrl: './lrctowiki.component.html',
	styleUrls: ['./lrctowiki.component.less']
})
export class LrctowikiComponent implements OnInit {
	language: 'ja' | 'en' | 'zh' = 'ja';
	lrc = '';
	tran = '';
	wiki = '';

	constructor() {}

	ngOnInit(): void {}

	convert() {
		const lines = this.sepLRC(this.lrc);
		const trans = this.sepLRC(this.tran);
		const canzh = this.language !== 'zh' && trans.length > 0 && (trans[0][0] !== '' || trans[0][1] !== '');
		if (lines.length && (lines[0][0] !== '' || lines[0][1] !== '')) {
			this.wiki =
				(this.language === 'zh' ? '__LYRICSZH__' : '__LYRICS__') +
				'\n\n{{歌词信息|\n| 语言 = \n| 翻译 = ' +
				(canzh ? '中文' : '') +
				'\n| 译者 = \n}}\n\nlyrics=\n';
			if (lines[0][1] === '') lines.shift();
			if (lines[lines.length - 1][1] === '') lines.pop();
			for (let i = 0; i < lines.length; ++i) {
				if (lines[i][1] === '') this.wiki += '\nsep=' + lines[i][0] + '\n';
				else
					this.wiki +=
						'\ntime=' +
						lines[i][0] +
						'\n' +
						this.language +
						'=' +
						lines[i][1] +
						(this.language === 'zh' ? '\n' : '\nzh=' + (canzh ? this.findTime(trans, lines[i][0]) : '') + '\n');
			}
		}
	}

	convertsim() {
		const lines = this.lrc
			.trim()
			.replace(/\n{3,}/g, '\n\n')
			.split('\n');
		const trans = this.tran
			.trim()
			.replace(/\n{3,}/g, '\n\n')
			.split('\n');
		const canzh = this.language !== 'zh' && trans.length > 0 && trans[0] !== '';
		if (lines.length && lines[0] !== '') {
			this.wiki =
				(this.language == 'zh' ? '__LYRICSZH__' : '__LYRICS__') +
				'\n\n{{歌词信息|\n| 语言 = \n| 翻译 = ' +
				(canzh ? '中文' : '') +
				'\n| 译者 = \n}}\n\nlyrics=\n';
			for (let i = 0; i < lines.length; ++i) {
				if (lines[i] === '') this.wiki += '\nsep=\n';
				else
					this.wiki +=
						'\ntime=\n' +
						this.language +
						'=' +
						lines[i] +
						(this.language === 'zh' ? '\n' : '\nzh=' + (canzh ? trans[i] || '' : '') + '\n');
			}
		}
	}

	sepLRC(text: string) {
		let mat;
		const lines: Lines = [];
		const patt = /^\[\s*([\d:\.]+)\s*\](.*)$/gm;
		while ((mat = patt.exec(text)) != null && lines.length < 1000) {
			lines.push([mat[1], mat[2].trim()]);
		}
		return lines;
	}

	findTime(list: Lines, time: string) {
		for (let i = 0, l = list.length; i < l; ++i) {
			if (list[i][0] === time) return list[i][1];
		}
		return '';
	}
}
