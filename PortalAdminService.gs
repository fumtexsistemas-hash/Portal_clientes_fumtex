function loginAdmin(pin) {
  const pinIngresado = normalizarTexto_(pin);
  const pinConfigurado = PropertiesService.getScriptProperties().getProperty('PORTAL_ADMIN_PIN');

  if (!pinConfigurado) {
    return { ok: false, mensaje: 'No existe PORTAL_ADMIN_PIN en Script Properties.' };
  }

  if (!pinIngresado || pinIngresado !== String(pinConfigurado)) {
    registrarLog('', '', 'LOGIN_ADMIN', 'ERROR', 'PIN invalido');
    return { ok: false, mensaje: 'PIN admin invalido.' };
  }

  const token = Utilities.getUuid();
  const payload = JSON.stringify({
    usuario: 'ADMIN_PORTAL',
    fecha: new Date().toISOString()
  });

  CacheService.getScriptCache().put('ADMIN_' + token, payload, PORTAL_CONFIG.SESSION_TTL_SECONDS);
  registrarLog('', '', 'LOGIN_ADMIN', 'OK', 'Acceso admin correcto');

  return {
    ok: true,
    token: token,
    usuario: 'ADMIN_PORTAL',
    mensaje: 'Acceso admin correcto.'
  };
}

function validarAdminToken_(token) {
  const tokenLimpio = normalizarTexto_(token);
  if (!tokenLimpio) throw new Error('Falta token admin.');

  const raw = CacheService.getScriptCache().get('ADMIN_' + tokenLimpio);
  if (!raw) throw new Error('Sesion admin vencida o invalida. Volve a ingresar.');

  return 'ADMIN_PORTAL';
}

function crearClientePortalAdmin(data, adminToken) {
  const usuario = validarAdminToken_(adminToken);
  validarDataAdmin_(data, ['cuit', 'razonSocial']);

  const row = {
    ID_PORTAL_CLIENTE: normalizarTexto_(data.idPortalCliente) || generarId_('CLI'),
    ID_CLIENTE_ORIGEN: normalizarTexto_(data.idClienteOrigen),
    CUIT: normalizarTexto_(data.cuit),
    RAZON_SOCIAL: normalizarTexto_(data.razonSocial),
    NOMBRE_FANTASIA: normalizarTexto_(data.nombreFantasia),
    EMAIL_PRINCIPAL: normalizarClave_(data.emailPrincipal),
    TELEFONO: normalizarTexto_(data.telefono),
    DIRECCION: normalizarTexto_(data.direccion),
    CARPETA_DRIVE_ID: normalizarTexto_(data.carpetaDriveId),
    ACTIVO: normalizarSiNo_(data.activo),
    FECHA_ALTA: new Date(),
    OBSERVACIONES: normalizarTexto_(data.observaciones)
  };

  appendPortalRow_(PORTAL_CONFIG.HOJAS.CLIENTES, row);
  registrarLog('', row.ID_PORTAL_CLIENTE, 'CREAR_CLIENTE_PORTAL', 'OK', usuario + ' - ' + row.ID_PORTAL_CLIENTE);
  return { ok: true, id: row.ID_PORTAL_CLIENTE, mensaje: 'Cliente portal creado.' };
}

function crearUsuarioPortalAdmin(data, adminToken) {
  const usuario = validarAdminToken_(adminToken);
  validarDataAdmin_(data, ['idPortalCliente', 'cuit', 'email', 'claveTemporal']);
  const cliente = obtenerClientePortalActivoPorId_(data.idPortalCliente);
  const claveTemporal = normalizarTexto_(data.claveTemporal);

  const row = {
    ID_USUARIO: normalizarTexto_(data.idUsuario) || generarId_('USR'),
    ID_PORTAL_CLIENTE: normalizarTexto_(cliente.ID_PORTAL_CLIENTE),
    CUIT: normalizarTexto_(data.cuit),
    EMAIL: normalizarClave_(data.email),
    CLAVE_HASH: hashClave_(claveTemporal),
    NOMBRE: normalizarTexto_(data.nombre),
    ROL: normalizarTexto_(data.rol) || 'CLIENTE',
    ACTIVO: normalizarSiNo_(data.activo),
    FECHA_ALTA: new Date(),
    ULTIMO_ACCESO: ''
  };

  appendPortalRow_(PORTAL_CONFIG.HOJAS.USUARIOS, row);
  registrarLog('', row.ID_PORTAL_CLIENTE, 'CREAR_USUARIO_PORTAL', 'OK', usuario + ' - ' + row.ID_USUARIO);
  return { ok: true, id: row.ID_USUARIO, mensaje: 'Usuario portal creado.' };
}

