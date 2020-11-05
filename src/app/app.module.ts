import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NgxGoogleAnalyticsModule, NgxGoogleAnalyticsRouterModule } from 'ngx-google-analytics';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { RedirectGuard } from './services/redirect-guard';
import { environment } from '../environments/environment';

@NgModule({
	declarations: [AppComponent, HomeComponent],
	imports: [
		BrowserModule,
		AppRoutingModule,
		HttpClientModule,
		AngularSvgIconModule.forRoot(),
		NgxGoogleAnalyticsModule.forRoot(environment.ga),
		NgxGoogleAnalyticsRouterModule
	],
	providers: [RedirectGuard, HttpClientModule],
	bootstrap: [AppComponent]
})
export class AppModule {}
