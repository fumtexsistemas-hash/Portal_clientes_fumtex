function obtenerPublicacionesCliente(idPortalCliente, token) {
  return obtenerRegistrosVisiblesCliente_(
    PORTAL_CONFIG.HOJAS.PUBLICACIONES,
    idPortalCliente,
    token,
    [
      'ID_PUBLICACION',
      'ID_VISITA_ORIGEN',
      'FECHA_VISITA',
      'SUCURSAL',
      'TIPO_SERVICIO',
      'TITULO',
      'CATEGORIA',
      'ESTADO_PUBLICACION',
      'RESUMEN_CLIENTE',
      'CONTENIDO',
      'FECHA_PUBLICACION',
      'FECHA_CARGA'
    ]
  );
}

function obtenerMonitoreosCliente(idPortalCliente, token) {
  return obtenerRegistrosVisiblesCliente_(
    PORTAL_CONFIG.HOJAS.MONITOREOS,
    idPortalCliente,
    token,
    [
      'ID_MONITOREO',
      'ID_PUBLICACION',
      'FECHA',
      'SECTOR',
      'PUNTO_CONTROL',
      'TIPO',
      'RESULTADO',
      'NOVEDAD',
      'ACCION_CORRECTIVA',
      'OBSERVACIONES'
    ]
  );
}

