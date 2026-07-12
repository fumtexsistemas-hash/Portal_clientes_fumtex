function doGet(e) {
  const params = e && e.parameter ? e.parameter : {};
  const app = String(params.app || '').toLowerCase();
  const modo = String(params.modo || '').toLowerCase();
  const templateName = app === 'admin'
    ? (modo === 'mobile' ? 'AdminMobile' : 'Admin')
    : 'Cliente';

  return HtmlService
    .createTemplateFromFile(templateName)
    .evaluate()
    .setTitle(PORTAL_CONFIG.APP_NAME)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function instalarPortalClientesV1(adminToken) {
  const usuario = validarAdminToken_(adminToken);
  const ss = abrirPortalSS_();
  Object.keys(PORTAL_CONFIG.HOJAS).forEach(function(key) {
    const nombreHoja = PORTAL_CONFIG.HOJAS[key];
    const headers = PORTAL_CONFIG.HEADERS[nombreHoja];
    crearHojaPortalSiNoExiste_(ss, nombreHoja, headers);
  });

  registrarLog('', '', 'INSTALAR_PORTAL_CLIENTES_V1', 'OK', usuario + ' - Instalacion/verificacion de hojas PORTAL_');
  return {
    ok: true,
    mensaje: 'Portal Clientes v1.0 instalado. Solo se crearon/verificaron hojas PORTAL_.',
    hojas: Object.keys(PORTAL_CONFIG.HOJAS).map(function(key) {
      return PORTAL_CONFIG.HOJAS[key];
    })
  };
}
