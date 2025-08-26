import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonItem, IonLabel, IonList, IonSearchbar, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { BooksService, Libro } from '../../../core/services/books.service';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonSearchbar, IonList, IonItem, IonLabel
  ],
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss']
})
export class ListPage implements OnInit { 
  q = '';
  loading = false;
  items: Libro[] = [];

  constructor(private booksSvc: BooksService) {}
  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.booksSvc.list(this.q).subscribe({
      next: (data) => { this.items = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  search() { this.load(); }
}
