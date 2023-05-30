import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { Raee } from '../../interfaces/raee.interface';
import { Router } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';
import { GoogleMapsModule } from '@angular/google-maps';

@Component({
  selector: 'tarjeta-lectura',
  templateUrl: 'tarjeta-lectura.html',
  styleUrls: ['tarjeta-lectura.css'],
  standalone: true,
  imports: [MatButtonModule, MatDialogModule],
})
export class TarjetaLectura {
  constructor(public dialog: MatDialog, private router: Router) {}

  openDialog() {
    // Abre el diálogo de TarjetaLecturaContent
    const dialogRef = this.dialog.open(TarjetaLecturaContent);

    dialogRef.afterClosed().subscribe(() => {});
  }
}

@Component({
  selector: 'tarjeta-lectura-content',
  templateUrl: 'tarjeta-lectura-content.html',
  styleUrls: ['tarjeta-lectura.css'],
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, CommonModule, GoogleMapsModule],
})
export class TarjetaLecturaContent implements OnInit {
  public lecturaElegida: Raee | null | undefined;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    // Recibe los datos de entrada del diálogo
    this.lecturaElegida = data;
  }

  ngOnInit(): void {
    // Se ejecuta al inicializar el componente
    this.updateMap();
  }

  center: google.maps.LatLngLiteral;
  position: google.maps.LatLngLiteral;
  label: google.maps.MarkerLabel;

  updateMap() {
    // Actualiza el mapa con la posición y etiqueta correspondientes
    let posicionSeparada: string[] | undefined = ['0', '0'];
    posicionSeparada = this.lecturaElegida?.GeoPosicion.split(', ');
    this.position = {
      lat: Number(posicionSeparada![0]),
      lng: Number(posicionSeparada![1]),
    };

    this.label = {
      color: 'white',
      text: `${this.lecturaElegida?.DescripcionResiduo}`,
    };
    this.center = this.position;
  }
}
