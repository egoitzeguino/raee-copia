import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { Raee } from 'src/app/interfaces/raee.interface';
import { Router } from '@angular/router';

@Component({
  selector: 'tarjeta-lectura',
  templateUrl: 'tarjeta-lectura.html',
  styleUrls: ['tarjeta-lectura.css'],
  standalone: true,
  imports: [MatButtonModule, MatDialogModule],
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
}
