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
  validarNombreHojaPortal_(nombreHoja);
  const hoja = obtenerHojaPortal_(nombreHoja);
  const headers = hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0].map(function(header) {
    return String(header || '').trim();
  });
  const fila = headers.map(function(header) {
    return data[header] === undefined ? '' : data[header];
  });
  hoja.appendRow(fila);
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
