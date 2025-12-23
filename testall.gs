/*
***********************************************
Bebidas a Pedido - testall.gs - V1.01
22/12/2024 - 10:35
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
// 08. Test: Guardado de Pedido - testall.gs - V1.01-SV01
// ***********************************************

function testGuardarPedido() {
  try {
    // Crear pedido de prueba
    const productosTest = [
      {
        code: 'TEST001',
        producto: 'Licor Test 1',
        empaque: 'Botella',
        size: '750ml',
        precio: 50.00
      },
      {
        code: 'TEST002',
        producto: 'Licor Test 2',
        empaque: 'Caja',
        size: '1L',
        precio: 75.00
      }
    ];
    
    const clienteTest = 'Cliente Test - ' + new Date().getTime();
    
    // Guardar pedido
    const resultado = guardarPedido(clienteTest, productosTest);
    
    if (!resultado.success) {
      return {
        success: false,
        mensaje: resultado.message
      };
    }
    
    // Verificar que se haya guardado
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(SHEET_PEDIDOS);
    const data = sheet.getDataRange().getValues();
    
    // Buscar el pedido recién creado
    const pedidoEncontrado = data.slice(1).some(row => 
      row[0] === clienteTest && row[7] === resultado.pedidoId
    );
    
    if (!pedidoEncontrado) {
      return {
        success: false,
        mensaje: 'El pedido no se encontró en la hoja después de guardarlo'
      };
    }
    
    return {
      success: true,
      mensaje: 'Guardado exitoso',
      detalles: `Pedido: ${resultado.pedidoId}, Cliente: ${clienteTest}, Productos: ${productosTest.length}`
    };
  } catch (error) {
    return {
      success: false,
      mensaje: `Error: ${error.toString()}`
    };
  }
}

// ***********************************************
// 09. Test: Lectura de Pedidos - testall.gs - V1.01-SV01
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
      const camposRequeridos = ['pedidoId', 'cliente', 'fecha', 'productos', 'total'];
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
// 10. Función para Forzar Autorización - testall.gs - V1.01-SV01
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
