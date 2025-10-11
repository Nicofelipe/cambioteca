// src/app/pages/book-detail/book-detail.page.ts
import { CommonModule } from '@angular/common';
import { Component, computed, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, IonicModule, ToastController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';

import { AuthService } from 'src/app/core/services/auth.service';
import { BookImage, BooksService, MyBookWithHistory } from 'src/app/core/services/books.service';
import { CatalogService, Genero } from 'src/app/core/services/catalog.service';

const PLACEHOLDER = '/assets/librodefecto.png';

@Component({
  selector: 'app-my-book-detail',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './book-detail.page.html',
  styleUrls: ['./book-detail.page.scss'],
})
export class MyBookDetailPage implements OnInit {
  loading = signal(true);
  book = signal<(MyBookWithHistory & any) | null>(null);
  showRequests = signal(false);

  // Galería
  images = signal<BookImage[]>([]);
  galleryOpen = signal(false);
  galleryIndex = signal(0);
  uploading = signal(false);

  // Edición
  editOpen = signal(false);
  edit: any = {};

  // Catálogo
  generos: Genero[] = [];

  // Pre-subida
  pendingFiles = signal<File[]>([]);
  pendingPreviews = signal<string[]>([]);
  pendingCoverIndex = signal(0);
  portadaMode = signal<'keep' | 'new'>('keep');

  currentImage = computed<BookImage | null>(() => {
    const arr = this.images();
    const idx = this.galleryIndex();
    return arr[idx] ?? null;
  });

  counters = computed(() => this.book()?.counters ?? ({
    total: 0, completados: 0, pendientes: 0, aceptados: 0, rechazados: 0,
  }));

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
    private booksSvc: BooksService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private catalog: CatalogService,
  ) {}

  async ngOnInit() {
    await this.auth.restoreSession();
    const me = this.auth.user;
    if (!me) { this.router.navigateByUrl('/auth/login'); return; }

    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { this.router.navigateByUrl('/my-books'); return; }

    this.loading.set(true);
    try {
      // 1) “Mis libros con historia” (contadores/solicitudes)
      const all = await this.booksSvc.getMineWithHistory(me.id, 20).toPromise();
      const found = (all || []).find(x => x.id === id);
      if (!found) {
        await this.toast('No se encontró el libro.');
        this.router.navigateByUrl('/my-books');
        return;
      }

      // 2) Detalle completo (isbn, año, id_genero, genero_nombre)
      const full = await firstValueFrom(this.booksSvc.get(id));

      // 3) Mezcla
      const merged = { ...found, ...full };
      this.book.set(merged);

      // 4) Imágenes
      await this.loadImages(id);

      // 5) Catálogo de géneros
      try { this.generos = await this.catalog.generos(); } catch { this.generos = []; }

      // 6) Estado de edición (usar DETALLE)
      this.edit = {
        titulo: merged.titulo,
        autor: merged.autor,
        editorial: merged.editorial,
        tipo_tapa: merged.tipo_tapa,
        estado: merged.estado,
        descripcion: merged.descripcion,
        disponible: merged.disponible,
        isbn: merged.isbn ?? '',
        anio_publicacion: merged.anio_publicacion ?? null,
        id_genero: merged.id_genero ?? null,
      };
    } finally {
      this.loading.set(false);
    }
  }

  // Helpers UI
  generoName = (id?: number | null) =>
    (this.generos.find(g => g.id_genero === id)?.nombre) || this.book()?.genero_nombre || '—';

  // Solicitudes
  toggleRequests() {
    const open = !this.showRequests();
    this.showRequests.set(open);
    if (open) {
      const me = this.auth.user!;
      const b = this.book();
      if (me && b) {
        this.booksSvc.markRequestsSeen(b.id, me.id).toPromise()
          .then(() => this.book.update(cur => cur ? ({ ...cur, has_new_requests: false } as any) : cur))
          .catch(() => {});
      }
    }
  }
  trackByHistory = (_: number, h: { id: number }) => h?.id;

  onImgError(ev: Event) {
    const img = ev.target as HTMLImageElement;
    if (img && !img.src.includes(PLACEHOLDER)) img.src = PLACEHOLDER;
  }

  // Galería
  async loadImages(libroId: number) {
    const imgs = await this.booksSvc.listImages(libroId).toPromise();
    this.images.set(imgs ?? []);
  }
  openGallery(startAt = 0) {
    const lastIdx = Math.max(0, (this.images().length || 1) - 1);
    this.galleryIndex.set(Math.min(Math.max(0, startAt), lastIdx));
    this.galleryOpen.set(true);
  }
  closeGallery() { this.galleryOpen.set(false); }
  nextImage() { const len = this.images().length; if (!len) return; this.galleryIndex.set((this.galleryIndex() + 1) % len); }
  prevImage() { const len = this.images().length; if (!len) return; this.galleryIndex.set((this.galleryIndex() - 1 + len) % len); }

  async setAsCover(imagenId?: number) {
    if (!imagenId) return;
    await this.booksSvc.setCover(imagenId, true).toPromise();
    const after = (this.images() || []).map(i => ({ ...i, is_portada: i.id_imagen === imagenId }));
    this.images.set(after);
    const sel = after.find(x => x.id_imagen === imagenId);
    if (sel) {
      this.book.update(cur => cur ? ({ ...cur, first_image: sel.url_abs } as any) : cur);
      const b = this.book(); if (b) this.booksSvc.emitCoverChanged(b.id, sel.url_abs);
    }
    await this.toast('Portada actualizada');
  }

  async deleteImage(imagenId?: number) {
    if (!imagenId) return;
    await this.booksSvc.deleteImage(imagenId).toPromise();
    const newArr = (this.images() || []).filter(i => i.id_imagen !== imagenId);
    this.images.set(newArr);
    if (this.galleryIndex() >= newArr.length) this.galleryIndex.set(Math.max(0, newArr.length - 1));
    if (newArr.length === 0) this.book.update(cur => cur ? ({ ...cur, first_image: null } as any) : cur);
    await this.toast('Imagen eliminada');
  }

  onPortadaModeChange(ev: CustomEvent) {
    const val = (ev as any)?.detail?.value as string | undefined;
    this.portadaMode.set(val === 'new' ? 'new' : 'keep');
  }

  // Pre-subida
  onPickFiles(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const list = input?.files;
    if (!list || !list.length) return;

    try { this.pendingPreviews().forEach(url => URL.revokeObjectURL(url)); } catch {}

    const files: File[] = []; const previews: string[] = [];
    for (let i = 0; i < list.length; i++) {
      const f = list.item(i)!; if (!f.type.startsWith('image/')) continue;
      files.push(f); previews.push(URL.createObjectURL(f));
    }
    if (!files.length) return;

    this.pendingFiles.set(files);
    this.pendingPreviews.set(previews);
    this.pendingCoverIndex.set(0);
    this.portadaMode.set('keep');
  }
  setPendingCover(i: number) { if (this.portadaMode() === 'new') this.pendingCoverIndex.set(i); }
  clearPending() {
    try { this.pendingPreviews().forEach(url => URL.revokeObjectURL(url)); } catch {}
    this.pendingFiles.set([]); this.pendingPreviews.set([]); this.pendingCoverIndex.set(0); this.portadaMode.set('keep');
  }

  async uploadPending() {
    const b = this.book(); const files = this.pendingFiles();
    if (!b || !files.length) return;

    const current = this.images();
    let maxOrd = 0; for (const im of current) { const o = Number(im.orden ?? 0); if (!Number.isNaN(o)) maxOrd = Math.max(maxOrd, o); }
    const baseOrder = maxOrd + 1;

    const ci = this.pendingCoverIndex();
    const ordered = this.portadaMode() === 'new'
      ? [files[ci], ...files.filter((_, idx) => idx !== ci)]
      : [...files];

    const hasExisting = (current?.length || 0) > 0;
    const firstShouldBeCover = this.portadaMode() === 'new' || !hasExisting;

    this.uploading.set(true);
    try {
      const newly: BookImage[] = [];
      for (let j = 0; j < ordered.length; j++) {
        const file = ordered[j];
        const res: any = await this.booksSvc
          .uploadImage(b.id, file, { is_portada: firstShouldBeCover && j === 0, orden: baseOrder + j })
          .toPromise();
        newly.push({
          id_imagen: res.id_imagen, url_imagen: res.url_imagen, url_abs: res.url_abs,
          descripcion: '', orden: res.orden, is_portada: !!res.is_portada, created_at: null,
        });
      }

      const merged = [...(this.images() || []), ...newly];
      if (firstShouldBeCover && newly[0]) {
        const newCoverId = newly[0].id_imagen;
        const mergedWithCover = merged.map(i => ({ ...i, is_portada: i.id_imagen === newCoverId }));
        this.images.set(mergedWithCover);
        this.book.update(cur => cur ? ({ ...cur, first_image: newly[0].url_abs } as any) : cur);
      } else { this.images.set(merged); }

      await this.toast(ordered.length === 1 ? 'Imagen subida' : 'Imágenes subidas');
      this.clearPending();
    } catch (err: any) {
      const msg = err?.error?.imagen?.[0] || err?.error?.image?.[0] || err?.error?.detail || 'No se pudo subir la(s) imagen(es)';
      console.error(err);
      await this.toast(msg);
    } finally { this.uploading.set(false); }
  }

  // Edición
  openEdit() { this.editOpen.set(true); }
  closeEdit() { this.editOpen.set(false); }

  async saveEdit() {
    const b = this.book(); if (!b) return;

    const payload: any = {
      titulo: this.edit.titulo,
      autor: this.edit.autor,
      editorial: this.edit.editorial,
      tipo_tapa: this.edit.tipo_tapa,
      estado: this.edit.estado,
      descripcion: this.edit.descripcion,
      disponible: this.edit.disponible,
      isbn: this.edit.isbn,
      id_genero: this.edit.id_genero,
    };

    // normaliza año
    if (this.edit.anio_publicacion !== '' && this.edit.anio_publicacion != null) {
      payload.anio_publicacion = Number(this.edit.anio_publicacion);
    }

    // quita undefined
    Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);

    await this.booksSvc.updateBook(b.id, payload).toPromise();

    // Refresca UI local (incluye nombre de género si cambió)
    const genero_nombre = this.generoName(payload.id_genero ?? b['id_genero']);
    this.book.update(cur => cur ? ({ ...cur, ...payload, genero_nombre } as any) : cur);

    await this.toast('Libro actualizado');
    this.editOpen.set(false);
  }

  private async toast(message: string) {
    const t = await this.toastCtrl.create({ message, duration: 1800, position: 'bottom' });
    await t.present();
  }

  async deletePublication() {
    const b = this.book(); if (!b) return;
    const alert = await this.alertCtrl.create({
      header: 'Eliminar publicación',
      message: 'Esto eliminará el libro y todas sus imágenes. ¿Continuar?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar', role: 'destructive',
          handler: async () => {
            try {
              await this.booksSvc.deleteBook(b.id).toPromise();
              await this.toast('Publicación eliminada');
              this.router.navigateByUrl('/my-books', { replaceUrl: true });
            } catch (e: any) {
              const msg = e?.error?.detail || 'No se pudo eliminar';
              await this.toast(msg);
            }
          },
        },
      ],
    });
    await alert.present();
  }
}
