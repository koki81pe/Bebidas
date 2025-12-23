/*
***********************************************
Bebidas a Pedido - testall.gs - V1.03
23/12/2024 - 15:10
***********************************************
*/

// ***********************************************
// 01. Función Principal de Testing - testall.gs - V1.01-SV01
// ***********************************************

function testAll() {
  console.log('='.repeat(60));
  console.log('INICIANDO BATERÍA COMPLETA DE PRUEBAS - BEBIDAS A PEDIDO');
  console.log('='.repeat(60));
  console.log('');
  
  const resultados = {
    total: 0,
    exitosos: 0,
    fallidos: 0,
    tests: []
  };
  
  // Ejecutar todas las pruebas
  ejecutarTest(resultados, 'Autorización Inicial', testAutorizacion);
  ejecutarTest(resultados, 'Conexión al Sheet', testConexionSheet);
  ejecutarTest(resultados, 'Lectura de Licores', testLeerLicores);
  ejecutarTest(resultados, 'Verificación de Admin', testVerificarAdmin);
  ejecutarTest(resultados, 'Generación de ID Pedido', testGenerarIdPedido);
  ejecutarTest(resultados, 'Guardado de Pedido', testGuardarPedido);
  ejecutarTest(resultados, 'Lectura de Pedidos', testLeerPedidos);
  ejecutarTest(resultados, 'Marcar Pagado', testMarcarPagado);
  
  // Mostrar resumen
  console.log('');
  console.log('='.repeat(60));
  console.log('RESUMEN DE PRUEBAS');
  console.log('='.repeat(60));
  console.log(`Total de pruebas: ${resultados.total}`);
  console.log(`Exitosas: ${resultados.exitosos} ✓`);
  console.log(`Fallidas: ${resultados.fallidos} ✗`);
  console.log('');
  
  resultados.tests.forEach(test => {
    const icono = test.exito ? '✓' : '✗';
    console.log(`${icono} ${test.nombre}: ${test.mensaje}`);
  });
  
  console.log('');
  console.log('='.repeat(60));
  
  if (resultados.fallidos === 0) {
    console.log('¡TODAS LAS PRUEBAS PASARON EXITOSAMENTE! 🎉');
  } else {
    console.log('ALGUNAS PRUEBAS FALLARON. REVISA LOS DETALLES ARRIBA. ⚠️');
  }
  console.log('='.repeat(60));
  
  return resultados;
}

// ***********************************************
// 02. Función Ejecutar Test - testall.gs - V1.01-SV01
// ***********************************************

function ejecutarTest(resultados, nombreTest, funcionTest) {
  resultados.total++;
  console.log(`\n▶ Ejecutando: ${nombreTest}...`);
  console.log('-'.repeat(60));
  
  try {
    const resultado = funcionTest();
    
    if (resultado.success) {
      resultados.exitosos++;
      resultados.tests.push({
        nombre: nombreTest,
        exito: true,
        mensaje: resultado.mensaje || 'OK'
      });
      console.log(`✓ ${nombreTest}: EXITOSO`);
      if (resultado.detalles) {
        console.log(`  Detalles: ${resultado.detalles}`);
      }
    } else {
      resultados.fallidos++;
      resultados.tests.push({
        nombre: nombreTest,
        exito: false,
        mensaje: resultado.mensaje || 'Error desconocido'
      });
      console.log(`✗ ${nombreTest}: FALLIDO`);
      console.log(`  Error: ${resultado.mensaje}`);
    }
  } catch (error) {
    resultados.fallidos++;
    resultados.tests.push({
      nombre: nombreTest,
      exito: false,
      mensaje: error.toString()
    });
    console.log(`✗ ${nombreTest}: EXCEPCIÓN`);
    console.log(`  Error: ${error.toString()}`);
  }
}

// ***********************************************
// 03. Test: Autorización Inicial - testall.gs - V1.01-SV01
// ***********************************************

