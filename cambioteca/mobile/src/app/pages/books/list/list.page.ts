import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

// 👇 Importa los componentes standalone de Ionic que usas en el HTML
import {
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonSearchbar,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';

import { booksService, Libro } from '../../../core/services/books.service';

@Component({
  selector: 'app-books-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    // Ionic standalone:
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonSearchbar, IonList, IonItem, IonLabel,
  ],
  templateUrl: './list.page.html',
})
export class ListPage implements OnInit {
  q = '';
  items: Libro[] = [];
  async ngOnInit() { this.items = await booksService.list(); }
  async search() { this.items = await booksService.list(this.q); }
}
