/*
***********************************************
Bebidas a Pedido - code.gs - V1.01
22/12/2024 - 10:30
***********************************************
*/

// ***********************************************
// 01. Configuración Global - code.gs - V1.01-SV01
// ***********************************************

const SHEET_ID = '1i2sy3pov9zI3pBJiwGJl070nDmFd_zwfq9Oxv3Gw5MI';
const SHEET_LICORES = 'Licores';
const SHEET_PEDIDOS = 'Pedidos';
const SHEET_ADMIN = 'admin';

// ***********************************************
// 02. Función Principal - code.gs - V1.01-SV01
// ***********************************************

function doGet() {
  return HtmlService.createTemplateFromFile('home')
    .evaluate()
    .setTitle('Bebidas a Pedido')
    .setFaviconUrl('https://img.icons8.com/color/48/000000/whiskey.png')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
}

// ***********************************************
// 03. Incluir Archivos HTML - code.gs - V1.01-SV01
// ***********************************************

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// ***********************************************
// 04. Obtener Lista de Licores - code.gs - V1.01-SV01
// ***********************************************

function getLicores() {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(SHEET_LICORES);
    
    if (!sheet) {
      console.error('No se encontró la hoja: ' + SHEET_LICORES);
      return { success: false, message: 'No se encontró la hoja de Licores' };
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1);
    
    // Filtrar filas vacías
    const licores = rows
      .filter(row => row[1]) // Filtrar por columna Producto (índice 1)
      .map(row => ({
        code: row[0] || '',
        producto: row[1] || '',
        empaque: row[2] || '',
        size: row[3] || '',
        sugerido: row[4] || 0,
        cantidad: row[5] || 0,
        precio: row[6] || 0
      }));
    
    console.log('Licores obtenidos: ' + licores.length);
    return { success: true, data: licores };
    
  } catch (error) {
    console.error('Error en getLicores: ' + error.toString());
    return { success: false, message: 'Error al obtener licores: ' + error.toString() };
  }
}

// ***********************************************
// 05. Guardar Pedido - code.gs - V1.01-SV01
// ***********************************************

function guardarPedido(cliente, productos) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(SHEET_PEDIDOS);
    
    if (!sheet) {
      console.error('No se encontró la hoja: ' + SHEET_PEDIDOS);
      return { success: false, message: 'No se encontró la hoja de Pedidos' };
    }
    
    // Generar ID de pedido
    const pedidoId = generarIdPedido();
    const fecha = Utilities.formatDate(new Date(), 'America/Lima', 'dd/MM/yyyy HH:mm:ss');
    
    // Preparar datos para insertar
    const rows = productos.map(prod => [
      cliente,           // Cliente
      prod.code,         // Code
      prod.producto,     // Producto
      prod.empaque,      // Empaque
      prod.size,         // Size
      prod.precio,       // Precio
      fecha,             // Fecha
      pedidoId           // Pedido
    ]);
    
    // Insertar todas las filas del pedido
    if (rows.length > 0) {
      sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, 8).setValues(rows);
    }
    
    console.log('Pedido guardado: ' + pedidoId + ' - Cliente: ' + cliente + ' - Productos: ' + productos.length);
    
    return { 
      success: true, 
      message: 'Pedido registrado exitosamente',
      pedidoId: pedidoId
    };
    
  } catch (error) {
    console.error('Error en guardarPedido: ' + error.toString());
    return { success: false, message: 'Error al guardar pedido: ' + error.toString() };
  }
}

// ***********************************************
// 06. Generar ID de Pedido - code.gs - V1.01-SV01
// ***********************************************

function generarIdPedido() {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(SHEET_PEDIDOS);
    
    // Obtener fecha actual en formato YYYYMMDD
    const fecha = Utilities.formatDate(new Date(), 'America/Lima', 'yyyyMMdd');
    
    // Buscar el último pedido del día
    const data = sheet.getDataRange().getValues();
    const pedidosHoy = data
      .slice(1) // Saltar encabezados
      .map(row => row[7]) // Columna Pedido (índice 7)
      .filter(pedido => pedido && pedido.toString().includes('PED-' + fecha));
    
    // Calcular el siguiente número
    let numero = 1;
    if (pedidosHoy.length > 0) {
      const numeros = pedidosHoy.map(pedido => {
        const partes = pedido.toString().split('-');
        return parseInt(partes[2]) || 0;
      });
      numero = Math.max(...numeros) + 1;
    }
    
    // Formatear con ceros a la izquierda (3 dígitos)
    const numeroFormateado = numero.toString().padStart(3, '0');
    
    const pedidoId = `PED-${fecha}-${numeroFormateado}`;
    console.log('ID generado: ' + pedidoId);
    
    return pedidoId;
    
  } catch (error) {
    console.error('Error en generarIdPedido: ' + error.toString());
    // En caso de error, generar un ID básico con timestamp
    const timestamp = new Date().getTime();
    return `PED-${timestamp}`;
  }
}

