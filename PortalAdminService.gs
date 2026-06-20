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

function crearVisitaRapidaAdmin(data, adminToken) {
  const usuario = validarAdminToken_(adminToken);
  validarDataAdmin_(data, ['idPortalCliente', 'fechaVisita', 'servicio', 'tipoIntervencion', 'caracterServicio']);
  const cliente = obtenerClientePortalActivoPorId_(data.idPortalCliente);
  const visible = normalizarTexto_(data.visible || 'SI').toUpperCase();
  if (visible !== 'SI' && visible !== 'NO') throw new Error('VISIBLE debe ser SI o NO.');

  const monitoreos = Array.isArray(data.monitoreos) ? data.monitoreos : [];
  const idPublicacion = generarId_('PUB');
  const contenido = normalizarTexto_(data.contenido) || construirContenidoVisitaRapida_(data);
  const titulo = normalizarTexto_(data.titulo) || ('Servicio ' + normalizarTexto_(data.servicio));
  const fechaVisita = new Date(data.fechaVisita);

  const publicacion = {
    ID_PUBLICACION: idPublicacion,
    ID_PORTAL_CLIENTE: normalizarTexto_(cliente.ID_PORTAL_CLIENTE),
    ID_VISITA_ORIGEN: 'VIS_RAPIDA',
    FECHA_VISITA: fechaVisita,
    SUCURSAL: normalizarTexto_(data.sucursal),
    TIPO_SERVICIO: normalizarTexto_(data.servicio),
    TITULO: titulo,
    CATEGORIA: normalizarTexto_(data.tipoIntervencion) + ' - ' + normalizarTexto_(data.caracterServicio),
    ESTADO_PUBLICACION: 'PUBLICADO',
    RESUMEN_CLIENTE: normalizarTexto_(data.resumenCliente),
    CONTENIDO: contenido,
    VISIBLE: visible,
    FECHA_CARGA: new Date(),
    FECHA_PUBLICACION: new Date(),
    USUARIO_CARGA: usuario
  };

  appendPortalRow_(PORTAL_CONFIG.HOJAS.PUBLICACIONES, publicacion);

  let cantidadMonitoreos = 0;
  monitoreos.forEach(function(punto) {
    if (!punto) return;
    const tieneDato = ['sector', 'puntoControl', 'tipoPunto', 'resultado', 'novedad', 'accionCorrectiva', 'observaciones'].some(function(key) {
      return normalizarTexto_(punto[key]);
    });
    if (!tieneDato) return;

    appendPortalRow_(PORTAL_CONFIG.HOJAS.MONITOREOS, {
      ID_MONITOREO: generarId_('MON'),
      ID_PUBLICACION: idPublicacion,
      ID_PORTAL_CLIENTE: normalizarTexto_(cliente.ID_PORTAL_CLIENTE),
      FECHA: fechaVisita,
      SECTOR: normalizarTexto_(punto.sector),
      PUNTO_CONTROL: normalizarTexto_(punto.puntoControl),
      TIPO: normalizarTexto_(punto.tipoPunto),
      RESULTADO: normalizarTexto_(punto.resultado),
      NOVEDAD: normalizarTexto_(punto.novedad),
      ACCION_CORRECTIVA: normalizarTexto_(punto.accionCorrectiva),
      OBSERVACIONES: normalizarTexto_(punto.observaciones),
      VISIBLE: visible,
      FECHA_CARGA: new Date(),
      USUARIO_CARGA: usuario
    });
    cantidadMonitoreos++;
  });

  registrarLog('', publicacion.ID_PORTAL_CLIENTE, 'CREAR_VISITA_RAPIDA', 'OK', idPublicacion + ' - puntos: ' + cantidadMonitoreos);

  return {
    ok: true,
    idPublicacion: idPublicacion,
    cantidadMonitoreos: cantidadMonitoreos,
    mensaje: 'Visita cargada correctamente'
  };
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

function obtenerOpcionesPortalAdmin(adminToken) {
  validarAdminToken_(adminToken);
  const defaults = obtenerOpcionesPortalDefault_();

  try {
    const hoja = obtenerHojaPortal_(PORTAL_CONFIG.HOJAS.OPCIONES);
    const opciones = leerFilasPorHeaders_(hoja).filter(function(row) {
      return esSi_(row.ACTIVO);
    });

    if (!opciones.length) {
      return {
        ok: true,
        origen: 'DEFAULT',
        mensaje: 'PORTAL_OPCIONES esta vacia. Se usan opciones por defecto.',
        opciones: defaults
      };
    }

    return {
      ok: true,
      origen: 'HOJA',
      opciones: agruparOpcionesPortal_(opciones)
    };
  } catch (error) {
    return {
      ok: true,
      origen: 'DEFAULT',
      mensaje: 'PORTAL_OPCIONES no existe todavia. Se usan opciones por defecto.',
      opciones: defaults
    };
  }
}

function inicializarOpcionesPortalAdmin(adminToken) {
  const usuario = validarAdminToken_(adminToken);
  const ss = abrirPortalSS_();
  const nombreHoja = PORTAL_CONFIG.HOJAS.OPCIONES;
  const headers = PORTAL_CONFIG.HEADERS[nombreHoja];
  const hoja = crearHojaPortalSiNoExiste_(ss, nombreHoja, headers);

  if (hoja.getLastRow() > 1) {
    registrarLog('', '', 'INICIALIZAR_PORTAL_OPCIONES', 'OK', usuario + ' - hoja ya tenia opciones');
    return {
      ok: true,
      mensaje: 'PORTAL_OPCIONES ya existe y tiene opciones cargadas.'
    };
  }

  const filas = obtenerFilasOpcionesPortalDefault_();
  if (filas.length) {
    hoja.getRange(2, 1, filas.length, headers.length).setValues(filas.map(function(row) {
      return headers.map(function(header) {
        return row[header] === undefined ? '' : row[header];
      });
    }));
  }

  registrarLog('', '', 'INICIALIZAR_PORTAL_OPCIONES', 'OK', usuario + ' - opciones iniciales: ' + filas.length);
  return {
    ok: true,
    mensaje: 'PORTAL_OPCIONES inicializada correctamente.',
    cantidad: filas.length
  };
}

function obtenerVistaClienteAdmin(idPortalCliente, adminToken) {
  validarAdminToken_(adminToken);
  const id = normalizarTexto_(idPortalCliente);
  if (!id) throw new Error('Falta seleccionar un cliente.');

  const cliente = obtenerClientePortalPorIdAdmin_(id);
  if (!cliente) {
    throw new Error('No existe un cliente portal con ID_PORTAL_CLIENTE: ' + id);
  }

  const publicaciones = leerFilasPorHeaders_(obtenerHojaPortal_(PORTAL_CONFIG.HOJAS.PUBLICACIONES))
    .filter(function(row) {
      return normalizarTexto_(row.ID_PORTAL_CLIENTE) === id && esSi_(row.VISIBLE);
    })
    .map(function(row) {
      return {
        idPublicacion: normalizarTexto_(row.ID_PUBLICACION),
        fechaVisita: formatearFecha_(row.FECHA_VISITA),
        sucursal: normalizarTexto_(row.SUCURSAL),
        tipoServicio: normalizarTexto_(row.TIPO_SERVICIO),
        titulo: normalizarTexto_(row.TITULO),
        categoria: normalizarTexto_(row.CATEGORIA),
        resumenCliente: normalizarTexto_(row.RESUMEN_CLIENTE),
        contenido: normalizarTexto_(row.CONTENIDO)
      };
    });

  const monitoreos = leerFilasPorHeaders_(obtenerHojaPortal_(PORTAL_CONFIG.HOJAS.MONITOREOS))
    .filter(function(row) {
      return normalizarTexto_(row.ID_PORTAL_CLIENTE) === id && esSi_(row.VISIBLE);
    })
    .map(function(row) {
      return {
        idMonitoreo: normalizarTexto_(row.ID_MONITOREO),
        idPublicacion: normalizarTexto_(row.ID_PUBLICACION),
        fecha: formatearFecha_(row.FECHA),
        sector: normalizarTexto_(row.SECTOR),
        puntoControl: normalizarTexto_(row.PUNTO_CONTROL),
        tipo: normalizarTexto_(row.TIPO),
        resultado: normalizarTexto_(row.RESULTADO),
        novedad: normalizarTexto_(row.NOVEDAD),
        accionCorrectiva: normalizarTexto_(row.ACCION_CORRECTIVA),
        observaciones: normalizarTexto_(row.OBSERVACIONES)
      };
    });

  const documentos = leerFilasPorHeaders_(obtenerHojaPortal_(PORTAL_CONFIG.HOJAS.DOCUMENTOS))
    .filter(function(row) {
      return normalizarTexto_(row.ID_PORTAL_CLIENTE) === id && esSi_(row.VISIBLE);
    })
    .map(function(row) {
      return {
        idDocumento: normalizarTexto_(row.ID_DOCUMENTO),
        idPublicacion: normalizarTexto_(row.ID_PUBLICACION),
        titulo: normalizarTexto_(row.TITULO),
        tipo: normalizarTexto_(row.TIPO),
        url: normalizarTexto_(row.URL),
        descripcion: normalizarTexto_(row.DESCRIPCION),
        fechaCarga: formatearFecha_(row.FECHA_CARGA)
      };
    });

  return {
    ok: true,
    cliente: {
      idPortalCliente: normalizarTexto_(cliente.ID_PORTAL_CLIENTE),
      idClienteOrigen: normalizarTexto_(cliente.ID_CLIENTE_ORIGEN),
      cuit: normalizarTexto_(cliente.CUIT),
      razonSocial: normalizarTexto_(cliente.RAZON_SOCIAL),
      nombreFantasia: normalizarTexto_(cliente.NOMBRE_FANTASIA),
      emailPrincipal: normalizarTexto_(cliente.EMAIL_PRINCIPAL),
      telefono: normalizarTexto_(cliente.TELEFONO),
      direccion: normalizarTexto_(cliente.DIRECCION),
      activo: normalizarTexto_(cliente.ACTIVO)
    },
    publicaciones: publicaciones,
    monitoreos: monitoreos,
    documentos: documentos
  };
}

function obtenerGestionClienteAdmin(idPortalCliente, adminToken) {
  validarAdminToken_(adminToken);
  const id = normalizarTexto_(idPortalCliente);
  if (!id) throw new Error('Falta seleccionar un cliente.');

  const cliente = obtenerClientePortalPorIdAdmin_(id);
  if (!cliente) {
    throw new Error('No existe un cliente portal con ID_PORTAL_CLIENTE: ' + id);
  }

  return {
    ok: true,
    cliente: {
      idPortalCliente: normalizarTexto_(cliente.ID_PORTAL_CLIENTE),
      cuit: normalizarTexto_(cliente.CUIT),
      razonSocial: normalizarTexto_(cliente.RAZON_SOCIAL),
      nombreFantasia: normalizarTexto_(cliente.NOMBRE_FANTASIA),
      emailPrincipal: normalizarTexto_(cliente.EMAIL_PRINCIPAL)
    },
    publicaciones: leerRegistrosGestionPortal_(PORTAL_CONFIG.HOJAS.PUBLICACIONES, id, function(row) {
      return {
        id: normalizarTexto_(row.ID_PUBLICACION),
        fecha: formatearFecha_(row.FECHA_VISITA),
        fechaVisita: formatearFechaSimple_(row.FECHA_VISITA),
        titulo: normalizarTexto_(row.TITULO),
        detalle: [normalizarTexto_(row.TIPO_SERVICIO), normalizarTexto_(row.SUCURSAL)].filter(Boolean).join(' - '),
        sucursal: normalizarTexto_(row.SUCURSAL),
        tipoServicio: normalizarTexto_(row.TIPO_SERVICIO),
        categoria: normalizarTexto_(row.CATEGORIA),
        estadoPublicacion: normalizarTexto_(row.ESTADO_PUBLICACION),
        resumen: normalizarTexto_(row.RESUMEN_CLIENTE),
        resumenCliente: normalizarTexto_(row.RESUMEN_CLIENTE),
        contenido: normalizarTexto_(row.CONTENIDO),
        visible: normalizarTexto_(row.VISIBLE) || 'NO'
      };
    }),
    monitoreos: leerRegistrosGestionPortal_(PORTAL_CONFIG.HOJAS.MONITOREOS, id, function(row) {
      return {
        id: normalizarTexto_(row.ID_MONITOREO),
        fecha: formatearFecha_(row.FECHA),
        titulo: [normalizarTexto_(row.SECTOR), normalizarTexto_(row.PUNTO_CONTROL)].filter(Boolean).join(' - ') || 'Monitoreo',
        detalle: normalizarTexto_(row.TIPO),
        resumen: normalizarTexto_(row.RESULTADO),
        visible: normalizarTexto_(row.VISIBLE) || 'NO'
      };
    }),
    documentos: leerRegistrosGestionPortal_(PORTAL_CONFIG.HOJAS.DOCUMENTOS, id, function(row) {
      return {
        id: normalizarTexto_(row.ID_DOCUMENTO),
        fecha: formatearFecha_(row.FECHA_CARGA),
        titulo: normalizarTexto_(row.TITULO),
        detalle: normalizarTexto_(row.TIPO),
        resumen: normalizarTexto_(row.DESCRIPCION),
        url: normalizarTexto_(row.URL),
        carpetaDriveId: normalizarTexto_(row.CARPETA_DRIVE_ID),
        descripcion: normalizarTexto_(row.DESCRIPCION),
        visible: normalizarTexto_(row.VISIBLE) || 'NO'
      };
    })
  };
}

function actualizarPublicacionAdmin(idPublicacion, data, adminToken) {
  validarAdminToken_(adminToken);
  return actualizarRegistroPortalPorId_(
    PORTAL_CONFIG.HOJAS.PUBLICACIONES,
    'ID_PUBLICACION',
    idPublicacion,
    data,
    {
      FECHA_VISITA: 'fechaVisita',
      SUCURSAL: 'sucursal',
      TIPO_SERVICIO: 'tipoServicio',
      TITULO: 'titulo',
      CATEGORIA: 'categoria',
      ESTADO_PUBLICACION: 'estadoPublicacion',
      RESUMEN_CLIENTE: 'resumenCliente',
      CONTENIDO: 'contenido',
      VISIBLE: 'visible'
    },
    'ACTUALIZAR_PUBLICACION'
  );
}

function obtenerOpcionesPortalDefault_() {
  return agruparOpcionesPortal_(obtenerFilasOpcionesPortalDefault_());
}

function obtenerFilasOpcionesPortalDefault_() {
  const grupos = {
    SERVICIO: ['Fumigacion', 'Desratizacion', 'Desinsectacion', 'Desinfeccion', 'Monitoreo MIP', 'Inspeccion'],
    TIPO_INTERVENCION: ['Preventivo', 'Correctivo', 'Refuerzo', 'Seguimiento'],
    CARACTER_SERVICIO: ['Servicio usual / programado', 'Emergencia', 'Reclamo', 'Auditoria'],
    TIPO_PUNTO: ['Caja cebadera', 'Trampa mecanica', 'Placa adhesiva', 'Punto de inspeccion', 'Otro'],
    RESULTADO_MONITOREO: ['Sin actividad', 'Consumo bajo', 'Consumo medio', 'Consumo alto', 'Captura', 'Danada', 'Faltante', 'Reponer cebo', 'No inspeccionada'],
    ACCION_CORRECTIVA: ['No requiere', 'Se repuso cebo', 'Se reemplazo caja', 'Se limpio el punto', 'Se reforzo tratamiento', 'Informar al cliente'],
    TIPO_SERVICIO: ['Desinsectacion', 'Desratizacion', 'Monitoreo', 'Control integral', 'Visita tecnica'],
    CATEGORIA_PUBLICACION: ['Visita', 'Informe', 'Certificado', 'Comunicado'],
    ESTADO_PUBLICACION: ['PUBLICADO', 'BORRADOR'],
    SUCURSAL: ['Casa central', 'Sucursal', 'Deposito', 'Planta'],
    TIPO_DOCUMENTO: ['PDF', 'Certificado', 'Informe', 'Hoja de seguridad', 'Protocolo'],
    TIPO_MONITOREO: ['Cebadero', 'Trampa', 'Inspeccion', 'Punto de control']
  };

  const filas = [];
  Object.keys(grupos).forEach(function(grupo) {
    grupos[grupo].forEach(function(valor, index) {
      filas.push({
        ID_OPCION: generarId_('OPC'),
        GRUPO: grupo,
        VALOR: valor,
        ETIQUETA: valor,
        ACTIVO: 'SI',
        ORDEN: index + 1,
        OBSERVACIONES: 'Default inicial'
      });
    });
  });
  return filas;
}

function construirContenidoVisitaRapida_(data) {
  const partes = [];
  if (normalizarTexto_(data.novedades)) partes.push('Novedades encontradas: ' + normalizarTexto_(data.novedades));
  if (normalizarTexto_(data.consejos)) partes.push('Consejos / recomendaciones: ' + normalizarTexto_(data.consejos));
  return partes.join('\n\n');
}

function agruparOpcionesPortal_(filas) {
  const out = {};
  filas.forEach(function(row) {
    const grupo = normalizarTexto_(row.GRUPO);
    if (!grupo) return;
    const valor = normalizarTexto_(row.VALOR);
    const etiqueta = normalizarTexto_(row.ETIQUETA) || valor;
    if (!valor && !etiqueta) return;
    if (!out[grupo]) out[grupo] = [];
    out[grupo].push({
      valor: valor || etiqueta,
      etiqueta: etiqueta,
      orden: Number(row.ORDEN || 0)
    });
  });

  Object.keys(out).forEach(function(grupo) {
    out[grupo].sort(function(a, b) {
      return a.orden - b.orden || a.etiqueta.localeCompare(b.etiqueta);
    });
  });

  return out;
}

function actualizarDocumentoAdmin(idDocumento, data, adminToken) {
  validarAdminToken_(adminToken);
  return actualizarRegistroPortalPorId_(
    PORTAL_CONFIG.HOJAS.DOCUMENTOS,
    'ID_DOCUMENTO',
    idDocumento,
    data,
    {
      TITULO: 'titulo',
      TIPO: 'tipo',
      URL: 'url',
      CARPETA_DRIVE_ID: 'carpetaDriveId',
      DESCRIPCION: 'descripcion',
      VISIBLE: 'visible'
    },
    'ACTUALIZAR_DOCUMENTO'
  );
}

function cambiarVisiblePublicacionAdmin(idPublicacion, visible, adminToken) {
  validarAdminToken_(adminToken);
  return cambiarVisibleRegistroPortal_(
    PORTAL_CONFIG.HOJAS.PUBLICACIONES,
    'ID_PUBLICACION',
    idPublicacion,
    visible,
    'CAMBIAR_VISIBLE_PUBLICACION'
  );
}

function cambiarVisibleMonitoreoAdmin(idMonitoreo, visible, adminToken) {
  validarAdminToken_(adminToken);
  return cambiarVisibleRegistroPortal_(
    PORTAL_CONFIG.HOJAS.MONITOREOS,
    'ID_MONITOREO',
    idMonitoreo,
    visible,
    'CAMBIAR_VISIBLE_MONITOREO'
  );
}

function cambiarVisibleDocumentoAdmin(idDocumento, visible, adminToken) {
  validarAdminToken_(adminToken);
  return cambiarVisibleRegistroPortal_(
    PORTAL_CONFIG.HOJAS.DOCUMENTOS,
    'ID_DOCUMENTO',
    idDocumento,
    visible,
    'CAMBIAR_VISIBLE_DOCUMENTO'
  );
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

function obtenerClientePortalPorIdAdmin_(idPortalCliente) {
  const id = normalizarTexto_(idPortalCliente);
  if (!id) return null;

  const hojaClientes = obtenerHojaPortal_(PORTAL_CONFIG.HOJAS.CLIENTES);
  const clientes = leerFilasPorHeaders_(hojaClientes);
  return clientes.find(function(row) {
    return normalizarTexto_(row.ID_PORTAL_CLIENTE) === id;
  }) || null;
}

function leerRegistrosGestionPortal_(nombreHoja, idPortalCliente, mapper) {
  return leerFilasPorHeaders_(obtenerHojaPortal_(nombreHoja))
    .filter(function(row) {
      return normalizarTexto_(row.ID_PORTAL_CLIENTE) === idPortalCliente;
    })
    .map(mapper);
}

function cambiarVisibleRegistroPortal_(nombreHoja, idHeader, idRegistro, visible, accion) {
  const id = normalizarTexto_(idRegistro);
  const visibleNormalizado = normalizarTexto_(visible).toUpperCase();
  if (!id) throw new Error('Falta ID del registro.');
  if (visibleNormalizado !== 'SI' && visibleNormalizado !== 'NO') {
    throw new Error('VISIBLE debe ser SI o NO.');
  }

  const hoja = obtenerHojaPortal_(nombreHoja);
  const lastCol = hoja.getLastColumn();
  const headers = hoja.getRange(1, 1, 1, lastCol).getValues()[0].map(function(header) {
    return normalizarTexto_(header);
  });
  const idCol = headers.indexOf(idHeader) + 1;
  const visibleCol = headers.indexOf('VISIBLE') + 1;
  const idClienteCol = headers.indexOf('ID_PORTAL_CLIENTE') + 1;
  if (!idCol || !visibleCol) throw new Error('No se encontraron columnas requeridas en ' + nombreHoja + '.');

  const lastRow = hoja.getLastRow();
  if (lastRow < 2) throw new Error('No hay registros en ' + nombreHoja + '.');

  const values = hoja.getRange(2, 1, lastRow - 1, lastCol).getValues();
  for (let index = 0; index < values.length; index++) {
    if (normalizarTexto_(values[index][idCol - 1]) === id) {
      const rowNumber = index + 2;
      hoja.getRange(rowNumber, visibleCol).setValue(visibleNormalizado);
      const idPortalCliente = idClienteCol ? normalizarTexto_(values[index][idClienteCol - 1]) : '';
      registrarLog('', idPortalCliente, accion, 'OK', id + ' => ' + visibleNormalizado);
      return {
        ok: true,
        id: id,
        visible: visibleNormalizado,
        mensaje: 'Visibilidad actualizada a ' + visibleNormalizado + '.'
      };
    }
  }

  throw new Error('No se encontro el registro ' + id + ' en ' + nombreHoja + '.');
}

function actualizarRegistroPortalPorId_(nombreHoja, idHeader, idRegistro, data, columnasPermitidas, accion) {
  const id = normalizarTexto_(idRegistro);
  if (!id) throw new Error('Falta ID del registro.');
  if (!data) throw new Error('No se recibieron datos para actualizar.');

  const hoja = obtenerHojaPortal_(nombreHoja);
  const lastCol = hoja.getLastColumn();
  const headers = hoja.getRange(1, 1, 1, lastCol).getValues()[0].map(function(header) {
    return normalizarTexto_(header);
  });
  const idCol = headers.indexOf(idHeader) + 1;
  const idClienteCol = headers.indexOf('ID_PORTAL_CLIENTE') + 1;
  if (!idCol) throw new Error('No se encontro la columna ' + idHeader + ' en ' + nombreHoja + '.');

  const cambios = [];
  Object.keys(columnasPermitidas).forEach(function(header) {
    const dataKey = columnasPermitidas[header];
    if (!Object.prototype.hasOwnProperty.call(data, dataKey)) return;

    const col = headers.indexOf(header) + 1;
    if (!col) return;

    let valor = data[dataKey];
    if (header === 'VISIBLE') {
      valor = normalizarTexto_(valor).toUpperCase();
      if (valor !== 'SI' && valor !== 'NO') {
        throw new Error('VISIBLE debe ser SI o NO.');
      }
    } else if (header === 'FECHA_VISITA') {
      valor = valor ? new Date(valor) : '';
    } else {
      valor = normalizarTexto_(valor);
    }

    cambios.push({ header: header, col: col, valor: valor });
  });

  if (!cambios.length) throw new Error('No hay campos permitidos para actualizar.');

  const lastRow = hoja.getLastRow();
  if (lastRow < 2) throw new Error('No hay registros en ' + nombreHoja + '.');

  const values = hoja.getRange(2, 1, lastRow - 1, lastCol).getValues();
  for (let index = 0; index < values.length; index++) {
    if (normalizarTexto_(values[index][idCol - 1]) === id) {
      const rowNumber = index + 2;
      cambios.forEach(function(cambio) {
        hoja.getRange(rowNumber, cambio.col).setValue(cambio.valor);
      });
      const idPortalCliente = idClienteCol ? normalizarTexto_(values[index][idClienteCol - 1]) : '';
      registrarLog('', idPortalCliente, accion, 'OK', id + ' - campos: ' + cambios.map(function(cambio) {
        return cambio.header;
      }).join(', '));
      return {
        ok: true,
        id: id,
        mensaje: 'Registro actualizado correctamente.'
      };
    }
  }

  throw new Error('No se encontro el registro ' + id + ' en ' + nombreHoja + '.');
}

function formatearFechaSimple_(valor) {
  if (!valor) return '';
  if (Object.prototype.toString.call(valor) === '[object Date]') {
    return Utilities.formatDate(valor, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return String(valor);
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
