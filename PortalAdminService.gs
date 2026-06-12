function crearPublicacionAdmin(data) {
  validarAdminPortal_();
  validarDataAdmin_(data, ['idPortalCliente', 'titulo', 'contenido']);
  const cliente = obtenerClientePortalActivoPorId_(data.idPortalCliente);
  const usuario = Session.getActiveUser().getEmail();
  const row = {
    ID_PUBLICACION: generarId_('PUB'),
    ID_PORTAL_CLIENTE: normalizarTexto_(cliente.ID_PORTAL_CLIENTE),
    TITULO: normalizarTexto_(data.titulo),
    CATEGORIA: normalizarTexto_(data.categoria),
    CONTENIDO: normalizarTexto_(data.contenido),
    VISIBLE: data.visible === false ? 'NO' : 'SI',
    FECHA_CARGA: new Date(),
    FECHA_PUBLICACION: data.fechaPublicacion ? new Date(data.fechaPublicacion) : new Date(),
    USUARIO_CARGA: usuario
  };

  appendPortalRow_(PORTAL_CONFIG.HOJAS.PUBLICACIONES, row);
  registrarLog(usuario, row.ID_PORTAL_CLIENTE, 'CREAR_PUBLICACION', 'OK', row.ID_PUBLICACION);
  return { ok: true, id: row.ID_PUBLICACION, mensaje: 'Publicacion creada.' };
}

function crearMonitoreoAdmin(data) {
  validarAdminPortal_();
  validarDataAdmin_(data, ['idPortalCliente', 'fecha', 'resultado']);
  const cliente = obtenerClientePortalActivoPorId_(data.idPortalCliente);
  const usuario = Session.getActiveUser().getEmail();
  const row = {
    ID_MONITOREO: generarId_('MON'),
    ID_PORTAL_CLIENTE: normalizarTexto_(cliente.ID_PORTAL_CLIENTE),
    FECHA: data.fecha ? new Date(data.fecha) : new Date(),
    SECTOR: normalizarTexto_(data.sector),
    TIPO: normalizarTexto_(data.tipo),
    RESULTADO: normalizarTexto_(data.resultado),
    OBSERVACIONES: normalizarTexto_(data.observaciones),
    VISIBLE: data.visible === false ? 'NO' : 'SI',
    FECHA_CARGA: new Date(),
    USUARIO_CARGA: usuario
  };

  appendPortalRow_(PORTAL_CONFIG.HOJAS.MONITOREOS, row);
  registrarLog(usuario, row.ID_PORTAL_CLIENTE, 'CREAR_MONITOREO', 'OK', row.ID_MONITOREO);
  return { ok: true, id: row.ID_MONITOREO, mensaje: 'Monitoreo creado.' };
}

function crearDocumentoAdmin(data) {
  validarAdminPortal_();
  validarDataAdmin_(data, ['idPortalCliente', 'titulo', 'url']);
  const cliente = obtenerClientePortalActivoPorId_(data.idPortalCliente);
  const usuario = Session.getActiveUser().getEmail();
  const row = {
    ID_DOCUMENTO: generarId_('DOC'),
    ID_PORTAL_CLIENTE: normalizarTexto_(cliente.ID_PORTAL_CLIENTE),
    TITULO: normalizarTexto_(data.titulo),
    TIPO: normalizarTexto_(data.tipo),
    URL: normalizarTexto_(data.url),
    DESCRIPCION: normalizarTexto_(data.descripcion),
    VISIBLE: data.visible === false ? 'NO' : 'SI',
    FECHA_CARGA: new Date(),
    USUARIO_CARGA: usuario
  };

  appendPortalRow_(PORTAL_CONFIG.HOJAS.DOCUMENTOS, row);
  registrarLog(usuario, row.ID_PORTAL_CLIENTE, 'CREAR_DOCUMENTO', 'OK', row.ID_DOCUMENTO);
  return { ok: true, id: row.ID_DOCUMENTO, mensaje: 'Documento creado.' };
}

function validarDataAdmin_(data, campos) {
  if (!data) throw new Error('No se recibieron datos.');
  campos.forEach(function(campo) {
    if (!normalizarTexto_(data[campo])) {
      throw new Error('Falta completar: ' + campo);
    }
  });
}

function obtenerClientePortalActivoPorId_(idPortalCliente) {
  const id = normalizarTexto_(idPortalCliente);
  if (!id) throw new Error('Falta ID_PORTAL_CLIENTE.');

  const hojaClientes = obtenerHojaPortal_(PORTAL_CONFIG.HOJAS.CLIENTES);
  const clientes = leerFilasPorHeaders_(hojaClientes);
  const cliente = clientes.find(function(row) {
    return normalizarTexto_(row.ID_PORTAL_CLIENTE) === id;
  });

  if (!cliente) {
    throw new Error('No existe un cliente portal con ID_PORTAL_CLIENTE: ' + id);
  }

  if (!esSi_(cliente.ACTIVO)) {
    throw new Error('El cliente portal esta inactivo: ' + id);
  }

  return cliente;
}

function validarAdminPortal_() {
  const email = normalizarClave_(Session.getActiveUser().getEmail());
  if (!email || PORTAL_CONFIG.ADMIN_EMAILS.indexOf(email) === -1) {
    throw new Error('No tenes permiso para administrar el portal.');
  }
  return email;
}
