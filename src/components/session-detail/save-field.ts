/** Firma del guardado granular de un campo de session.yaml, inyectada a cada pestaña. */
export type SaveField = (path: (string | number)[], value: unknown) => Promise<unknown>
