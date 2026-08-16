function abrirPortalSS_() {
  return SpreadsheetApp.openById(PORTAL_CONFIG.SPREADSHEET_ID);
}

function crearHojaPortalSiNoExiste_(ss, nombreHoja, headers) {
  validarNombreHojaPortal_(nombreHoja);
  let hoja = ss.getSheetByName(nombreHoja);
  if (!hoja) hoja = ss.insertSheet(nombreHoja);

  if (hoja.getLastRow() === 0 && headers && headers.length) {
    hoja.getRange(1, 1, 1, headers.length).setValues([headers]);
    hoja.setFrozenRows(1);
  }

  return hoja;
}

function obtenerHojaPortal_(nombreHoja) {
  validarNombreHojaPortal_(nombreHoja);
  const hoja = abrirPortalSS_().getSheetByName(nombreHoja);
  if (!hoja) throw new Error('No existe la hoja ' + nombreHoja + '. Ejecuta instalarPortalClientesV1().');
  return hoja;
}

function validarNombreHojaPortal_(nombreHoja) {
  if (String(nombreHoja || '').indexOf('PORTAL_') !== 0) {
    throw new Error('Operacion bloqueada: solo se permite usar hojas con prefijo PORTAL_.');
  }
}

function leerFilasPorHeaders_(hoja) {
  const lastRow = hoja.getLastRow();
  const lastCol = hoja.getLastColumn();
  if (lastRow < 2 || lastCol === 0) return [];

  const headers = hoja.getRange(1, 1, 1, lastCol).getValues()[0].map(function(header) {
    return String(header || '').trim();
  });
  const values = hoja.getRange(2, 1, lastRow - 1, lastCol).getValues();

  return values.map(function(fila, index) {
    const obj = { rowNumber: index + 2 };
    headers.forEach(function(header, col) {
      if (header) obj[header] = fila[col];
    });
    return obj;
  });
}

function appendPortalRow_(nombreHoja, data) {
  return appendPortalRows_(nombreHoja, [data]);
}

function appendPortalRowConIdUnico_(nombreHoja, idHeader, data) {
  validarNombreHojaPortal_(nombreHoja);
  const headerId = normalizarTexto_(idHeader);
  const id = normalizarTexto_(data && data[headerId]);
  if (!headerId || !id) throw new Error('Falta el identificador requerido para guardar el registro.');

  return ejecutarConBloqueoPortal_(function() {
    const hoja = obtenerHojaPortal_(nombreHoja);
    const headers = hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0].map(function(header) {
      return normalizarTexto_(header);
    });
    const idCol = headers.indexOf(headerId) + 1;
    if (!idCol) throw new Error('No existe la columna ' + headerId + ' en ' + nombreHoja + '.');

    if (hoja.getLastRow() >= 2) {
      const coincidencia = hoja
        .getRange(2, idCol, hoja.getLastRow() - 1, 1)
        .createTextFinder(id)
        .matchEntireCell(true)
        .findNext();
      if (coincidencia) throw new Error('Ya existe un registro con ' + headerId + ': ' + id);
    }

    return appendPortalRowsEnHojaSinLock_(hoja, [data]);
  });
}

function appendPortalRows_(nombreHoja, filas) {
  validarNombreHojaPortal_(nombreHoja);
  const datos = Array.isArray(filas) ? filas.filter(Boolean) : [];
  if (!datos.length) return { firstRow: 0, count: 0 };

  return ejecutarConBloqueoPortal_(function() {
    const hoja = obtenerHojaPortal_(nombreHoja);
    return appendPortalRowsEnHojaSinLock_(hoja, datos);
  });
}

function appendPortalRowsEnHojaSinLock_(hoja, filas) {
  const datos = Array.isArray(filas) ? filas.filter(Boolean) : [];
  if (!datos.length) return { firstRow: 0, count: 0 };

  const headers = hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0].map(function(header) {
    return String(header || '').trim();
  });
  if (!headers.length) throw new Error('La hoja ' + hoja.getName() + ' no tiene encabezados.');

  const valores = datos.map(function(data) {
    return headers.map(function(header) {
      return data[header] === undefined ? '' : data[header];
    });
  });
  const firstRow = hoja.getLastRow() + 1;
  const ultimaFilaNecesaria = firstRow + valores.length - 1;
  if (ultimaFilaNecesaria > hoja.getMaxRows()) {
    hoja.insertRowsAfter(hoja.getMaxRows(), ultimaFilaNecesaria - hoja.getMaxRows());
  }
  hoja.getRange(firstRow, 1, valores.length, headers.length).setValues(valores);
  return { firstRow: firstRow, count: valores.length };
}

function limpiarFilasPortalAgregadas_(hoja, escritura) {
  if (!hoja || !escritura || !escritura.firstRow || !escritura.count) return;
  hoja.getRange(escritura.firstRow, 1, escritura.count, hoja.getLastColumn()).clearContent();
}

function ejecutarConBloqueoPortal_(callback) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    return callback();
  } finally {
    lock.releaseLock();
  }
}

function generarId_(prefijo) {
  return prefijo + '-' + Utilities.getUuid().slice(0, 8).toUpperCase();
}

function formatearFecha_(valor) {
  if (!valor) return '';
  if (Object.prototype.toString.call(valor) === '[object Date]') {
    return Utilities.formatDate(valor, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm');
  }
  return String(valor);
}

function normalizarTexto_(valor) {
  return String(valor || '').trim();
}

function normalizarClave_(valor) {
  return normalizarTexto_(valor).toLowerCase();
}

function esSi_(valor) {
  return String(valor || '').trim().toUpperCase() === 'SI';
}
