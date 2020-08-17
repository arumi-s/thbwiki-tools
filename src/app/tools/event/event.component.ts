import { Component, OnInit, ViewChild } from '@angular/core';
import { GoogleAnalyticsService } from 'ngx-google-analytics';
import { EventPreviewComponent } from './event-preview/event-preview.component';
import naturalCompare from 'natural-compare';
import DOMPurify from 'dompurify';

const nameTest = /サークル名?|社團|circle/i;
const boothTest = /スペース|SPACE|配置|攤位/i;
const siteTest = /url|ＵＲＬ|Link|Web|hp|ＨＰ|サイト/i;

const skipTest = /(社務所|実行委員会|予備|準備会|委員会|事故)(予備|)\s*(スペース|sp|space)/i;

export interface BoothInfo {
	booth?: string;
	name?: string;
	site: Array<string>;
}

export type HeaderInfo = Array<keyof BoothInfo | null>;

export interface Row extends Array<Cell> {
	[index: number]: Cell;
	header: boolean;
}

export interface Cell {
	header: boolean;
	text: string;
	link?: string;
	node: HTMLElement;
}

@Component({
	selector: 'app-event',
	templateUrl: './event.component.html',
	styleUrls: ['./event.component.less']
})
export class EventComponent implements OnInit {
	doc: HTMLElement;
	input = '';
	result = '';

	@ViewChild('virtual', { read: EventPreviewComponent, static: true })
	virtual: EventPreviewComponent;

	headerInfo: HeaderInfo | null = null;

	boothList: Array<BoothInfo> = [];
	spaceCount = 0;
	circleCount = 0;

	constructor(private gaService: GoogleAnalyticsService) {}

	ngOnInit(): void {}

	onPaste(event: ClipboardEvent) {
		const { clipboardData } = event;
		const html = clipboardData?.getData('text/html');
		if (this.input === '' && html) {
			event.preventDefault();
			this.changeInput(html, true);

			this.gaService.event('paste', 'tools_event');
		}
	}

	onInput(event: InputEvent) {
		this.changeInput((event.target as HTMLTextAreaElement).value);
	}

	changeInput(html: string, isPaste = false) {
		const newDom = new DOMParser().parseFromString('<body></body>', 'text/html');
		const body = DOMPurify.sanitize(html, {
			RETURN_DOM: true,
			FORBID_ATTR: [
				'style',
				'align',
				'alink',
				'background',
				'bgcolor',
				'border',
				'clear',
				'height',
				'hspace',
				'language',
				'link',
				'nowrap',
				'start',
				'text',
				'vlink',
				'vspace',
				'width'
			],
			FORBID_TAGS: ['style', 'iframe', 'frameset', 'embed', 'video', 'audio', 'object', 'template', 'form', 'input', 'textarea'],
			ALLOW_DATA_ATTR: false
		});
		this.headerInfo = null;
		const tables = this.selectTables(body);
		tables.forEach(table => {
			table.setAttribute('border', '1');
			table.setAttribute('cellspacing', '0');
			newDom.body.appendChild(table);
		});
		if (isPaste) this.input = prettifyXml(newDom);
		this.doc = newDom.body;
		this.boothList = ([] as Array<BoothInfo>).concat(...this.parseTables(tables));
		const names = this.boothList.map(({ name }) => name);
		const spaces = this.boothList.map(({ booth }) => booth);
		let match: RegExpMatchArray | null;
		this.spaceCount = spaces.reduce(
			(sum, space) =>
				space != null && (match = space.match(/(\d+)\s*[,-]\s*(\d+)/))
					? sum + 1 + Math.abs(parseInt(match[2], 10) - parseInt(match[1], 10))
					: sum + 1,

			0
		);
		this.circleCount = names.filter((v, i, a) => a.indexOf(v) === i).length;
		this.result = this.outputTemplate(this.boothList);
	}

	sortOutput() {
		this.boothList.sort((a, b) => naturalCompare(a.booth ?? '', b.booth ?? ''));
		this.result = this.outputTemplate(this.boothList);
	}

	selectTables(body: HTMLElement) {
		body.querySelector('#wm-ipp')?.remove();
		return Array.from(body.querySelectorAll('table'));
	}

	parseTables(tables: Array<HTMLElement>) {
		return tables.map(table => this.parseTable(table));
	}