function testAutorizacion() {
  try {
    // Forzar autorización accediendo a servicios que requieren permisos
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const nombre = ss.getName();
    
    return {
      success: true,
      mensaje: 'Autorización concedida',
      detalles: `Sheet: "${nombre}"`
    };
  } catch (error) {
    return {
      success: false,
      mensaje: `Error de autorización: ${error.toString()}`
    };
  }
}

// ***********************************************
// 04. Test: Conexión al Sheet - testall.gs - V1.01-SV01
// ***********************************************

function testConexionSheet() {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const hojas = ss.getSheets().map(h => h.getName());
    
    // Verificar que existan las hojas necesarias
    const hojasRequeridas = [SHEET_LICORES, SHEET_PEDIDOS, SHEET_ADMIN];
    const hojasFaltantes = hojasRequeridas.filter(h => !hojas.includes(h));
    
    if (hojasFaltantes.length > 0) {
      return {
        success: false,
        mensaje: `Faltan hojas: ${hojasFaltantes.join(', ')}`
      };
    }
    
    return {
      success: true,
      mensaje: 'Conexión exitosa',
      detalles: `Hojas encontradas: ${hojas.join(', ')}`
    };
  } catch (error) {
    return {
      success: false,
      mensaje: `Error de conexión: ${error.toString()}`
    };
  }
}

// ***********************************************
// 05. Test: Lectura de Licores - testall.gs - V1.01-SV01
// ***********************************************

function testLeerLicores() {
  try {
    const resultado = getLicores();
    
    if (!resultado.success) {
      return {
        success: false,
        mensaje: resultado.message
      };
    }
    
    const licores = resultado.data;
    
    if (!Array.isArray(licores)) {
      return {
        success: false,
        mensaje: 'El resultado no es un array'
      };
    }
    
    if (licores.length === 0) {
      return {
        success: false,
        mensaje: 'No se encontraron licores en la hoja'
      };
    }
    
    // Verificar estructura del primer licor
    const primer = licores[0];
    const camposRequeridos = ['code', 'producto', 'empaque', 'size', 'precio'];
    const camposFaltantes = camposRequeridos.filter(campo => !(campo in primer));
    
    if (camposFaltantes.length > 0) {
      return {
        success: false,
        mensaje: `Faltan campos: ${camposFaltantes.join(', ')}`
      };
    }
    
    return {
      success: true,
      mensaje: 'Lectura exitosa',
      detalles: `${licores.length} licores encontrados. Ejemplo: ${primer.producto}`
    };
  } catch (error) {
    return {
      success: false,
      mensaje: `Error: ${error.toString()}`
    };
  }
}

// ***********************************************
// 06. Test: Verificación de Admin - testall.gs - V1.01-SV01
// ***********************************************

function testVerificarAdmin() {
  try {
    // Obtener el primer usuario admin de la hoja
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(SHEET_ADMIN);
    const data = sheet.getDataRange().getValues();
    
    if (data.length < 2) {
      return {
        success: false,
        mensaje: 'No hay usuarios en la hoja Admin'
      };
    }
    
    const usuarioTest = data[1][0]; // Primer usuario
    
    // Probar verificación exitosa
    const resultadoOK = verificarAcceso(usuarioTest);
    if (!resultadoOK.success) {
      return {
        success: false,
        mensaje: `Verificación fallida para usuario válido: ${usuarioTest}`
      };
    }
    
    // Probar verificación fallida
    const resultadoFail = verificarAcceso('usuario_inexistente_12345');
    if (resultadoFail.success) {
      return {
        success: false,
        mensaje: 'Verificación permitió usuario inválido'
      };
    }
    
    return {
      success: true,
      mensaje: 'Verificación funciona correctamente',
      detalles: `Usuario válido probado: ${usuarioTest}`
    };
  } catch (error) {
    return {
      success: false,
      mensaje: `Error: ${error.toString()}`
    };
  }
}

