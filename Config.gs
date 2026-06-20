const PORTAL_CONFIG = {
  APP_NAME: 'Portal Clientes v1.0',
  EMPRESA: 'FUMTEX',
  SPREADSHEET_ID: '1zEao5gwzoJ_tVd0T1SBH_Af2rjJaPYdKd8gWkmaXr6k',
  SESSION_TTL_SECONDS: 6 * 60 * 60,
  ADMIN_EMAILS: [
    'federicorasso@gmail.com',
    'fumtexservicios@gmail.com'
  ],
  HOJAS: {
    CLIENTES: 'PORTAL_CLIENTES',
    USUARIOS: 'PORTAL_USUARIOS',
    PUBLICACIONES: 'PORTAL_PUBLICACIONES',
    MONITOREOS: 'PORTAL_MONITOREOS',
    DOCUMENTOS: 'PORTAL_DOCUMENTOS',
    OPCIONES: 'PORTAL_OPCIONES',
    PUNTOS_CLIENTE: 'PORTAL_PUNTOS_CLIENTE',
    LOG: 'PORTAL_LOG'
  },
  HEADERS: {
    PORTAL_CLIENTES: [
      'ID_PORTAL_CLIENTE',
      'ID_CLIENTE_ORIGEN',
      'CUIT',
      'RAZON_SOCIAL',
      'NOMBRE_FANTASIA',
      'EMAIL_PRINCIPAL',
      'TELEFONO',
      'DIRECCION',
      'CARPETA_DRIVE_ID',
      'ACTIVO',
      'FECHA_ALTA',
      'OBSERVACIONES'
    ],
    PORTAL_USUARIOS: [
      'ID_USUARIO',
      'ID_PORTAL_CLIENTE',
      'CUIT',
      'EMAIL',
      'CLAVE_HASH',
      'NOMBRE',
      'ROL',
      'ACTIVO',
      'FECHA_ALTA',
      'ULTIMO_ACCESO'
    ],
    PORTAL_PUBLICACIONES: [
      'ID_PUBLICACION',
      'ID_PORTAL_CLIENTE',
      'ID_VISITA_ORIGEN',
      'FECHA_VISITA',
      'SUCURSAL',
      'TIPO_SERVICIO',
      'TITULO',
      'CATEGORIA',
      'ESTADO_PUBLICACION',
      'RESUMEN_CLIENTE',
      'CONTENIDO',
      'VISIBLE',
      'FECHA_CARGA',
      'FECHA_PUBLICACION',
      'USUARIO_CARGA'
    ],
    PORTAL_MONITOREOS: [
      'ID_MONITOREO',
      'ID_PUBLICACION',
      'ID_PORTAL_CLIENTE',
      'FECHA',
      'SECTOR',
      'PUNTO_CONTROL',
      'TIPO',
      'RESULTADO',
      'NOVEDAD',
      'ACCION_CORRECTIVA',
      'OBSERVACIONES',
      'VISIBLE',
      'FECHA_CARGA',
      'USUARIO_CARGA'
    ],
    PORTAL_DOCUMENTOS: [
      'ID_DOCUMENTO',
      'ID_PORTAL_CLIENTE',
      'ID_PUBLICACION',
      'TITULO',
      'TIPO',
      'URL',
      'CARPETA_DRIVE_ID',
      'DESCRIPCION',
      'VISIBLE',
      'FECHA_CARGA',
      'USUARIO_CARGA'
    ],
    PORTAL_OPCIONES: [
      'ID_OPCION',
      'GRUPO',
      'VALOR',
      'ETIQUETA',
      'ACTIVO',
      'ORDEN',
      'OBSERVACIONES'
    ],
    PORTAL_PUNTOS_CLIENTE: [
      'ID_PUNTO_CLIENTE',
      'ID_PORTAL_CLIENTE',
      'SECTOR',
      'PUNTO_CONTROL',
      'TIPO_PUNTO',
      'RESULTADO_DEFAULT',
      'ACCION_CORRECTIVA_DEFAULT',
      'ACTIVO',
      'ORDEN',
      'OBSERVACIONES',
      'FECHA_ALTA',
      'USUARIO_CARGA'
    ],
    PORTAL_LOG: [
      'ID_LOG',
      'FECHA_HORA',
      'EMAIL',
      'ID_PORTAL_CLIENTE',
      'ACCION',
      'RESULTADO',
      'DETALLE'
    ]
  }
};
