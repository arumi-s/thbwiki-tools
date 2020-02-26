declare module 'chinese-to-pinyin' {
	function pinyin(
		value: string,
		options?: {
			removeTone?: boolean;
			toneToNumber?: boolean;
			toneToNumberOnly?: boolean;
			removeSpace?: boolean;
			keepRest?: boolean;
			firstCharacter?: boolean;
		}
	): string;
	export = pinyin;
}