function obtenerDocumentosCliente(idPortalCliente, token) {
  return obtenerRegistrosVisiblesCliente_(
    PORTAL_CONFIG.HOJAS.DOCUMENTOS,
    idPortalCliente,
    token,
    [
      'ID_DOCUMENTO',
      'ID_PUBLICACION',
      'TITULO',
      'TIPO',
      'URL',
      'CARPETA_DRIVE_ID',
      'DESCRIPCION',
      'FECHA_CARGA'
    ]
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

/**
 * Devuelve el panel del cliente agrupado por visita/publicacion.
 * Usa las funciones existentes para respetar la validacion actual del portal.
 *
 * @param {string} idPortalCliente
 * @param {string} token
 * @return {Object}
 */
function obtenerPanelClienteAgrupado(idPortalCliente, token) {
  if (!validarSesionCliente_(idPortalCliente, token)) {
    registrarLog('', idPortalCliente, 'CONSULTA_PANEL_CLIENTE', 'ERROR', 'Sesion invalida o vencida');
    return { ok: false, mensaje: 'Sesion vencida. Volve a iniciar sesion.', resumen: {}, visitas: [], documentosGenerales: [] };
  }

  var publicacionesResp = obtenerPublicacionesCliente(idPortalCliente, token);
  var monitoreosResp = obtenerMonitoreosCliente(idPortalCliente, token);
  var documentosResp = obtenerDocumentosCliente(idPortalCliente, token);

  var publicaciones = normalizarListaClientePortal_(publicacionesResp);
  var monitoreos = normalizarListaClientePortal_(monitoreosResp);
  var documentos = normalizarListaClientePortal_(documentosResp);

  var monitoreosPorPublicacion = agruparPorCampoPortal_(monitoreos, [
    'ID_PUBLICACION',
    'idPublicacion',
    'IdPublicacion'
  ]);

  var documentosPorPublicacion = agruparPorCampoPortal_(documentos, [
    'ID_PUBLICACION',
    'idPublicacion',
    'IdPublicacion'
  ]);

  var documentosGenerales = documentos.filter(function (doc) {
    return !obtenerValorCampoPortal_(doc, ['ID_PUBLICACION', 'idPublicacion', 'IdPublicacion']);
  });

  var visitas = publicaciones.map(function (pub) {
    var idPublicacion = String(obtenerValorCampoPortal_(pub, [
      'ID_PUBLICACION',
      'idPublicacion',
      'IdPublicacion'
    ]) || '');

    var monitoreosVisita = monitoreosPorPublicacion[idPublicacion] || [];
    var documentosVisita = documentosPorPublicacion[idPublicacion] || [];
    var indicadores = calcularIndicadoresVisitaPortal_(monitoreosVisita);

    return {
      idPublicacion: idPublicacion,
      fechaVisita: obtenerValorCampoPortal_(pub, ['FECHA_VISITA', 'fechaVisita', 'FechaVisita']),
      sucursal: obtenerValorCampoPortal_(pub, ['SUCURSAL', 'sucursal', 'Sucursal']),
      tipoServicio: obtenerValorCampoPortal_(pub, ['TIPO_SERVICIO', 'tipoServicio', 'TipoServicio']),
      titulo: obtenerValorCampoPortal_(pub, ['TITULO', 'titulo', 'Titulo']),
      categoria: obtenerValorCampoPortal_(pub, ['CATEGORIA', 'categoria', 'Categoria']),
      estadoPublicacion: obtenerValorCampoPortal_(pub, ['ESTADO_PUBLICACION', 'estadoPublicacion']),
      resumenCliente: obtenerValorCampoPortal_(pub, ['RESUMEN_CLIENTE', 'resumenCliente', 'ResumenCliente']),
      contenido: obtenerValorCampoPortal_(pub, ['CONTENIDO', 'contenido', 'Contenido']),
      indicadores: indicadores,
      monitoreos: monitoreosVisita.map(normalizarMonitoreoPanelCliente_),
      documentos: documentosVisita.map(normalizarDocumentoPanelCliente_).sort(ordenarDocumentosPorFechaCargaDesc_)
    };
  });

  visitas.sort(function (a, b) {
    return obtenerFechaOrdenPortal_(b.fechaVisita) - obtenerFechaOrdenPortal_(a.fechaVisita);
  });

  var resumen = calcularResumenPanelCliente_(visitas, documentos);

  return {
    ok: true,
    resumen: resumen,
    visitas: visitas,
    documentosGenerales: documentosGenerales.map(normalizarDocumentoPanelCliente_).sort(ordenarDocumentosPorFechaCargaDesc_)
  };
}

function normalizarListaClientePortal_(respuesta) {
  if (!respuesta) return [];
  if (Array.isArray(respuesta)) return respuesta;
  if (Array.isArray(respuesta.registros)) return respuesta.registros;
  if (Array.isArray(respuesta.items)) return respuesta.items;
  if (Array.isArray(respuesta.data)) return respuesta.data;
  if (Array.isArray(respuesta.publicaciones)) return respuesta.publicaciones;
  if (Array.isArray(respuesta.monitoreos)) return respuesta.monitoreos;
  if (Array.isArray(respuesta.documentos)) return respuesta.documentos;
  return [];
}

function agruparPorCampoPortal_(items, nombresCampo) {
  var agrupado = {};

  items.forEach(function (item) {
    var clave = String(obtenerValorCampoPortal_(item, nombresCampo) || '');
    if (!clave) return;

    if (!agrupado[clave]) {
      agrupado[clave] = [];
    }

    agrupado[clave].push(item);
  });

  return agrupado;
}

function obtenerValorCampoPortal_(obj, nombres) {
  if (!obj || !nombres || !nombres.length) return '';

  for (var i = 0; i < nombres.length; i++) {
    var nombre = nombres[i];

    if (Object.prototype.hasOwnProperty.call(obj, nombre)) {
      return obj[nombre];
    }

    var claves = Object.keys(obj);
    for (var j = 0; j < claves.length; j++) {
      if (String(claves[j]).toUpperCase() === String(nombre).toUpperCase()) {
        return obj[claves[j]];
      }
    }
  }

  return '';
}

function normalizarMonitoreoPanelCliente_(mon) {
  return {
    fecha: obtenerValorCampoPortal_(mon, ['FECHA', 'fecha', 'Fecha']),
    sector: obtenerValorCampoPortal_(mon, ['SECTOR', 'sector', 'Sector']),
    puntoControl: obtenerValorCampoPortal_(mon, ['PUNTO_CONTROL', 'puntoControl', 'PuntoControl']),
    tipo: obtenerValorCampoPortal_(mon, ['TIPO', 'tipo', 'Tipo']),
    resultado: obtenerValorCampoPortal_(mon, ['RESULTADO', 'resultado', 'Resultado']),
    novedad: obtenerValorCampoPortal_(mon, ['NOVEDAD', 'novedad', 'Novedad']),
    accionCorrectiva: obtenerValorCampoPortal_(mon, ['ACCION_CORRECTIVA', 'accionCorrectiva', 'AccionCorrectiva']),
    observaciones: obtenerValorCampoPortal_(mon, ['OBSERVACIONES', 'observaciones', 'Observaciones'])
  };
}

function normalizarDocumentoPanelCliente_(doc) {
  return {
    titulo: obtenerValorCampoPortal_(doc, ['TITULO', 'titulo', 'Titulo']),
    tipo: obtenerValorCampoPortal_(doc, ['TIPO', 'tipo', 'Tipo']),
    url: obtenerValorCampoPortal_(doc, ['URL', 'url', 'Url']),
    descripcion: obtenerValorCampoPortal_(doc, ['DESCRIPCION', 'descripcion', 'Descripcion']),
    fechaCarga: obtenerValorCampoPortal_(doc, ['FECHA_CARGA', 'fechaCarga', 'FechaCarga'])
  };
}

function ordenarDocumentosPorFechaCargaDesc_(a, b) {
  return obtenerFechaOrdenPortal_(b.fechaCarga) - obtenerFechaOrdenPortal_(a.fechaCarga);
}

function calcularIndicadoresVisitaPortal_(monitoreos) {
  var totalPuntos = monitoreos.length;
  var puntosControlados = 0;
  var puntosSinActividad = 0;
  var puntosConNovedad = 0;

  monitoreos.forEach(function (mon) {
    var resultado = String(obtenerValorCampoPortal_(mon, ['RESULTADO', 'resultado', 'Resultado']) || '').trim();
    var novedad = String(obtenerValorCampoPortal_(mon, ['NOVEDAD', 'novedad', 'Novedad']) || '').trim();

    var resultadoNorm = normalizarTextoPanelCliente_(resultado);
    var novedadNorm = normalizarTextoPanelCliente_(novedad);

    var estaControlado = resultadoNorm && resultadoNorm !== 'no inspeccionada';
    var sinActividad = resultadoNorm === 'sin actividad';

    var tieneNovedad =
      resultadoNorm &&
      resultadoNorm !== 'sin actividad' &&
      resultadoNorm !== 'no inspeccionada';

    if (
      novedadNorm &&
      novedadNorm !== 'sin novedades' &&
      novedadNorm !== 'sin novedad' &&
      novedadNorm !== 'no aplica'
    ) {
      tieneNovedad = true;
    }

    if (estaControlado) puntosControlados++;
    if (sinActividad) puntosSinActividad++;
    if (tieneNovedad) puntosConNovedad++;
  });

  var porcentajeControl = totalPuntos > 0
    ? Math.round((puntosControlados / totalPuntos) * 100)
    : null;

  var porcentajeSinActividad = totalPuntos > 0
    ? Math.round((puntosSinActividad / totalPuntos) * 100)
    : null;

  var estadoVisual = 'Servicio registrado';

  if (totalPuntos > 0 && puntosConNovedad === 0) {
    estadoVisual = 'Sin desvios';
  }

  if (totalPuntos > 0 && puntosConNovedad > 0) {
    estadoVisual = 'Con novedades';
  }

  return {
    totalPuntos: totalPuntos,
    puntosControlados: puntosControlados,
    puntosSinActividad: puntosSinActividad,
    puntosConNovedad: puntosConNovedad,
    porcentajeControl: porcentajeControl,
    porcentajeSinActividad: porcentajeSinActividad,
    estadoVisual: estadoVisual
  };
}

function calcularResumenPanelCliente_(visitas, documentos) {
  var totalPuntos = 0;
  var totalPuntosConNovedad = 0;
  var totalPuntosSinActividad = 0;
  var ultimaVisita = '';

  visitas.forEach(function (visita, index) {
    if (index === 0) {
      ultimaVisita = visita.fechaVisita || '';
    }

    totalPuntos += visita.indicadores.totalPuntos || 0;
    totalPuntosConNovedad += visita.indicadores.puntosConNovedad || 0;
    totalPuntosSinActividad += visita.indicadores.puntosSinActividad || 0;
  });

  var porcentajeGeneralSinActividad = totalPuntos > 0
    ? Math.round((totalPuntosSinActividad / totalPuntos) * 100)
    : null;

  return {
    totalVisitas: visitas.length,
    ultimaVisita: ultimaVisita,
    totalPuntos: totalPuntos,
    totalPuntosConNovedad: totalPuntosConNovedad,
    porcentajeGeneralSinActividad: porcentajeGeneralSinActividad,
    documentosDisponibles: documentos.length
  };
}

function normalizarTextoPanelCliente_(texto) {
  return String(texto || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function obtenerFechaOrdenPortal_(fecha) {
  if (!fecha) return 0;

  if (Object.prototype.toString.call(fecha) === '[object Date]') {
    return fecha.getTime();
  }

  var texto = String(fecha).trim();

  var fechaIso = new Date(texto);
  if (!isNaN(fechaIso.getTime())) {
    return fechaIso.getTime();
  }

  var partes = texto.split(/[\/\-]/);
  if (partes.length === 3) {
    var dia = Number(partes[0]);
    var mes = Number(partes[1]) - 1;
    var anio = Number(partes[2]);

    if (anio < 100) anio += 2000;

    var fechaManual = new Date(anio, mes, dia);
    if (!isNaN(fechaManual.getTime())) {
      return fechaManual.getTime();
    }
  }

  return 0;
}