// ***********************************************
// 07. Test: Generación de ID Pedido - testall.gs - V1.01-SV01
// ***********************************************

function testGenerarIdPedido() {
  try {
    const pedidoId = generarIdPedido();
    
    // Verificar formato PED-YYYYMMDD-###
    const patron = /^PED-\d{8}-\d{3}$/;
    
    if (!patron.test(pedidoId)) {
      return {
        success: false,
        mensaje: `Formato incorrecto: ${pedidoId}. Esperado: PED-YYYYMMDD-###`
      };
    }
    
    // Verificar que la fecha sea de hoy
    const hoy = Utilities.formatDate(new Date(), 'America/Lima', 'yyyyMMdd');
    if (!pedidoId.includes(hoy)) {
      return {
        success: false,
        mensaje: `La fecha no corresponde al día actual. ID: ${pedidoId}`
      };
    }
    
    return {
      success: true,
      mensaje: 'Generación exitosa',
      detalles: `ID generado: ${pedidoId}`
    };
  } catch (error) {
    return {
      success: false,
      mensaje: `Error: ${error.toString()}`
    };
  }
}

// ***********************************************
// 08. Test: Guardado de Pedido - testall.gs - V1.03-SV01
// ***********************************************

function testGuardarPedido() {
  try {
    // Crear pedido de prueba con código conocido
    const codigoTest = 'TEST001';
    const productosTest = [
      {
        code: codigoTest,
        producto: 'Licor Test 1',
        empaque: 'Botella',
        size: '750ml',
        precio: 50.00,
        cantidad: 3  // Pedir 3 unidades
      }
    ];
    
    const clienteTest = 'Cliente Test - ' + new Date().getTime();
    const telefonoTest = '999888777';
    
    // Obtener CantReq ANTES de guardar (si existe el producto TEST001)
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheetLicores = ss.getSheetByName(SHEET_LICORES);
    const dataLicores = sheetLicores.getDataRange().getValues();
    
    let cantReqAntes = null;
    let filaProducto = -1;
    for (let i = 1; i < dataLicores.length; i++) {
      if (dataLicores[i][0] === codigoTest) {
        filaProducto = i + 1;
        cantReqAntes = parseInt(dataLicores[i][7]) || 0; // Col H
        break;
      }
    }
    
    // Guardar pedido
    const resultado = guardarPedido(clienteTest, telefonoTest, productosTest);
    
    if (!resultado.success) {
      return {
        success: false,
        mensaje: resultado.message
      };
    }
    
    // Verificar que se haya guardado en Pedidos
    const sheetPedidos = ss.getSheetByName(SHEET_PEDIDOS);
    const dataPedidos = sheetPedidos.getDataRange().getValues();
    
    const pedidoEncontrado = dataPedidos.slice(1).some(row => 
      row[9] === resultado.pedidoId // Columna J: Pedido
    );
    
    if (!pedidoEncontrado) {
      return {
        success: false,
        mensaje: 'El pedido no se encontró en la hoja después de guardarlo'
      };
    }
    
    // Verificar que CantReq se haya actualizado (solo si el producto existe)
    if (filaProducto !== -1 && cantReqAntes !== null) {
      const dataLicoresActualizada = sheetLicores.getDataRange().getValues();
      const cantReqDespues = parseInt(dataLicoresActualizada[filaProducto - 1][7]) || 0;
      
      if (cantReqDespues !== cantReqAntes + 3) {
        return {
          success: false,
          mensaje: `CantReq no se actualizó correctamente. Antes: ${cantReqAntes}, Después: ${cantReqDespues}, Esperado: ${cantReqAntes + 3}`
        };
      }
    }
    
    return {
      success: true,
      mensaje: 'Guardado exitoso',
      detalles: `Pedido: ${resultado.pedidoId}, Cliente: ${clienteTest}, Tel: ${telefonoTest}, Productos: ${productosTest.length}${filaProducto !== -1 ? ', CantReq actualizada correctamente' : ''}`
    };
  } catch (error) {
    return {
      success: false,
      mensaje: `Error: ${error.toString()}`
    };
  }
}