// ***********************************************
// 07. Verificar Acceso Admin - code.gs - V1.01-SV01
// ***********************************************

function verificarAcceso(usuario) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(SHEET_ADMIN);
    
    if (!sheet) {
      console.error('No se encontró la hoja: ' + SHEET_ADMIN);
      return { success: false, message: 'Error de configuración' };
    }
    
    const data = sheet.getDataRange().getValues();
    const usuarios = data.slice(1).map(row => row[0].toString().toLowerCase());
    
    const usuarioIngresado = usuario.toString().toLowerCase().trim();
    const encontrado = usuarios.includes(usuarioIngresado);
    
    console.log('Verificación de acceso - Usuario: ' + usuario + ' - Resultado: ' + encontrado);
    
    return { 
      success: encontrado,
      message: encontrado ? 'Acceso concedido' : 'Usuario no autorizado'
    };
    
  } catch (error) {
    console.error('Error en verificarAcceso: ' + error.toString());
    return { success: false, message: 'Error al verificar acceso' };
  }
}

// ***********************************************
// 08. Obtener Pedidos - code.gs - V1.01-SV02
// ***********************************************

function getPedidos() {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(SHEET_PEDIDOS);
    
    if (!sheet) {
      console.error('No se encontró la hoja: ' + SHEET_PEDIDOS);
      return { success: false, message: 'No se encontró la hoja de Pedidos' };
    }
    
    const data = sheet.getDataRange().getValues();
    const rows = data.slice(1); // Saltar encabezados
    
    console.log('Total de filas en Pedidos: ' + rows.length);
    
    // Filtrar filas vacías y mapear datos
    const pedidos = rows
      .filter(row => row[7]) // Filtrar por columna Pedido (índice 7)
      .map(row => {
        // Formatear fecha - aceptar cualquier formato
        let fechaFormateada = '';
        try {
          if (row[6]) {
            if (row[6] instanceof Date) {
              fechaFormateada = Utilities.formatDate(row[6], 'America/Lima', 'dd/MM/yyyy HH:mm');
            } else {
              fechaFormateada = row[6].toString();
            }
          }
        } catch (e) {
          fechaFormateada = row[6] ? row[6].toString() : '';
        }
        
        return {
          cliente: row[0] || '',
          code: row[1] || '',
          producto: row[2] || '',
          empaque: row[3] || '',
          size: row[4] || '',
          precio: parseFloat(row[5]) || 0,
          fecha: fechaFormateada,
          pedidoId: row[7] || ''
        };
      });
    
    console.log('Pedidos filtrados: ' + pedidos.length);
    
    // Agrupar por pedidoId
    const pedidosAgrupados = {};
    pedidos.forEach(item => {
      if (!pedidosAgrupados[item.pedidoId]) {
        pedidosAgrupados[item.pedidoId] = {
          pedidoId: item.pedidoId,
          cliente: item.cliente,
          fecha: item.fecha,
          productos: [],
          total: 0
        };
      }
      
      pedidosAgrupados[item.pedidoId].productos.push({
        code: item.code,
        producto: item.producto,
        empaque: item.empaque,
        size: item.size,
        precio: item.precio
      });
      
      pedidosAgrupados[item.pedidoId].total += item.precio;
    });
    
    // Convertir a array y ordenar por pedidoId (más antiguos primero)
    const pedidosArray = Object.values(pedidosAgrupados).sort((a, b) => {
      return a.pedidoId.localeCompare(b.pedidoId);
    });
    
    console.log('Pedidos agrupados: ' + pedidosArray.length);
    return { success: true, data: pedidosArray };
    
  } catch (error) {
    console.error('Error en getPedidos: ' + error.toString());
    console.error('Stack trace: ' + error.stack);
    return { success: false, message: 'Error al obtener pedidos: ' + error.toString() };
  }
}
