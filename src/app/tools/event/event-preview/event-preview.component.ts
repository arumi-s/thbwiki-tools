import { Component, OnInit, ViewEncapsulation, Input, ElementRef } from '@angular/core';

@Component({
	selector: 'app-event-preview',
	templateUrl: './event-preview.component.html',
	styleUrls: ['./event-preview.component.less'],
	encapsulation: ViewEncapsulation.ShadowDom
})
export class EventPreviewComponent implements OnInit {
	private _doc: HTMLElement;
	shadow: ShadowRoot;

	@Input('doc')
	set doc(d: HTMLElement) {
		if (this._doc) {
			this._doc.remove();
		}
		if (d) {
			this._doc = d;
			this.shadow.appendChild(this._doc);
		}
	}

	get doc() {
		return this._doc;
	}

	constructor(public elementRef: ElementRef<HTMLElement>) {
		this.shadow = this.elementRef.nativeElement.shadowRoot as ShadowRoot;
	}

	ngOnInit(): void {}
}