// ***********************************************
// 09. Test: Lectura de Pedidos - testall.gs - V1.02-SV01
// ***********************************************

function testLeerPedidos() {
  try {
    const resultado = getPedidos();
    
    if (!resultado.success) {
      return {
        success: false,
        mensaje: resultado.message
      };
    }
    
    const pedidos = resultado.data;
    
    if (!Array.isArray(pedidos)) {
      return {
        success: false,
        mensaje: 'El resultado no es un array'
      };
    }
    
    // Si hay pedidos, verificar estructura
    if (pedidos.length > 0) {
      const primer = pedidos[0];
      const camposRequeridos = ['pedidoId', 'cliente', 'telefono', 'fecha', 'estado', 'productos', 'total'];
      const camposFaltantes = camposRequeridos.filter(campo => !(campo in primer));
      
      if (camposFaltantes.length > 0) {
        return {
          success: false,
          mensaje: `Faltan campos: ${camposFaltantes.join(', ')}`
        };
      }
      
      // Verificar que productos sea un array
      if (!Array.isArray(primer.productos)) {
        return {
          success: false,
          mensaje: 'El campo productos no es un array'
        };
      }
      
      // Verificar que productos tengan cantidad
      if (primer.productos.length > 0 && !('cantidad' in primer.productos[0])) {
        return {
          success: false,
          mensaje: 'Los productos no tienen campo cantidad'
        };
      }
    }
    
    return {
      success: true,
      mensaje: 'Lectura exitosa',
      detalles: `${pedidos.length} pedidos encontrados`
    };
  } catch (error) {
    return {
      success: false,
      mensaje: `Error: ${error.toString()}`
    };
  }
}

// ***********************************************
// 10. Test: Marcar Pagado - testall.gs - V1.03-SV01
// ***********************************************

