import { Component, OnInit } from '@angular/core';

type Dimension = [string, string];

@Component({
	selector: 'app-calline',
	templateUrl: './calline.component.html',
	styleUrls: ['./calline.component.less']
})
export class CallineComponent implements OnInit {
	dimensions: Array<Dimension> = [];
	results: Array<number> = [];
	baseline = '';
	allowImageType = ['image/bmp', 'image/gif', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/png'];

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

	async addFiles(files: Array<File>) {
		if (files.length === 0) return;
		this.trim();
		for (let index = 0; index < files.length; index++) {
			const image = await this.fileToImage(files[index]);
			this.dimensions.push([image.width.toString(), image.height.toString()]);
		}
		this.addnew();
	}

	fileToImage(file: File): Promise<HTMLImageElement> {
		return new Promise((resolve, reject) => {
			const image = new Image();
			image.onload = () => resolve(image);
			image.onerror = () => reject(image);
			image.src = URL.createObjectURL(file);
		});
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
