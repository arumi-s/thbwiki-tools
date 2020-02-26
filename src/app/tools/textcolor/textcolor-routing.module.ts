import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TextcolorComponent } from './textcolor.component';

const routes: Routes = [
	{
		path: '',
		component: TextcolorComponent,
		data: { title: '渐变色彩文字代码生成器' }
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class TextcolorRoutingModule {}
