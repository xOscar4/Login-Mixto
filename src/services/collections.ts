/**
 * Servicio de colecciones — Melody
 *
 * Este archivo contendrá el CRUD real de colecciones contra Supabase.
 * Se implementará en la FASE 2 — PASO 5 (colecciones en base de datos).
 *
 * Mientras tanto, la aplicación sigue usando CollectionsContext (memoria local).
 * No elimines ni modifiques CollectionsContext hasta que este servicio esté listo.
 */

export { supabase } from '@/lib/supabase';

// ── Stubs (se implementarán cuando la tabla collections exista en Supabase) ─

/**
 * Obtener todas las colecciones del usuario autenticado.
 * @todo Implementar en PASO 5 — Colecciones
 */
export async function fetchCollections(): Promise<never> {
  throw new Error('fetchCollections: todavía no implementado. Ver FASE 2 — PASO 5.');
}

/**
 * Crear una colección nueva.
 * @todo Implementar en PASO 5 — Colecciones
 */
export async function createCollection(_data: { name: string; description?: string }): Promise<never> {
  throw new Error('createCollection: todavía no implementado. Ver FASE 2 — PASO 5.');
}

/**
 * Actualizar una colección existente.
 * @todo Implementar en PASO 5 — Colecciones
 */
export async function updateCollection(
  _id: string,
  _data: { name?: string; description?: string },
): Promise<never> {
  throw new Error('updateCollection: todavía no implementado. Ver FASE 2 — PASO 5.');
}

/**
 * Eliminar una colección.
 * @todo Implementar en PASO 5 — Colecciones
 */
export async function deleteCollection(_id: string): Promise<never> {
  throw new Error('deleteCollection: todavía no implementado. Ver FASE 2 — PASO 5.');
}
