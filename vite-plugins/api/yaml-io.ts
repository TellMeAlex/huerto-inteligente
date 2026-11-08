import { parseDocument, parse as parseYaml, type Document, type ToStringOptions } from 'yaml'
import { HttpError, readTextFile, writeTextFileAtomic } from './fs-helpers.ts'

/**
 * Opciones de serialización pensadas para minimizar el diff al reescribir.
 * eemeli/yaml reserializa todo el documento desde el AST, así que estas opciones
 * replican el estilo de los session.yaml del repo (cada string en una sola línea,
 * colecciones flow sin padding interno) en lugar del estilo por defecto (folding a
 * 80 columnas y `[ "a", "b" ]`), que cambiaría casi todas las líneas.
 */
const STRINGIFY_OPTIONS: ToStringOptions = {
  lineWidth: 0, // no plegar líneas largas
  flowCollectionPadding: false, // ["a","b"] en vez de [ "a", "b" ]
}

/**
 * Lee un YAML como Document editable (CST/AST). Mutar por ruta con setIn preserva
 * orden de claves, comentarios y estilo del resto del fichero — a diferencia de
 * un load/dump que reserializa todo el objeto.
 */
export function readYamlDoc(filePath: string): Document.Parsed {
  const raw = readTextFile(filePath)
  const doc = parseDocument(raw)
  if (doc.errors.length > 0) {
    throw new HttpError(500, `YAML inválido en disco: ${doc.errors[0].message}`)
  }
  return doc
}

/** Lee un YAML como objeto plano (para inspección de datos, no para reescritura). */
export function readYamlAsPlain<T = unknown>(filePath: string): T {
  return parseYaml(readTextFile(filePath)) as T
}

/**
 * Aplica setIn sobre una rama concreta del documento y escribe a disco de forma atómica.
 *
 * Orden de comprobaciones antes de tocar el fichero (si alguna falla, no se escribe):
 *  1. `validate` (opcional): recibe el documento proyectado a objeto plano ya con el
 *     cambio aplicado, para invariantes de negocio (ej. suma de agenda).
 *  2. Reserializa y re-parsea para garantizar que el resultado sigue siendo YAML válido.
 */
export function writeYamlDocField(
  filePath: string,
  fieldPath: (string | number)[],
  value: unknown,
  validate?: (projected: Record<string, unknown>) => void,
): void {
  const doc = readYamlDoc(filePath)
  doc.setIn(fieldPath, value)

  if (validate) {
    validate(doc.toJSON() as Record<string, unknown>)
  }

  const serialized = doc.toString(STRINGIFY_OPTIONS)
  try {
    parseYaml(serialized)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    throw new HttpError(500, `El guardado produciría YAML inválido: ${message}`)
  }

  writeTextFileAtomic(filePath, serialized)
}

/** Valida que un texto sea YAML parseable; lanza 400 si no. Usado para checklist.yaml. */
export function assertParseableYaml(content: string): void {
  try {
    parseYaml(content)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    throw new HttpError(400, `El contenido no es YAML válido: ${message}`)
  }
}
