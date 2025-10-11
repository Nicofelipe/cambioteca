// src/app/core/services/chat.service.ts
import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import ApiService from './api.service';

export type ChatMessage = {
  id_mensaje: number;
  id_conversacion: number;
  id_usuario_emisor: number;   // mapeado desde emisor_id
  cuerpo: string;
  enviado_en: string;
  editado_en?: string | null;
  eliminado?: number;
};

export type ConversationSummary = {
  id_conversacion: number;
  actualizado_en: string | null;       // usamos ultimo_enviado_en
  last_body?: string | null;           // mapeado desde ultimo_mensaje
  counterpart_name?: string | null;    // mapeado desde otro_usuario
  counterpart_avatar?: string | null;  // mapeado desde otro_usuario.imagen_perfil
  unread_count?: number;               // no lo provee el backend (queda undefined)
};

@Injectable({ providedIn: 'root' })
export class ChatService {
  constructor(private api: ApiService) { }

  /** Lista de conversaciones del usuario logueado */
  listConversations(userId: number): Observable<ConversationSummary[]> {
    return this.api.get<any[]>(`/api/chat/${userId}/conversaciones/`).pipe(
      map(rows => (rows || []).map((r: any) => ({
        id_conversacion: r.id_conversacion,
        actualizado_en: r.ultimo_enviado_en ?? null,
        last_body: r.ultimo_mensaje ?? null,
        counterpart_name: r.otro_usuario?.nombre_usuario ?? r.otro_usuario?.nombres ?? null,
        counterpart_avatar: r.otro_usuario?.imagen_perfil ?? null,
        unread_count: r.unread_count ?? 0,
        // usamos el título listo del backend (Nombre · Libro)
        titulo: r.display_title ?? r.titulo_chat ?? null,
        // (opcional si lo quieres en la room)
        requested_book_title: r.requested_book_title ?? null,
      })))
    );
  }


  /** Mensajes de una conversación; usa ?after=<id> */
  listMessages(convId: number, afterId?: number): Observable<ChatMessage[]> {
    let params = new HttpParams();
    if (afterId && afterId > 0) params = params.set('after', String(afterId));

    return this.api.get<any[]>(`/api/chat/conversacion/${convId}/mensajes/`, { params }).pipe(
      map(arr => (arr || []).map((m: any) => ({
        id_mensaje: m.id_mensaje,
        id_conversacion: convId,
        id_usuario_emisor: m.emisor_id,   // 👈 mapeo clave
        cuerpo: m.cuerpo,
        enviado_en: m.enviado_en,
        editado_en: m.editado_en ?? null,
        eliminado: m.eliminado,
      } as ChatMessage)))
    );
  }

  /** Enviar mensaje: requiere id_usuario_emisor */
  sendMessage(convId: number, body: string, emitterUserId: number) {
    return this.api.post<{ id_mensaje: number }>(
      `/api/chat/conversacion/${convId}/enviar/`,
      { id_usuario_emisor: emitterUserId, cuerpo: body }
    );
  }

  /** Marcar conversación como vista por el usuario */
  markSeen(convId: number, userId: number) {
    return this.api.post<{ ultimo_visto_id_mensaje: number }>(
      `/api/chat/conversacion/${convId}/visto/`,
      { id_usuario: userId }
    );
  }
}