function crearPublicacionAdmin(data, adminToken) {
  const usuario = validarAdminToken_(adminToken);
  validarDataAdmin_(data, ['idPortalCliente', 'titulo', 'contenido']);
  const cliente = obtenerClientePortalActivoPorId_(data.idPortalCliente);
  const row = {
    ID_PUBLICACION: normalizarTexto_(data.idPublicacion) || generarId_('PUB'),
    ID_PORTAL_CLIENTE: normalizarTexto_(cliente.ID_PORTAL_CLIENTE),
    ID_VISITA_ORIGEN: normalizarTexto_(data.idVisitaOrigen),
    FECHA_VISITA: data.fechaVisita ? new Date(data.fechaVisita) : '',
    SUCURSAL: normalizarTexto_(data.sucursal),
    TIPO_SERVICIO: normalizarTexto_(data.tipoServicio),
    TITULO: normalizarTexto_(data.titulo),
    CATEGORIA: normalizarTexto_(data.categoria),
    ESTADO_PUBLICACION: normalizarTexto_(data.estadoPublicacion) || 'PUBLICADO',
    RESUMEN_CLIENTE: normalizarTexto_(data.resumenCliente),
    CONTENIDO: normalizarTexto_(data.contenido),
    VISIBLE: normalizarSiNo_(data.visible),
    FECHA_CARGA: new Date(),
    FECHA_PUBLICACION: data.fechaPublicacion ? new Date(data.fechaPublicacion) : new Date(),
    USUARIO_CARGA: usuario
  };

  appendPortalRow_(PORTAL_CONFIG.HOJAS.PUBLICACIONES, row);
  registrarLog('', row.ID_PORTAL_CLIENTE, 'CREAR_PUBLICACION', 'OK', usuario + ' - ' + row.ID_PUBLICACION);
  return { ok: true, id: row.ID_PUBLICACION, mensaje: 'Publicacion creada.' };
}

function crearMonitoreoAdmin(data, adminToken) {
  const usuario = validarAdminToken_(adminToken);
  validarDataAdmin_(data, ['idPortalCliente', 'fecha', 'resultado']);
  const cliente = obtenerClientePortalActivoPorId_(data.idPortalCliente);
  const row = {
    ID_MONITOREO: normalizarTexto_(data.idMonitoreo) || generarId_('MON'),
    ID_PUBLICACION: normalizarTexto_(data.idPublicacion),
    ID_PORTAL_CLIENTE: normalizarTexto_(cliente.ID_PORTAL_CLIENTE),
    FECHA: data.fecha ? new Date(data.fecha) : new Date(),
    SECTOR: normalizarTexto_(data.sector),
    PUNTO_CONTROL: normalizarTexto_(data.puntoControl),
    TIPO: normalizarTexto_(data.tipo),
    RESULTADO: normalizarTexto_(data.resultado),
    NOVEDAD: normalizarTexto_(data.novedad),
    ACCION_CORRECTIVA: normalizarTexto_(data.accionCorrectiva),
    OBSERVACIONES: normalizarTexto_(data.observaciones),
    VISIBLE: normalizarSiNo_(data.visible),
    FECHA_CARGA: new Date(),
    USUARIO_CARGA: usuario
  };

  appendPortalRow_(PORTAL_CONFIG.HOJAS.MONITOREOS, row);
  registrarLog('', row.ID_PORTAL_CLIENTE, 'CREAR_MONITOREO', 'OK', usuario + ' - ' + row.ID_MONITOREO);
  return { ok: true, id: row.ID_MONITOREO, mensaje: 'Monitoreo creado.' };
}

