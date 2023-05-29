import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { Raee } from 'src/app/interfaces/raee.interface';
import { Router } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';
import {GoogleMapsModule} from '@angular/google-maps';

@Component({
  selector: 'tarjeta-lectura',
  templateUrl: 'tarjeta-lectura.html',
  styleUrls: ['tarjeta-lectura.css'],
  standalone: true,
  imports: [MatButtonModule, MatDialogModule, GoogleMapsModule,NgIf,CommonModule],
})

export class TarjetaLectura {
  constructor(public dialog: MatDialog, private router: Router) { }

  openDialog() {
    const dialogRef = this.dialog.open(TarjetaLectura);

    dialogRef.afterClosed().subscribe(() => {
    });
  }
}

@Component({
  selector: 'tarjeta-lectura-content',
  templateUrl: 'tarjeta-lectura-content.html',
  styleUrls: ['tarjeta-lectura.css'],
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
})
export class TarjetaLecturaContent {
  public lecturaElegida: Raee | null | undefined;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.lecturaElegida = data;
  }
  center: google.maps.LatLngLiteral;
  position:google.maps.LatLngLiteral;
  label: google.maps.MarkerLabel;
  updateMap(){
    let posicionSeparada:string[] |undefined = ['0','0'];
    posicionSeparada = this.lecturaElegida?.GeoPosicion.split(', ')
    this.position = {
      lat: Number(posicionSeparada![0]),
      lng:Number(posicionSeparada![1])
    }
    console.log(this.position);
    this.label = {
      color: 'white',
      text: `${this.lecturaElegida?.DescripcionResiduo}`
    }
    navigator.geolocation.getCurrentPosition(() => {
      this.center = this.position;
    });
  }
}