	parseTable(table: HTMLElement) {
		const matrix = parseTable(table);
		if (matrix.length === 0) return [];
		const result: Array<BoothInfo> = [];
		const headers = matrix.filter(row => row.header);
		let list: HeaderInfo | null = null;

		for (let i = 0; i < headers.length; i++) {
			const row = headers[i];
			list = this.parseHeader(row);
			if (list) break;
		}
		if (list == null) list = this.headerInfo;
		if (list == null) {
			let max = 0;
			let maxRow: Row | null = null;
			for (let j = 0; j < matrix.length; j++) {
				const row = matrix[j];
				const l = this.parseHeader(row);
				if (l) {
					const len = l.filter(t => t).length;
					if (len > max) {
						max = len;
						maxRow = row;
						list = l;
					}
				}
			}
			if (maxRow != null) {
				maxRow.header = true;
			}
		}
		if (list == null) return [];
		const nameCol = list.findIndex(t => t === 'name');
		const boothCol = list.findIndex(t => t === 'booth');
		const siteCol = list.findIndex(t => t === 'site');
		for (let i = 0; i < matrix.length; i++) {
			const row = matrix[i];
			if (row.header) continue;
			const info: BoothInfo = {
				site: []
			};
			let mainset = false;
			for (let j = 0; j < row.length; j++) {
				const cell = row[j];
				if (j === nameCol) {
					info.name = cell.text;
					if (cell.link) {
						info.site = [cell.link];
						mainset = true;
					}
				} else if (j === boothCol) {
					info.booth = cell.text;
				} else if (j === siteCol) {
					if (cell.link) {
						info.site = [cell.link];
						mainset = true;
					} else if (cell.text.startsWith('http')) {
						info.site = [cell.text];
						mainset = true;
					}
				} else {
					if (cell.link && !mainset) info.site.push(cell.link);
				}
			}
			if (info.name != null && info.name !== '' && !skipTest.test(info.name)) {
				if (info.booth)
					info.booth = info.booth.replace(/(\d+)\s*[\-\/\\~\.・,，、／＼]\s*(\d+)/m, (_, b1, b2) => {
						if (Math.abs(parseInt(b2, 10) - parseInt(b1, 10)) > 1) {
							return `${b1}-${b2}`;
						} else return `${b1},${b2}`;
					});
				result.push(info);
			}
		}
		return result.some(booth => booth.booth != null) ? result.filter(booth => booth.booth != null && booth.booth !== '') : result;
	}

	parseHeader(header: Row): HeaderInfo | null {
		let nameGot = false;
		let boothGot = false;
		let siteGot = false;
		const test: HeaderInfo = header.map(cell => {
			if (!nameGot && nameTest.test(cell.text)) {
				nameGot = true;
				return 'name';
			}
			if (!boothGot && boothTest.test(cell.text)) {
				boothGot = true;
				return 'booth';
			}
			if (!siteGot && siteTest.test(cell.text)) {
				siteGot = true;
				return 'site';
			}
			return null;
		});
		if (test.every(p => p === null)) return null;
		return test;
	}

	outputTemplate(list: Array<BoothInfo>) {
		return (
			'{{场贩列表|\n' +
			'|展会系列=\n' +
			'|展会届数= \n' +
			'|摊位 = \n' +
			list
				.map(booth => {
					const website =
						booth.site.length === 1 ? booth.site[0] : booth.site.find(url => url.indexOf('pixiv.') > -1) ?? booth.site[0] ?? '';
					const type = website
						? website.indexOf('pixiv.') > -1
							? ' Pixiv'
							: website.indexOf('twitter.') > -1
							? ' Twitter'
							: website.indexOf('.nicovideo') > -1
							? ' NicoNico'
							: website.indexOf('circle.ms') > -1
							? ' Circle.ms'
							: ' 官网'
						: '';
					return (
						'{{场贩信息|\n' +
						'|摊位号 = ' +
						(booth.booth ?? '') +
						'\n' +
						'|社团页面 = ' +
						(booth.name ?? '') +
						'\n' +
						'|官网 = ' +
						(website ? website + type : '') +
						'\n' +
						'}}'
					);
				})
				.join('\n') +
			'\n}}'
		);
	}
}

function parseTable(table: HTMLElement): Array<Row> {
	const rowEls = table.querySelectorAll<HTMLElement>('thead tr, tbody tr');
	const matrix: Array<Row> = [];
	for (let i = 0, n = rowEls.length; i < n; i++) {
		const rowEl = rowEls[i];
		const cellEls = rowEl.querySelectorAll<HTMLElement>('td, th');
		let y = 0;
		for (let j = 0, m = cellEls.length; j < m; j++) {
			const cellEl = cellEls[j];
			const rowSpan = parseInt(cellEl.getAttribute('rowspan') ?? '1', 10);
			const cellSpan = parseInt(cellEl.getAttribute('colspan') ?? '1', 10);
			while (matrix[i]?.[y] != null) ++y;
			const val: Cell = {
				header: cellEl.tagName === 'TH' || rowEl.tagName === 'THEAD',
				text: cellEl.textContent?.trim() ?? '',
				node: cellEl
			};
			const a = cellEl.querySelector('a[href]');
			if (a) {
				val.link =
					a
						.getAttribute('href')
						?.trim()
						?.replace(/^https?:\/\/web.archive.org\/web\/\d+\//, '') ?? undefined;
			}
			let rowSpanIterator = rowSpan;
			while (rowSpanIterator--) {
				let cellSpanIterator = cellSpan;
				while (cellSpanIterator--) {
					const x = i + rowSpanIterator;
					matrix[x] = matrix[x] ?? [];
					matrix[x][y + cellSpanIterator] = val;
				}
			}
			y += cellSpan;
		}
	}
	for (let i = 0; i < matrix.length; i++) {
		const row = matrix[i];
		if (
			row == null ||
			(row.length > 1 && row.filter((cell, k, arr) => arr.findIndex(c2 => c2.node === cell.node) === k).length === 1)
		) {
			matrix.splice(i, 1);
			--i;
		} else {
			row.header = row.some(cell => cell.header);
		}
	}
	const headers = matrix.filter(row => row.header);
	if (headers.length >= matrix.length - 1) {
		matrix.forEach(row => {
			row.header = false;
		});
	}
	return matrix;
}

function prettifyXml(xmlDoc: Document) {
	return xmlDoc.body.outerHTML.replace(/>\s*</g, '>\n<');
}
