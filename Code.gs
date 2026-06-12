function doGet(e) {
  const app = e && e.parameter ? String(e.parameter.app || '').toLowerCase() : '';
  const templateName = app === 'admin'
    ? 'Admin'
    : (app === 'cliente' ? 'Cliente' : 'Login');

  return HtmlService
    .createTemplateFromFile(templateName)
    .evaluate()
    .setTitle(PORTAL_CONFIG.APP_NAME)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function instalarPortalClientesV1() {
  validarAdminPortal_();
  const ss = abrirPortalSS_();
  Object.keys(PORTAL_CONFIG.HOJAS).forEach(function(key) {
    const nombreHoja = PORTAL_CONFIG.HOJAS[key];
    const headers = PORTAL_CONFIG.HEADERS[nombreHoja];
    crearHojaPortalSiNoExiste_(ss, nombreHoja, headers);
  });

  registrarLog('', '', 'INSTALAR_PORTAL_CLIENTES_V1', 'OK', 'Instalacion/verificacion de hojas PORTAL_');
  return {
    ok: true,
    mensaje: 'Portal Clientes v1.0 instalado. Solo se crearon/verificaron hojas PORTAL_.',
    hojas: Object.keys(PORTAL_CONFIG.HOJAS).map(function(key) {
      return PORTAL_CONFIG.HOJAS[key];
    })
  };
}
