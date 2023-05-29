import { Component, Inject} from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { Raee } from '../../interfaces/raee.interface';
import { NgIf } from '@angular/common';

@Component({
  selector: 'tarjeta-raee',
  templateUrl: 'tarjeta-raee.html',
  styleUrls: ['./tarjeta-raee.css'],
  standalone: true,
  imports: [MatButtonModule, MatDialogModule],
})
export class TarjetaRaee {
  router: any;
  constructor(public dialog: MatDialog) { }

  static openDialog(dialog: MatDialog): void {
    const dialogRef = dialog.open(TarjetaRaeeContent);

    dialogRef.afterClosed().subscribe(result => {
    });
  }
  openDialog() {

    const dialogRef = this.dialog.open(TarjetaRaeeContent);
    dialogRef.afterClosed().subscribe(result => {
    });
  }
}

@Component({
  selector: 'tarjeta-raee-content',
  templateUrl: 'tarjeta-raee-content.html',
  styleUrls: ['tarjeta-raee.css'],
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, NgIf],
})
export class TarjetaRaeeContent {
  public RaeeElegido: Raee | null;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.RaeeElegido = data;
  }
}