function crearDocumentoAdmin(data, adminToken) {
  const usuario = validarAdminToken_(adminToken);
  validarDataAdmin_(data, ['idPortalCliente', 'titulo', 'url']);
  const cliente = obtenerClientePortalActivoPorId_(data.idPortalCliente);
  const row = {
    ID_DOCUMENTO: normalizarTexto_(data.idDocumento) || generarId_('DOC'),
    ID_PORTAL_CLIENTE: normalizarTexto_(cliente.ID_PORTAL_CLIENTE),
    ID_PUBLICACION: normalizarTexto_(data.idPublicacion),
    TITULO: normalizarTexto_(data.titulo),
    TIPO: normalizarTexto_(data.tipo),
    URL: normalizarTexto_(data.url),
    CARPETA_DRIVE_ID: normalizarTexto_(data.carpetaDriveId),
    DESCRIPCION: normalizarTexto_(data.descripcion),
    VISIBLE: normalizarSiNo_(data.visible),
    FECHA_CARGA: new Date(),
    USUARIO_CARGA: usuario
  };

  appendPortalRow_(PORTAL_CONFIG.HOJAS.DOCUMENTOS, row);
  registrarLog('', row.ID_PORTAL_CLIENTE, 'CREAR_DOCUMENTO', 'OK', usuario + ' - ' + row.ID_DOCUMENTO);
  return { ok: true, id: row.ID_DOCUMENTO, mensaje: 'Documento creado.' };
}

function listarClientesPortalAdmin(adminToken) {
  validarAdminToken_(adminToken);
  const hoja = obtenerHojaPortal_(PORTAL_CONFIG.HOJAS.CLIENTES);
  const clientes = leerFilasPorHeaders_(hoja).filter(function(row) {
    return esSi_(row.ACTIVO);
  }).map(function(row) {
    return {
      idPortalCliente: normalizarTexto_(row.ID_PORTAL_CLIENTE),
      razonSocial: normalizarTexto_(row.RAZON_SOCIAL),
      nombreFantasia: normalizarTexto_(row.NOMBRE_FANTASIA),
      cuit: normalizarTexto_(row.CUIT),
      emailPrincipal: normalizarTexto_(row.EMAIL_PRINCIPAL),
      activo: normalizarTexto_(row.ACTIVO)
    };
  });
  return { ok: true, clientes: clientes };
}

function listarPublicacionesPortalAdmin(adminToken) {
  validarAdminToken_(adminToken);
  const hoja = obtenerHojaPortal_(PORTAL_CONFIG.HOJAS.PUBLICACIONES);
  const publicaciones = leerFilasPorHeaders_(hoja).map(function(row) {
    return {
      idPublicacion: normalizarTexto_(row.ID_PUBLICACION),
      idPortalCliente: normalizarTexto_(row.ID_PORTAL_CLIENTE),
      titulo: normalizarTexto_(row.TITULO),
      categoria: normalizarTexto_(row.CATEGORIA),
      fechaVisita: formatearFecha_(row.FECHA_VISITA),
      tipoServicio: normalizarTexto_(row.TIPO_SERVICIO),
      sucursal: normalizarTexto_(row.SUCURSAL),
      visible: normalizarTexto_(row.VISIBLE),
      fechaCarga: formatearFecha_(row.FECHA_CARGA)
    };
  });
  return { ok: true, publicaciones: publicaciones };
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

function normalizarSiNo_(valor) {
  if (valor === false) return 'NO';
  const texto = normalizarTexto_(valor).toUpperCase();
  if (texto === 'NO' || texto === 'INACTIVO') return 'NO';
  return 'SI';
}
