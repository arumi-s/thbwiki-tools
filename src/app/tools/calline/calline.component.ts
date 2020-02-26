import { Component, OnInit, HostListener, HostBinding } from '@angular/core';

const allowImageType = ['image/bmp', 'image/gif', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/png'];

type Dimension = [string, string];
interface HTMLInputEvent extends Event {
	target: HTMLInputElement & EventTarget;
}

@Component({
	selector: 'app-calline',
	templateUrl: './calline.component.html',
	styleUrls: ['./calline.component.less']
})
export class CallineComponent implements OnInit {
	dimensions: Array<Dimension> = [];
	results: Array<number> = [];
	baseline = '';

	@HostBinding('class.dragging')
	dragging = false;

	@HostBinding('class.block')
	block = false;

	@HostListener('dragover')
	onDragover() {
		this.block = true;
	}

	@HostListener('dragleave')
	@HostListener('mouseup')
	onMouseup() {
		this.block = false;
	}

	constructor() {
		this.addnew();
	}

	ngOnInit(): void {}

	addnew() {
		while (
			this.dimensions.length < 2 ||
			this.dimensions[this.dimensions.length - 2].join('') !== '' ||
			this.dimensions[this.dimensions.length - 1].join('') !== ''
		) {
			this.dimensions.push(['', '']);
		}
	}

	trim() {
		while (this.dimensions.length > 0 && this.dimensions[this.dimensions.length - 1].join('') === '') {
			this.dimensions.pop();
		}
	}

	async addFiles(files?: FileList | null) {
		if (files == null || !(files instanceof FileList) || files.length === 0) return;
		this.trim();
		const list: Array<File> = Array.from(files).filter(file => allowImageType.includes(file.type) && file.size > 0);
		for (let index = 0; index < list.length; index++) {
			const image = await this.fileToImage(list[index]);
			this.dimensions.push([image.width.toString(), image.height.toString()]);
		}
		this.addnew();
		this.dragging = false;
	}

	dropImage(event: DragEvent) {
		event.preventDefault();
		event.stopPropagation();
		this.addFiles(event.dataTransfer?.files);
	}

	loadImage(event: HTMLInputEvent) {
		event.preventDefault();
		event.stopPropagation();
		this.addFiles(event.target?.files);
	}

	fileToImage(file: File): Promise<HTMLImageElement> {
		return new Promise((resolve, reject) => {
			const image = new Image();
			image.onload = () => resolve(image);
			image.onerror = () => reject(image);
			image.src = URL.createObjectURL(file);
		});
	}

	dragover(event: DragEvent) {
		event.preventDefault();
		event.stopPropagation();
		this.dragging = true;
	}

	dragleave(event: DragEvent) {
		event.preventDefault();
		event.stopPropagation();
		this.dragging = false;
	}

	calc() {
		const baseline = parseInt(this.baseline, 10);
		if (isNaN(baseline) || !isFinite(baseline)) {
			alert('请输入基准的高');
			return;
		}
		this.results = this.dimensions
			.map(([width, height]) => [parseInt(width, 10), parseInt(height, 10)])
			.filter(([width, height]) => !isNaN(width) && !isNaN(height) && isFinite(width) && isFinite(height) && height > 0)
			.map(([width, height]) => Math.floor((width * baseline) / height));
	}

	clear() {
		this.dimensions = [];
		this.addnew();
	}
}
