import { Component, OnInit } from '@angular/core';
import JSZip from 'jszip';
import { GoogleAnalyticsService } from 'ngx-google-analytics';

@Component({
	selector: 'app-crop',
	templateUrl: './crop.component.html',
	styleUrls: ['./crop.component.less']
})
export class CropComponent implements OnInit {
	images: Array<HTMLImageElement> = [];
	allowImageType = ['image/bmp', 'image/jpeg', 'image/jpg', 'image/png'];

	left = 32;
	top = 16;
	width = 384;
	height = 448;

	downloading = false;

	constructor(private gaService: GoogleAnalyticsService) {}

	ngOnInit(): void {}

	async addFiles(files: Array<File>) {
		if (files.length === 0) return;
		for (let index = 0; index < files.length; index++) {
			try {
				const image = await this.fileToImage(files[index]);
				this.images.push(image);
			} catch (e) {}
		}
		this.gaService.event('drop', 'tools_crop');
	}

	fileToImage(file: File): Promise<HTMLImageElement> {
		return new Promise((resolve, reject) => {
			const image = new Image();
			image.onload = () => resolve(image);
			image.onerror = () => reject(image);
			image.src = URL.createObjectURL(file);
			image.setAttribute('name', file.name);
		});
	}

	clear() {
		this.images = [];
	}

	canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
		return new Promise((resolve, reject) => {
			canvas.toBlob(blob => {
				if (blob instanceof Blob) {
					resolve(blob);
				} else {
					reject(blob);
				}
			}, 'image/png');
		});
	}

	async download() {
		if (this.downloading) return;
		this.downloading = true;
		const zipFile = JSZip();
		const canvas = document.createElement('canvas');
		canvas.width = this.width;
		canvas.height = this.height;
		const ctx = canvas.getContext('2d');
		if (ctx) {
			for (let index = 0; index < this.images.length; index++) {
				const image = this.images[index];
				ctx.clearRect(0, 0, this.width, this.height);
				ctx.drawImage(image, -this.left, -this.top);

				try {
					const cropped = await this.canvasToBlob(canvas);

					zipFile.file(
						(image.getAttribute('name') ?? `image_${index.toString().padStart(4, '0')}.png`).replace(/\.[^\.]+$/, '.png'),
						cropped
					);
				} catch (e) {
					console.error(e);
				}
			}
		}

		const zipBlob = await zipFile.generateAsync({ type: 'blob' });

		const hf = document.createElement('a');
		hf.href = URL.createObjectURL(zipBlob);
		if (hf.href !== '') {
			hf.download = 'download.zip';
			hf.click();
		}

		this.downloading = false;
	}
}