function testMarcarPagado() {
  try {
    const codigoTest = 'TEST001';
    
    // Primero crear un pedido de prueba
    const productosTest = [
      {
        code: codigoTest,
        producto: 'Licor Test Pago',
        empaque: 'Botella',
        size: '750ml',
        precio: 50.00,
        cantidad: 2
      }
    ];
    
    const clienteTest = 'Cliente Test Pago - ' + new Date().getTime();
    const telefonoTest = '999888777';
    
    // Obtener valores ANTES en Licores (si existe el producto)
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheetLicores = ss.getSheetByName(SHEET_LICORES);
    const dataLicoresAntes = sheetLicores.getDataRange().getValues();
    
    let cantReqAntes = null;
    let cantVendidaAntes = null;
    let filaProducto = -1;
    
    for (let i = 1; i < dataLicoresAntes.length; i++) {
      if (dataLicoresAntes[i][0] === codigoTest) {
        filaProducto = i + 1;
        cantReqAntes = parseInt(dataLicoresAntes[i][7]) || 0; // Col H
        cantVendidaAntes = parseInt(dataLicoresAntes[i][8]) || 0; // Col I
        break;
      }
    }
    
    // Guardar pedido
    const resultadoPedido = guardarPedido(clienteTest, telefonoTest, productosTest);
    
    if (!resultadoPedido.success) {
      return {
        success: false,
        mensaje: 'No se pudo crear pedido de prueba: ' + resultadoPedido.message
      };
    }
    
    const pedidoId = resultadoPedido.pedidoId;
    
    // Obtener CantReq DESPUÉS de crear pedido
    const dataLicoresDespuesPedido = sheetLicores.getDataRange().getValues();
    let cantReqDespuesPedido = null;
    if (filaProducto !== -1) {
      cantReqDespuesPedido = parseInt(dataLicoresDespuesPedido[filaProducto - 1][7]) || 0;
    }
    
    // Marcar como pagado
    const resultadoPagado = marcarPagado(pedidoId);
    
    if (!resultadoPagado.success) {
      return {
        success: false,
        mensaje: 'Error al marcar pagado: ' + resultadoPagado.message
      };
    }
    
    // Verificar que el estado cambió a "Pagado"
    const sheetPedidos = ss.getSheetByName(SHEET_PEDIDOS);
    const dataPedidos = sheetPedidos.getDataRange().getValues();
    
    const pedidoEncontrado = dataPedidos.slice(1).find(row => row[9] === pedidoId); // Col J: Pedido
    
    if (!pedidoEncontrado) {
      return {
        success: false,
        mensaje: 'No se encontró el pedido después de marcarlo'
      };
    }
    
    if (pedidoEncontrado[10] !== 'Pagado') { // Col K: Estado
      return {
        success: false,
        mensaje: `Estado incorrecto: ${pedidoEncontrado[10]}, esperado: Pagado`
      };
    }
    
    // Verificar actualización de CantReq y CantVendida (solo si el producto existe)
    if (filaProducto !== -1 && cantReqAntes !== null && cantVendidaAntes !== null) {
      const dataLicoresDespuesPago = sheetLicores.getDataRange().getValues();
      const cantReqDespues = parseInt(dataLicoresDespuesPago[filaProducto - 1][7]) || 0;
      const cantVendidaDespues = parseInt(dataLicoresDespuesPago[filaProducto - 1][8]) || 0;
      
      // CantReq debería haber bajado en 2
      if (cantReqDespues !== cantReqDespuesPedido - 2) {
        return {
          success: false,
          mensaje: `CantReq no se actualizó. Antes Pago: ${cantReqDespuesPedido}, Después: ${cantReqDespues}, Esperado: ${cantReqDespuesPedido - 2}`
        };
      }
      
      // CantVendida debería haber subido en 2
      if (cantVendidaDespues !== cantVendidaAntes + 2) {
        return {
          success: false,
          mensaje: `CantVendida no se actualizó. Antes: ${cantVendidaAntes}, Después: ${cantVendidaDespues}, Esperado: ${cantVendidaAntes + 2}`
        };
      }
    }
    
    return {
      success: true,
      mensaje: 'Marcar pagado funciona correctamente',
      detalles: `Pedido ${pedidoId} marcado como Pagado${filaProducto !== -1 ? ', CantReq y CantVendida actualizadas correctamente' : ''}`
    };
  } catch (error) {
    return {
      success: false,
      mensaje: `Error: ${error.toString()}`
    };
  }
}

// ***********************************************
// 11. Función para Forzar Autorización - testall.gs - V1.02-SV01
// ***********************************************

function forceAuthorization() {
  console.log('Forzando autorización de permisos...');
  console.log('');
  
  try {
    // Acceder a SpreadsheetApp
    const ss = SpreadsheetApp.openById(SHEET_ID);
    console.log('✓ Acceso a SpreadsheetApp autorizado');
    
    // Acceder a propiedades
    const props = PropertiesService.getScriptProperties();
    console.log('✓ Acceso a PropertiesService autorizado');
    
    // Acceder a UrlFetchApp (si se necesita en el futuro)
    console.log('✓ Preparado para UrlFetchApp');
    
    console.log('');
    console.log('='.repeat(60));
    console.log('AUTORIZACIÓN COMPLETADA EXITOSAMENTE');
    console.log('='.repeat(60));
    console.log('');
    console.log('Ahora puedes desplegar la aplicación web.');
    console.log('Pasos siguientes:');
    console.log('1. Haz clic en "Implementar" > "Nueva implementación"');
    console.log('2. Selecciona "Aplicación web"');
    console.log('3. Ejecutar como: Tu usuario');
    console.log('4. Quién tiene acceso: Cualquier usuario');
    console.log('5. Haz clic en "Implementar"');
    
    return true;
  } catch (error) {
    console.error('✗ Error durante la autorización: ' + error.toString());
    return false;
  }
}
