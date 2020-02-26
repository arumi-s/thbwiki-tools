import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { RedirectGuard } from './services/redirect-guard';

@NgModule({
	declarations: [AppComponent, HomeComponent],
	imports: [BrowserModule, AppRoutingModule],
	providers: [RedirectGuard],
	bootstrap: [AppComponent]
})
export class AppModule {}
