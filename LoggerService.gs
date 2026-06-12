function registrarLog(email, idPortalCliente, accion, resultado, detalle) {
  try {
    appendPortalRow_(PORTAL_CONFIG.HOJAS.LOG, {
      ID_LOG: generarId_('LOG'),
      FECHA_HORA: new Date(),
      EMAIL: normalizarClave_(email),
      ID_PORTAL_CLIENTE: normalizarTexto_(idPortalCliente),
      ACCION: normalizarTexto_(accion),
      RESULTADO: normalizarTexto_(resultado),
      DETALLE: normalizarTexto_(detalle)
    });
  } catch (error) {
    Logger.log('No se pudo registrar log: ' + error.message);
  }
}
