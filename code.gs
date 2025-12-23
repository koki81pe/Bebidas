/*
***********************************************
Bebidas a Pedido - code.gs - V1.06
23/12/2024 - 16:30
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
// 04. Obtener Lista de Licores - code.gs - V1.02-SV01
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
        saldoInicial: row[5] || 0,  // Columna F - Stock disponible
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
// 05. Guardar Pedido - code.gs - V1.03-SV01
// ***********************************************

function guardarPedido(cliente, telefono, productos) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheetPedidos = ss.getSheetByName(SHEET_PEDIDOS);
    const sheetLicores = ss.getSheetByName(SHEET_LICORES);
    
    if (!sheetPedidos || !sheetLicores) {
      console.error('No se encontraron las hojas necesarias');
      return { success: false, message: 'Error de configuración de hojas' };
    }
    
    // Generar ID de pedido
    const pedidoId = generarIdPedido();
    const fecha = Utilities.formatDate(new Date(), 'America/Lima', 'dd/MM/yyyy HH:mm:ss');
    
    // Preparar datos para insertar en Pedidos
    const rows = productos.map(prod => [
      cliente,           // A: Cliente
      telefono,          // B: Fono
      prod.code,         // C: Code
      prod.producto,     // D: Producto
      prod.empaque,      // E: Empaque
      prod.size,         // F: Size
      prod.precio,       // G: Precio
      Number(prod.cantidad),  // H: Cantidad (forzar como número)
      fecha,             // I: Fecha
      pedidoId,          // J: Pedido
      'Pendiente'        // K: Estado
    ]);
    
    // Insertar todas las filas del pedido
    if (rows.length > 0) {
      sheetPedidos.getRange(sheetPedidos.getLastRow() + 1, 1, rows.length, 11).setValues(rows);
    }
    
    // Actualizar CantReq (Col H) en hoja Licores
    const dataLicores = sheetLicores.getDataRange().getValues();
    productos.forEach(prod => {
      for (let i = 1; i < dataLicores.length; i++) {
        if (dataLicores[i][0] === prod.code) { // Columna A: Code
          const filaLicor = i + 1;
          const cantReqActual = parseInt(dataLicores[i][7]) || 0; // Columna H: CantReq (índice 7)
          const nuevaCantReq = cantReqActual + prod.cantidad;
          sheetLicores.getRange(filaLicor, 8).setValue(nuevaCantReq); // Actualizar Col H
          console.log(`Actualizado ${prod.code}: CantReq = ${nuevaCantReq} (+${prod.cantidad})`);
          break;
        }
      }
    });
    
    console.log('Pedido guardado: ' + pedidoId + ' - Cliente: ' + cliente + ' - Tel: ' + telefono + ' - Productos: ' + productos.length);
    
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
// 06. Generar ID de Pedido - code.gs - V1.02-SV01
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
      .map(row => row[9]) // Columna J: Pedido (índice 9)
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
// 08. Obtener Pedidos - code.gs - V1.02-SV01
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
      .filter(row => row[9]) // Filtrar por columna J: Pedido (índice 9)
      .map(row => {
        // Formatear fecha - aceptar cualquier formato
        let fechaFormateada = '';
        try {
          if (row[8]) { // Columna I: Fecha
            if (row[8] instanceof Date) {
              fechaFormateada = Utilities.formatDate(row[8], 'America/Lima', 'dd/MM/yyyy HH:mm');
            } else {
              fechaFormateada = row[8].toString();
            }
          }
        } catch (e) {
          fechaFormateada = row[8] ? row[8].toString() : '';
        }
        
        return {
          cliente: row[0] || '',      // A: Cliente
          telefono: row[1] || '',     // B: Fono
          code: row[2] || '',         // C: Code
          producto: row[3] || '',     // D: Producto
          empaque: row[4] || '',      // E: Empaque
          size: row[5] || '',         // F: Size
          precio: parseFloat(row[6]) || 0,  // G: Precio
          cantidad: parseInt(row[7]) || 1,  // H: Cantidad
          fecha: fechaFormateada,     // I: Fecha
          pedidoId: row[9] || '',     // J: Pedido
          estado: row[10] || 'Pendiente'  // K: Estado
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
          telefono: item.telefono,
          fecha: item.fecha,
          estado: item.estado,
          productos: [],
          total: 0
        };
      }
      
      pedidosAgrupados[item.pedidoId].productos.push({
        code: item.code,
        producto: item.producto,
        empaque: item.empaque,
        size: item.size,
        precio: item.precio,
        cantidad: item.cantidad
      });
      
      pedidosAgrupados[item.pedidoId].total += item.precio * item.cantidad;
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

// ***********************************************
// 09. Marcar Pedido como Pagado - code.gs - V1.03-SV01
// ***********************************************

function marcarPagado(pedidoId) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheetPedidos = ss.getSheetByName(SHEET_PEDIDOS);
    const sheetLicores = ss.getSheetByName(SHEET_LICORES);
    
    if (!sheetPedidos || !sheetLicores) {
      console.error('No se encontraron las hojas necesarias');
      return { success: false, message: 'Error de configuración de hojas' };
    }
    
    const dataPedidos = sheetPedidos.getDataRange().getValues();
    const dataLicores = sheetLicores.getDataRange().getValues();
    
    // Buscar todas las filas del pedido
    const filasPedido = [];
    for (let i = 1; i < dataPedidos.length; i++) {
      if (dataPedidos[i][9] === pedidoId) { // Columna J: Pedido
        filasPedido.push({
          fila: i + 1,
          code: dataPedidos[i][2],      // C: Code
          cantidad: parseInt(dataPedidos[i][7]) || 1  // H: Cantidad
        });
      }
    }
    
    if (filasPedido.length === 0) {
      return { success: false, message: 'No se encontró el pedido' };
    }
    
    // Actualizar estado a "Pagado" en hoja Pedidos
    filasPedido.forEach(item => {
      sheetPedidos.getRange(item.fila, 11).setValue('Pagado'); // Columna K: Estado
    });
    
    // Actualizar CantReq (Col H) y CantVendida (Col I) en hoja Licores
    filasPedido.forEach(pedidoItem => {
      for (let i = 1; i < dataLicores.length; i++) {
        if (dataLicores[i][0] === pedidoItem.code) { // Columna A: Code
          const filaLicor = i + 1;
          
          // Restar de CantReq (Col H)
          const cantReqActual = parseInt(dataLicores[i][7]) || 0; // Columna H: CantReq (índice 7)
          const nuevaCantReq = Math.max(0, cantReqActual - pedidoItem.cantidad); // No permitir negativos
          sheetLicores.getRange(filaLicor, 8).setValue(nuevaCantReq);
          
          // Sumar a CantVendida (Col I)
          const cantVendidaActual = parseInt(dataLicores[i][8]) || 0; // Columna I: CantVendida (índice 8)
          const nuevaCantVendida = cantVendidaActual + pedidoItem.cantidad;
          sheetLicores.getRange(filaLicor, 9).setValue(nuevaCantVendida);
          
          console.log(`Actualizado ${pedidoItem.code}: CantReq=${nuevaCantReq} (-${pedidoItem.cantidad}), CantVendida=${nuevaCantVendida} (+${pedidoItem.cantidad})`);
          break;
        }
      }
    });
    
    console.log('Pedido ' + pedidoId + ' marcado como Pagado - ' + filasPedido.length + ' productos actualizados');
    
    return {
      success: true,
      message: 'Pedido marcado como Pagado',
      productosActualizados: filasPedido.length
    };
    
  } catch (error) {
    console.error('Error en marcarPagado: ' + error.toString());
    console.error('Stack trace: ' + error.stack);
    return { success: false, message: 'Error al marcar pedido: ' + error.toString() };
  }
}
