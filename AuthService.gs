function loginCliente(cuit, email, clave) {
  const cuitLimpio = normalizarTexto_(cuit);
  const emailLimpio = normalizarClave_(email);
  const claveLimpia = normalizarTexto_(clave);

  if (!cuitLimpio || !emailLimpio || !claveLimpia) {
    registrarLog(emailLimpio, '', 'LOGIN_CLIENTE', 'ERROR', 'Parametros vacios');
    return { ok: false, mensaje: 'Completa CUIT, email y clave.' };
  }

  try {
    const hojaUsuarios = obtenerHojaPortal_(PORTAL_CONFIG.HOJAS.USUARIOS);
    const usuarios = leerFilasPorHeaders_(hojaUsuarios);
    const hash = hashClave_(claveLimpia);

    const usuario = usuarios.find(function(row) {
      return normalizarTexto_(row.CUIT) === cuitLimpio &&
        normalizarClave_(row.EMAIL) === emailLimpio &&
        normalizarTexto_(row.CLAVE_HASH) === hash &&
        esSi_(row.ACTIVO);
    });

    if (!usuario) {
      registrarLog(emailLimpio, '', 'LOGIN_CLIENTE', 'ERROR', 'Credenciales invalidas o usuario inactivo');
      return { ok: false, mensaje: 'Credenciales invalidas o usuario inactivo.' };
    }

    const cliente = obtenerClientePortalPorId_(usuario.ID_PORTAL_CLIENTE);
    if (!cliente || !esSi_(cliente.ACTIVO)) {
      registrarLog(emailLimpio, usuario.ID_PORTAL_CLIENTE, 'LOGIN_CLIENTE', 'ERROR', 'Cliente inactivo o inexistente');
      return { ok: false, mensaje: 'Cliente inactivo o no disponible.' };
    }

    const token = crearSesionCliente_(usuario.ID_PORTAL_CLIENTE, emailLimpio);
    registrarLog(emailLimpio, usuario.ID_PORTAL_CLIENTE, 'LOGIN_CLIENTE', 'OK', 'Acceso correcto');
    return {
      ok: true,
      cliente: {
        idPortalCliente: normalizarTexto_(usuario.ID_PORTAL_CLIENTE),
        cuit: normalizarTexto_(cliente.CUIT),
        razonSocial: normalizarTexto_(cliente.RAZON_SOCIAL),
        nombreFantasia: normalizarTexto_(cliente.NOMBRE_FANTASIA),
        email: emailLimpio,
        nombreUsuario: normalizarTexto_(usuario.NOMBRE),
        token: token
      }
    };
  } catch (error) {
    registrarLog(emailLimpio, '', 'LOGIN_CLIENTE', 'ERROR', error.message);
    return { ok: false, mensaje: 'No se pudo iniciar sesion. Detalle: ' + error.message };
  }
}

function obtenerClientePortalPorId_(idPortalCliente) {
  const id = normalizarTexto_(idPortalCliente);
  if (!id) return null;

  const hojaClientes = obtenerHojaPortal_(PORTAL_CONFIG.HOJAS.CLIENTES);
  const clientes = leerFilasPorHeaders_(hojaClientes);
  return clientes.find(function(row) {
    return normalizarTexto_(row.ID_PORTAL_CLIENTE) === id;
  }) || null;
}

function hashClave_(clave) {
  const bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    String(clave || ''),
    Utilities.Charset.UTF_8
  );

  return bytes.map(function(byte) {
    const value = byte < 0 ? byte + 256 : byte;
    return ('0' + value.toString(16)).slice(-2);
  }).join('');
}

function crearSesionCliente_(idPortalCliente, email) {
  const token = Utilities.getUuid();
  const payload = JSON.stringify({
    idPortalCliente: normalizarTexto_(idPortalCliente),
    email: normalizarClave_(email),
    fecha: new Date().toISOString()
  });
  CacheService.getScriptCache().put(token, payload, PORTAL_CONFIG.SESSION_TTL_SECONDS);
  return token;
}

function validarSesionCliente_(idPortalCliente, token) {
  const id = normalizarTexto_(idPortalCliente);
  const tokenLimpio = normalizarTexto_(token);
  if (!id || !tokenLimpio) return false;

  const raw = CacheService.getScriptCache().get(tokenLimpio);
  if (!raw) return false;

  try {
    const session = JSON.parse(raw);
    return normalizarTexto_(session.idPortalCliente) === id;
  } catch (error) {
    return false;
  }
}
