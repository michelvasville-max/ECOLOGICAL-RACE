/**
 * CONFIGURACIÓN DE FIREBASE — ECOLOGICAL RACE
 * 
 * Este módulo gestiona la conexión con Firebase Firestore y Firebase Storage en tiempo real.
 * 
 * === INSTRUCCIONES PARA EL ADMNISTRADOR (Consola de Firebase) ===
 * Si descargas este proyecto y quieres conectarlo a tu propio Firebase:
 * 
 * 1. Ve a la consola de Firebase (https://console.firebase.google.com/).
 * 2. Crea un nuevo proyecto llamado "Ecological Race" (o el nombre de tu preferencia).
 * 3. Activa "Cloud Firestore" en modo de prueba (o configura las reglas de seguridad).
 * 4. Activa "Firebase Storage" en modo de prueba (o configura las reglas de seguridad).
 * 5. Registra una aplicación web en el proyecto para obtener tus credenciales.
 * 6. Copia las credenciales (apiKey, appId, etc.) y reemplaza los valores del objeto `firebaseConfig` abajo,
 *    o defínelas como variables de entorno (VITE_FIREBASE_API_KEY, etc.) en tu archivo `.env`.
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, onSnapshot, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Institucion, Aula, RegistroSemanal, Comentario, IntegranteEquipo } from '../types';
import { ProyectoMetadata } from '../components/NuestroProyectoTab';

// Valores por defecto provistos por AI Studio (pueden ser sobreescritos por variables .env)
const env = (import.meta as any).env || {};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyCQVNhD6o-JVqlH4SCkkrYGm-1Iet1EZYE",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "quesomaps.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "quesomaps",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "quesomaps.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "317739893844",
  appId: env.VITE_FIREBASE_APP_ID || "1:317739893844:web:79c972d3d3e647560899c1"
};

const app = initializeApp(firebaseConfig);

// Inicializamos Firestore con soporte para la base de datos específica provista si se especifica
const customDbId = "ai-studio-ecologicalrace-84766a4e-0598-48c4-aaf3-613a5006642e";
export const db = getFirestore(app, customDbId);
export const storage = getStorage(app);

// === FUNCIONES AUXILIARES DE SUBIDA DE IMÁGENES A FIREBASE STORAGE ===

/**
 * Comprime una imagen a un tamaño razonable (máx 800px) y la convierte a Base64.
 * Esto sirve como un fallback extremadamente robusto si Firebase Storage falla o no está configurado.
 */
function comprimirYLeerBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      // Si no es una imagen (ej. PDF o documento), retornar base64 sin comprimir
      if (!file.type.startsWith('image/')) {
        resolve(event.target?.result as string || '');
        return;
      }

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Redimensionar si supera 800px en el lado mayor
        const MAX_DIM = 800;
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Comprimir como JPEG con calidad 0.7 para minimizar tamaño
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(dataUrl);
        } else {
          resolve(event.target?.result as string || '');
        }
      };
      img.onerror = () => {
        resolve(event.target?.result as string || '');
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Sube un archivo a Firebase Storage y retorna su URL de descarga pública.
 * Si falla la subida debido a límites de cuota, reglas de Storage o falta de aprovisionamiento,
 * realiza un fallback automático convirtiendo y comprimiendo la imagen a un data URL Base64 de alta eficiencia.
 * 
 * @param file El archivo seleccionado por el usuario.
 * @param path El subdirectorio de destino (ej. 'logos', 'evidencias', 'proyecto')
 */
export async function subirImagenAFirebase(file: File, path: string): Promise<string> {
  try {
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExtension}`;
    const storageRef = ref(storage, `${path}/${fileName}`);
    
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.warn("Firebase Storage upload failed (falling back to compressed Base64 data URL):", error);
    try {
      return await comprimirYLeerBase64(file);
    } catch (fallbackError) {
      console.error("Base64 fallback also failed:", fallbackError);
      throw error; // Lanzar el error original si todo falla
    }
  }
}

// === FUNCIONES DE SINCRONIZACIÓN EN TIEMPO REAL (onSnapshot) ===

export function escucharInstituciones(onUpdate: (data: Institucion[]) => void) {
  return onSnapshot(collection(db, 'instituciones'), 
    (snapshot) => {
      const list: Institucion[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Institucion);
      });
      onUpdate(list);
    },
    (error) => {
      console.warn("Firestore error in escucharInstituciones (using fallback):", error);
    }
  );
}

export function escucharAulas(onUpdate: (data: Aula[]) => void) {
  return onSnapshot(collection(db, 'aulas'), 
    (snapshot) => {
      const list: Aula[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Aula);
      });
      onUpdate(list);
    },
    (error) => {
      console.warn("Firestore error in escucharAulas (using fallback):", error);
    }
  );
}

export function escucharRegistros(onUpdate: (data: RegistroSemanal[]) => void) {
  return onSnapshot(collection(db, 'registros'), 
    (snapshot) => {
      const list: RegistroSemanal[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as RegistroSemanal);
      });
      // Ordenar por fecha descendente
      list.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
      onUpdate(list);
    },
    (error) => {
      console.warn("Firestore error in escucharRegistros (using fallback):", error);
    }
  );
}

export function escucharComentarios(onUpdate: (data: Comentario[]) => void) {
  return onSnapshot(collection(db, 'comentarios'), 
    (snapshot) => {
      const list: Comentario[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Comentario);
      });
      // Ordenar por fecha descendente
      list.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
      onUpdate(list);
    },
    (error) => {
      console.warn("Firestore error in escucharComentarios (using fallback):", error);
    }
  );
}

export function escucharEquipo(onUpdate: (data: IntegranteEquipo[]) => void) {
  return onSnapshot(collection(db, 'equipo'), 
    (snapshot) => {
      const list: IntegranteEquipo[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as IntegranteEquipo);
      });
      onUpdate(list);
    },
    (error) => {
      console.warn("Firestore error in escucharEquipo (using fallback):", error);
    }
  );
}

export function escucharProyectoMetadata(onUpdate: (data: ProyectoMetadata) => void, fallback: ProyectoMetadata) {
  return onSnapshot(doc(db, 'proyecto_metadata', 'default'), 
    (docSnap) => {
      if (docSnap.exists()) {
        onUpdate({ id: docSnap.id, ...docSnap.data() } as ProyectoMetadata);
      } else {
        // Si no existe, inicializar con el fallback
        setDoc(doc(db, 'proyecto_metadata', 'default'), fallback).catch(err => {
          console.warn("Error setting fallback project metadata in Firestore:", err);
        });
        onUpdate(fallback);
      }
    },
    (error) => {
      console.warn("Firestore error in escucharProyectoMetadata (using fallback):", error);
      onUpdate(fallback);
    }
  );
}

// === FUNCIONES DE ESCRITURA EN FIRESTORE ===

export async function guardarInstitucion(inst: Institucion) {
  await setDoc(doc(db, 'instituciones', inst.id), inst);
}

export async function guardarAula(aula: Aula) {
  await setDoc(doc(db, 'aulas', aula.id), aula);
}

export async function guardarRegistro(reg: RegistroSemanal) {
  await setDoc(doc(db, 'registros', reg.id), reg);
}

export async function guardarComentario(com: Comentario) {
  await setDoc(doc(db, 'comentarios', com.id), com);
}

export async function actualizarComentario(id: string, updates: Partial<Comentario>) {
  await updateDoc(doc(db, 'comentarios', id), updates);
}

export async function eliminarComentario(id: string) {
  await deleteDoc(doc(db, 'comentarios', id));
}

export async function guardarMiembroEquipo(miembro: IntegranteEquipo) {
  await setDoc(doc(db, 'equipo', miembro.id), miembro);
}

export async function guardarProyectoMetadata(metadata: ProyectoMetadata) {
  await setDoc(doc(db, 'proyecto_metadata', 'default'), {
    logoUrl: metadata.logoUrl || '',
    mision: metadata.mision || '',
    vision: metadata.vision || '',
    nombreProyecto: metadata.nombreProyecto || '',
    categoria: metadata.categoria || '',
    institucionBase: metadata.institucionBase || '',
    metaGlobalCO2: metadata.metaGlobalCO2 || 1500,
    imagenMisionUrl: metadata.imagenMisionUrl || '',
    imagenVisionUrl: metadata.imagenVisionUrl || '',
    tiktokUser: metadata.tiktokUser || '',
    tiktokUrl: metadata.tiktokUrl || '',
    instagramUser: metadata.instagramUser || '',
    instagramUrl: metadata.instagramUrl || ''
  });
}

/**
 * Elimina todos los documentos de las colecciones de prueba (aulas, registros, comentarios, equipo)
 * dejando la base de datos vacía y lista para uso real en producción.
 */
export async function vaciarColeccionesDePrueba() {
  const colecciones = ['aulas', 'registros', 'comentarios', 'equipo'];
  for (const colName of colecciones) {
    try {
      const snap = await getDocs(collection(db, colName));
      const promesas = snap.docs.map((docSnap) => deleteDoc(doc(db, colName, docSnap.id)));
      await Promise.all(promesas);
      console.log(`Colección '${colName}' vaciada exitosamente.`);
    } catch (e) {
      console.error(`Error al vaciar la colección '${colName}':`, e);
    }
  }
}

export async function eliminarAula(id: string) {
  await deleteDoc(doc(db, 'aulas', id));
  try {
    const snap = await getDocs(collection(db, 'registros'));
    const promesas = snap.docs
      .filter((docSnap) => docSnap.data().aulaId === id)
      .map((docSnap) => deleteDoc(doc(db, 'registros', docSnap.id)));
    await Promise.all(promesas);
  } catch (error) {
    console.warn("Error al eliminar registros del aula:", error);
  }
}

export async function eliminarInstitucion(id: string) {
  await deleteDoc(doc(db, 'instituciones', id));
  try {
    const aulasSnap = await getDocs(collection(db, 'aulas'));
    const aulasDeInst = aulasSnap.docs.filter((docSnap) => docSnap.data().institucionId === id);

    for (const aulaDoc of aulasDeInst) {
      const aulaId = aulaDoc.id;
      const registrosSnap = await getDocs(collection(db, 'registros'));
      const registrosDeAula = registrosSnap.docs.filter((docSnap) => docSnap.data().aulaId === aulaId);
      const deleteRegPromesas = registrosDeAula.map((docSnap) => deleteDoc(doc(db, 'registros', docSnap.id)));
      await Promise.all(deleteRegPromesas);

      await deleteDoc(doc(db, 'aulas', aulaId));
    }
  } catch (error) {
    console.warn("Error al eliminar aulas y registros de la institución:", error);
  }
}

