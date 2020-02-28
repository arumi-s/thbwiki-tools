import { Directive, HostListener, HostBinding, Output, EventEmitter, OnInit, ElementRef, Input } from '@angular/core';

interface HTMLInputEvent extends Event {
	target: HTMLInputElement & EventTarget;
}

@Directive({
	selector: '[dropfile]'
})
export class DropfileDirective implements OnInit {
	@Input('accept')
	accept: string;
	@Input('allow')
	allow: Array<string>;
	@Input('multiple')
	multiple = false;

	@Output() input = new EventEmitter<any>();

	@HostBinding('class.dragging')
	dragging = false;

	@HostListener('dragover', ['$event'])
	onDragover(event: DragEvent) {
		event.preventDefault();
		event.stopPropagation();
		this.dragging = true;
	}
	@HostListener('dragleave', ['$event'])
	onDragleave(event: DragEvent) {
		event.preventDefault();
		event.stopPropagation();
		this.dragging = false;
	}
	@HostListener('drop', ['$event'])
	onDrop(event: DragEvent) {
		event.preventDefault();
		event.stopPropagation();
		this.dragging = false;
		this.emit(event.dataTransfer?.files);
	}

	constructor(private elementRef: ElementRef<HTMLElement>) {}

	ngOnInit(): void {
		const element = this.elementRef.nativeElement;
		const input = document.createElement('input');
		input.style.display = 'none';
		input.type = 'file';
		input.accept = this.accept;
		if (this.multiple) input.multiple = true;
		input.addEventListener('change', (event: HTMLInputEvent) => {
			event.preventDefault();
			event.stopPropagation();
			this.emit(event.target?.files);
		});
		element.appendChild(input);
	}

	emit(files?: FileList | null) {
		if (files == null || !(files instanceof FileList)) return;
		if (files.length === 0) {
			this.input.emit([]);
		} else if (Array.isArray(this.allow) && this.allow.length > 0) {
			this.input.emit(Array.from(files).filter(file => this.allow.includes(file.type) && file.size > 0));
		} else {
			this.input.emit(Array.from(files).filter(file => file.size > 0));
		}
	}
}
