function generarHashClaveDesdePropiedadTemporal() {
  validarAdminPortal_();

  const props = PropertiesService.getScriptProperties();
  const clave = props.getProperty('TEMP_CLAVE_PORTAL');

  if (!clave || String(clave).trim() === '') {
    throw new Error('No existe TEMP_CLAVE_PORTAL en Script Properties.');
  }

  const hash = hashClave_(clave);

  props.deleteProperty('TEMP_CLAVE_PORTAL');

  Logger.log('CLAVE_HASH generado: ' + hash);
  return hash;
}
