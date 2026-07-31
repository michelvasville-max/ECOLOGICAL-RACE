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
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, signOut } from 'firebase/auth';
import { Institucion, Aula, RegistroSemanal, Comentario, IntegranteEquipo, ReaccionFoto, Aliado } from '../types';
import { ProyectoMetadata } from '../components/NuestroProyectoTab';

// Valores por defecto provistos por AI Studio (pueden ser sobreescritos por variables .env)
const env = (import.meta as any).env || {};

export const isFirebaseConfigured = !!env.VITE_FIREBASE_API_KEY;

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: env.VITE_FIREBASE_APP_ID || ""
};

const app = initializeApp(firebaseConfig);

// Inicializamos Firestore usando la base de datos "(default)" estándar
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

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

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
      tenantId: auth?.currentUser?.tenantId || null,
      providerInfo: auth?.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
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
      handleFirestoreError(error, OperationType.GET, 'comentarios');
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

export function escucharAliados(onUpdate: (data: Aliado[]) => void) {
  return onSnapshot(collection(db, 'aliados'), 
    (snapshot) => {
      const list: Aliado[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Aliado);
      });
      onUpdate(list);
    },
    (error) => {
      console.warn("Firestore error in escucharAliados (using fallback):", error);
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
  try {
    await setDoc(doc(db, 'comentarios', com.id), com);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `comentarios/${com.id}`);
  }
}

export async function actualizarComentario(id: string, updates: Partial<Comentario>) {
  try {
    await updateDoc(doc(db, 'comentarios', id), updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `comentarios/${id}`);
  }
}

export async function eliminarComentario(id: string) {
  try {
    await deleteDoc(doc(db, 'comentarios', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `comentarios/${id}`);
  }
}

export async function guardarMiembroEquipo(miembro: IntegranteEquipo) {
  await setDoc(doc(db, 'equipo', miembro.id), miembro);
}

export async function eliminarMiembroEquipo(id: string) {
  await deleteDoc(doc(db, 'equipo', id));
}

export async function guardarAliado(aliado: Aliado) {
  await setDoc(doc(db, 'aliados', aliado.id), aliado);
}

export async function eliminarAliado(id: string) {
  await deleteDoc(doc(db, 'aliados', id));
}

export function escucharReaccionesFotos(onUpdate: (data: ReaccionFoto[]) => void) {
  return onSnapshot(collection(db, 'reacciones_fotos'), 
    (snapshot) => {
      const list: ReaccionFoto[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as ReaccionFoto);
      });
      onUpdate(list);
    },
    (error) => {
      console.warn("Firestore error in escucharReaccionesFotos (using fallback):", error);
    }
  );
}

export async function guardarReaccionFoto(reac: ReaccionFoto) {
  await setDoc(doc(db, 'reacciones_fotos', reac.id), reac);
}

export async function eliminarReaccionFoto(id: string) {
  await deleteDoc(doc(db, 'reacciones_fotos', id));
}

export async function iniciarSesionConGoogle() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: 'select_account'
  });

  try {
    return await signInWithPopup(auth, provider);
  } catch (error: any) {
    console.warn("signInWithPopup failed, checking fallback options. Error code:", error.code, error);

    // 1. Si el dominio no está autorizado, mostrar instrucciones precisas e inmediatas
    if (error.code === 'auth/unauthorized-domain') {
      const host = window.location.hostname;
      alert(
        `⚠️ ERROR DE CONFIGURACIÓN DE FIREBASE ⚠️\n\n` +
        `El dominio actual "${host}" no está autorizado en tu proyecto de Firebase.\n\n` +
        `Para solucionarlo y poder usar tus cuentas de correo personales reales, por favor sigue estos 4 sencillos pasos:\n\n` +
        `1. Ve a la Consola de Firebase: https://console.firebase.google.com/\n` +
        `2. Entra a tu proyecto de Firebase.\n` +
        `3. Ve al menú izquierdo: "Authentication" -> pestaña "Settings" (Configuración).\n` +
        `4. Busca la sección "Authorized domains" (Dominios autorizados), haz clic en "Add domain" (Agregar dominio) e ingresa exactamente:\n` +
        `   ${host}\n\n` +
        `¡Una vez guardado, podrás iniciar sesión con tu cuenta de Google real al instante!`
      );
      throw error;
    }

    // 2. Si el proveedor de Google no está activado
    if (error.code === 'auth/operation-not-allowed') {
      alert(
        `⚠️ PROVEEDOR DE GOOGLE DESACTIVADO ⚠️\n\n` +
        `El inicio de sesión con Google no está activado en tu proyecto de Firebase.\n\n` +
        `Para solucionarlo:\n` +
        `1. Ve a la Consola de Firebase -> Authentication -> pestaña "Sign-in method".\n` +
        `2. Haz clic en "Add new provider" (Agregar nuevo proveedor) y selecciona "Google".\n` +
        `3. Actívalo, guarda la configuración y vuelve a intentar.`
      );
      throw error;
    }

    // 3. Si el popup fue bloqueado por el navegador o cerrado, intentar con redireccionamiento automático
    if (error.code === 'auth/popup-blocked' || error.code === 'auth/cancelled-popup-request') {
      try {
        console.log("Popup blocked or closed. Falling back to signInWithRedirect...");
        return await signInWithRedirect(auth, provider);
      } catch (redirectError: any) {
        console.error("signInWithRedirect also failed:", redirectError);
        throw redirectError;
      }
    }

    throw error;
  }
}

export function cerrarSesion() {
  return signOut(auth);
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
    instagramUrl: metadata.instagramUrl || '',
    redesSociales: metadata.redesSociales || [],
    materialesBonus: metadata.materialesBonus || [],
    retosEcoeficiencia: metadata.retosEcoeficiencia || [],
    manualSecciones: metadata.manualSecciones || [],
    donacionesQrUrl: metadata.donacionesQrUrl || '',
    donacionesTitular: metadata.donacionesTitular || 'Neida Villegas',
    aliadosIntroTexto: metadata.aliadosIntroTexto || '',
    aliadosImagenUrl: metadata.aliadosImagenUrl || ''
  });
}

/**
 * Elimina todos los documentos de las colecciones de prueba (aulas, registros, comentarios, equipo)
 * dejando la base de datos vacía y lista para uso real en producción.
 */
export async function vaciarColeccionesDePrueba() {
  const colecciones = ['aulas', 'registros', 'comentarios', 'equipo', 'reacciones_fotos'];
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

export async function eliminarRegistro(id: string) {
  await deleteDoc(doc(db, 'registros', id));
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

