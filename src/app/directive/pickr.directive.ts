import {
	AfterViewInit,
	Directive,
	ElementRef,
	EventEmitter,
	Inject,
	Input,
	OnChanges,
	OnDestroy,
	OnInit,
	Output,
	Renderer2,
	SimpleChanges
} from '@angular/core';

import Pickr from '@simonwep/pickr';
import { DOCUMENT } from '@angular/common';
import { themes } from './pickr.themes';
import { ControlValueAccessor, NgControl } from '@angular/forms';

@Directive({
	selector: '[ngxPickr]',
	providers: []
})
export class PickrDirective implements OnInit, AfterViewInit, OnChanges, ControlValueAccessor, OnDestroy {
	private container: HTMLElement;
	@Input() theme: Pickr.Theme = 'classic';
	@Input() disabled = false;
	@Input() defaultRepresentation: Pickr.Representation = 'HEXA';
	@Input() closeOnScroll = false;
	@Input() appClass: string;
	@Input() useAsButton = false;
	@Input() padding = 8;
	@Input() inline = false;
	@Input() autoReposition = true;
	@Input() sliders: Pickr.Slider;
	@Input() lockOpacity = false;
	@Input() outputPrecision = 0;
	@Input() comparison = false;
	@Input() swatches: Array<string>;
	@Input() showAlways = false;
	@Input() closeWithKey = 'Escape';
	@Input() position: Pickr.Position = 'bottom-middle';
	@Input() adjustableNumbers = true;
	@Input() strings = {
		save: 'Save',
		clear: 'Clear',
		cancel: 'Cancel'
	};
	@Input() components: {
		preview: true;
		opacity: true;
		hue: true;
		interaction: {
			hex: false;
			rgba: false;
			hsla: false;
			hsva: false;
			cmyk: false;
			input: true;
			cancel: true;
			clear: false;
			save: false;
		};
	};
	@Output() readonly init = new EventEmitter<Pickr>();
	@Output() readonly save = new EventEmitter<Pickr.HSVaColor>();
	@Output() readonly change = new EventEmitter<Pickr.HSVaColor>();
	@Output() readonly swatchSelect = new EventEmitter<Pickr.HSVaColor>();
	@Output() readonly hide = new EventEmitter<Pickr>();
	@Output() readonly show = new EventEmitter<Pickr>();
	@Output() readonly clear = new EventEmitter<Pickr>();
	@Output() readonly changeStop = new EventEmitter<Pickr>();
	@Output() readonly cancel = new EventEmitter<Pickr>();
	private pickr: Pickr;

	constructor(
		private el: ElementRef,
		private ngControl: NgControl,
		@Inject(DOCUMENT) private document: any,
		private renderer2: Renderer2
	) {
		this.ngControl.valueAccessor = this;
	}

	get value(): Pickr.HSVaColor {
		return this.pickr.getColor();
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes && changes.config) {
			this.setupPickrContainer();
		}
	}

	ngAfterViewInit(): void {
		this.setupPickrContainer();
	}

	ngOnInit(): void {}

	ngOnDestroy(): void {
		this.pickr.destroyAndRemove();
	}

	buildConfig(): Pickr.Options {
		return {
			...themes[this.theme],
			el: this.container,
			default: this.ngControl.control?.value,
			defaultRepresentation: this.defaultRepresentation,
			disabled: this.disabled,
			closeOnScroll: this.closeOnScroll,
			appClass: this.appClass,
			useAsButton: this.useAsButton,
			padding: this.padding,
			inline: this.inline,
			autoReposition: this.autoReposition,
			sliders: this.sliders,
			lockOpacity: this.lockOpacity,
			outputPrecision: this.outputPrecision,
			comparison: this.comparison,
			swatches: this.swatches ? this.swatches : themes[this.theme].swatches,
			showAlways: this.showAlways,
			closeWithKey: this.closeWithKey,
			position: this.position,
			adjustableNumbers: this.adjustableNumbers,
			strings: this.strings,
			components: this.components ? this.components : themes[this.theme].components
		};
	}

	setupPickrContainer(): void {
		if (this.container) {
			this.renderer2.removeChild(this.el.nativeElement, this.container);
		}

		this.container = this.document.createElement('p');

		this.renderer2.appendChild(this.el.nativeElement, this.container);

		if (this.pickr) {
			this.pickr.destroyAndRemove();
		}

		this.pickr = Pickr.create(this.buildConfig());

		this.pickr
			.on('init', (instance: Pickr) => {
				this.init.emit(instance);
			})
			.on('hide', (instance: Pickr) => {
				this.hide.emit(instance);
			})
			.on('show', (instance: Pickr) => {
				this.show.emit(instance);
			})
			.on('save', (color: Pickr.HSVaColor, instance: Pickr) => {
				this.onChange(color);
				this.save.emit(color);
			})
			.on('clear', (instance: Pickr) => {
				this.clear.emit(instance);
			})
			.on('change', (color: Pickr.HSVaColor, instance: Pickr) => {
				this.onChange(color);
				this.change.emit(color);
			})
			.on('changestop', (instance: Pickr) => {
				this.changeStop.emit(instance);
			})
			.on('cancel', (instance: Pickr) => {
				this.cancel.emit(instance);
			})
			.on('swatchselect', (color: Pickr.HSVaColor, instance: Pickr) => {
				this.onChange(color);
				this.swatchSelect.emit(color);
			});
	}

	onChange = (color: Pickr.HSVaColor) => {};

	onTouched = () => {};

	writeValue(color: string | Pickr.HSVaColor): void {
		if (this.pickr) {
			if (typeof color === 'string') {
				this.pickr.setColor(color);
			} else if (color !== null && typeof color === 'object') {
				this.pickr.setHSVA(...(color.toHSVA() as Array<number>));
			}
		}
	}

	registerOnChange(fn: (color: Pickr.HSVaColor) => void): void {
		this.onChange = fn;
	}

	registerOnTouched(fn: () => void): void {
		this.onTouched = fn;
	}

	setDisabledState(isDisabled: boolean): void {
		this.disabled = isDisabled;
		if (isDisabled) {
			this.pickr.disable();
		} else {
			this.pickr.enable();
		}
	}
}
