import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MainPageComponent } from './pages/main-page/main-page.component';
import { MenuComponent } from './components/menu/menu.component';
import { SearchBoxComponent } from './components/search-box/search-box.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { ListComponent } from './components/list/list.component';
import { TarjetaRaee } from './pages/tarjeta-raee/tarjeta-raee';
import { FooterComponent } from './components/footer/footer.component';

import {GoogleMapsModule} from '@angular/google-maps';



@NgModule({
  declarations: [
    AppComponent,
    MainPageComponent,
    MenuComponent,
    SearchBoxComponent,
    SidebarComponent,
    ListComponent,
    FooterComponent,
  ],

  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatDialogModule,
    NgxPaginationModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    GoogleMapsModule,

  ],

  providers:[
    TarjetaRaee,
    ListComponent
  ],

  exports: [
    SearchBoxComponent,
  ],

  bootstrap: [AppComponent]
})


export class AppModule { }
