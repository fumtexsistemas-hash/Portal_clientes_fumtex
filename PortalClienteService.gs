function obtenerPublicacionesCliente(idPortalCliente, token) {
  return obtenerRegistrosVisiblesCliente_(
    PORTAL_CONFIG.HOJAS.PUBLICACIONES,
    idPortalCliente,
    token,
    ['ID_PUBLICACION', 'TITULO', 'CATEGORIA', 'CONTENIDO', 'FECHA_PUBLICACION', 'FECHA_CARGA']
  );
}

function obtenerMonitoreosCliente(idPortalCliente, token) {
  return obtenerRegistrosVisiblesCliente_(
    PORTAL_CONFIG.HOJAS.MONITOREOS,
    idPortalCliente,
    token,
    ['ID_MONITOREO', 'FECHA', 'SECTOR', 'TIPO', 'RESULTADO', 'OBSERVACIONES']
  );
}

function obtenerDocumentosCliente(idPortalCliente, token) {
  return obtenerRegistrosVisiblesCliente_(
    PORTAL_CONFIG.HOJAS.DOCUMENTOS,
    idPortalCliente,
    token,
    ['ID_DOCUMENTO', 'TITULO', 'TIPO', 'URL', 'DESCRIPCION', 'FECHA_CARGA']
  );
}

function obtenerRegistrosVisiblesCliente_(nombreHoja, idPortalCliente, token, campos) {
  const id = normalizarTexto_(idPortalCliente);
  if (!id) return { ok: false, mensaje: 'Falta ID_PORTAL_CLIENTE.', items: [] };
  if (!validarSesionCliente_(id, token)) {
    registrarLog('', id, 'CONSULTA_CLIENTE', 'ERROR', 'Sesion invalida o vencida');
    return { ok: false, mensaje: 'Sesion vencida. Volve a iniciar sesion.', items: [] };
  }

  try {
    const hoja = obtenerHojaPortal_(nombreHoja);
    const filas = leerFilasPorHeaders_(hoja);
    const items = filas
      .filter(function(row) {
        return normalizarTexto_(row.ID_PORTAL_CLIENTE) === id && esSi_(row.VISIBLE);
      })
      .map(function(row) {
        const item = {};
        campos.forEach(function(campo) {
          item[campo] = formatearFecha_(row[campo]);
        });
        return item;
      });

    return { ok: true, items: items };
  } catch (error) {
    return { ok: false, mensaje: error.message, items: [] };
  }
}
