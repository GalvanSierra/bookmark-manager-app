// Script para desguardar publicaciones de Instagram
// Ejecutar desde la consola del navegador en la página de publicaciones guardadas

(async function desguardarPublicaciones() {
  console.log('🚀 Iniciando proceso de desguardado de publicaciones...');

  let procesadas = 0;
  let errores = 0;

  // Función para esperar un tiempo determinado
  function esperar(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Función para hacer click con manejo de errores
  function clickSeguro(elemento, descripcion) {
    try {
      elemento.click();
      console.log(`✅ ${descripcion}`);
      return true;
    } catch (error) {
      console.error(`❌ Error al ${descripcion}:`, error);
      return false;
    }
  }

  // Función principal para procesar las publicaciones
  async function procesarPublicaciones(indiceInicial) {
    // Buscar todas las publicaciones guardadas visibles
    // Basado en el HTML, las publicaciones están en divs con clase "_aagu"
    const publicaciones = document.querySelectorAll(
      'div._aagu, article div[role="button"], [data-visualcompletion="ignore-dynamic"] [role="button"]'
    );
    console.log(
      `📋 Encontradas ${publicaciones.length} publicaciones visibles`
    );

    if (publicaciones.length === 0) {
      console.log(
        '⚠️ No se encontraron publicaciones. Asegúrate de estar en la sección de publicaciones guardadas.'
      );
      return { procesadas: 0, siguienteIndice: indiceInicial };
    }

    let procesadasEnEstaFuncion = 0;

    for (let i = indiceInicial; i < publicaciones.length; i++) {
      console.log(
        `\n🔄 Procesando publicación ${i + 1}/${publicaciones.length}...`
      );

      try {
        // Click en la publicación para abrirla
        if (!clickSeguro(publicaciones[i], 'abrir publicación')) {
          errores++;
          continue;
        }

        // Esperar a que se abra la publicación
        await esperar(1000);

        // Buscar el botón de guardar/desguardar
        // Basado en el HTML proporcionado, el botón tiene el texto "Suprimir"
        const posiblesSelectores = [
          'svg[aria-label="Suprimir"]',
          'svg[aria-label="Quitar de guardados"]',
          'svg[aria-label="Remove from Saved"]',
          'svg[aria-label="Remove"]',
          'button[aria-label="Suprimir"]',
          'button[aria-label="Quitar de guardados"]',
          'button[aria-label="Remove from Saved"]',
        ];

        let botonGuardar = null;

        for (const selector of posiblesSelectores) {
          const elemento = document.querySelector(selector);
          if (elemento) {
            // Si es un SVG, buscar el botón padre más cercano
            botonGuardar =
              elemento.tagName === 'svg'
                ? elemento.closest('[role="button"]') ||
                  elemento.closest('button')
                : elemento;
            break;
          }
        }

        // Método alternativo: buscar por la estructura específica del HTML
        if (!botonGuardar) {
          // Buscar el último span en la sección que contiene el botón de guardar
          const seccionBotones = document.querySelector('section.x78zum5');
          if (seccionBotones) {
            const ultimoSpan = seccionBotones.querySelector(
              'span.x972fbf:last-child'
            );
            if (ultimoSpan) {
              botonGuardar = ultimoSpan.querySelector('[role="button"]');
            }
          }
        }

        // Método de respaldo: buscar por posición en la barra de acciones
        if (!botonGuardar) {
          const botonesAccion = document.querySelectorAll(
            'section [role="button"]'
          );
          if (botonesAccion.length >= 4) {
            botonGuardar = botonesAccion[botonesAccion.length - 1]; // El último botón
          }
        }

        if (botonGuardar) {
          if (clickSeguro(botonGuardar, 'desguardar publicación')) {
            procesadas++;
            procesadasEnEstaFuncion++;
            await esperar(700); // Pausa después de desguardar
          } else {
            errores++;
          }
        } else {
          console.log('⚠️ No se encontró el botón de guardar');
          errores++;
        }

        // Cerrar la publicación (presionar ESC o buscar botón cerrar)
        const botonCerrar =
          document.querySelector('button[aria-label="Cerrar"]') ||
          document.querySelector('button[aria-label="Close"]') ||
          document.querySelector('svg[aria-label="Cerrar"]')?.closest('button');

        if (botonCerrar) {
          clickSeguro(botonCerrar, 'cerrar publicación');
        } else {
          // Si no encontramos botón cerrar, presionar ESC
          document.dispatchEvent(
            new KeyboardEvent('keydown', { key: 'Escape' })
          );
        }

        // Pausa entre publicaciones para evitar rate limiting
        await esperar(1000);
      } catch (error) {
        console.error(`❌ Error procesando publicación ${i + 1}:`, error);
        errores++;

        // Intentar cerrar cualquier modal abierto
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        await esperar(1000);
      }
    }

    // Retornar el número de publicaciones procesadas y el siguiente índice
    return {
      procesadas: procesadasEnEstaFuncion,
      siguienteIndice: publicaciones.length,
    };
  }

  // Ejecutar el proceso
  console.log(
    '⏳ Iniciando en 3 segundos... Asegúrate de estar en la página de publicaciones guardadas.'
  );
  await esperar(1500);

  let totalProcesadas = 0;
  let ciclo = 1;
  let indiceActual = 0;

  // Procesar publicaciones en ciclos (para manejar scroll infinito)
  while (true) {
    console.log(`\n🔄 === CICLO ${ciclo} ===`);
    console.log(`📍 Comenzando desde el índice: ${indiceActual}`);

    const resultado = await procesarPublicaciones(indiceActual);

    if (resultado.procesadas === 0) {
      console.log('✅ No hay más publicaciones para procesar.');
      break;
    }

    totalProcesadas += resultado.procesadas;
    indiceActual = resultado.siguienteIndice; // CORRECCIÓN: Actualizar correctamente el índice

    console.log(`✅ Procesadas en este ciclo: ${resultado.procesadas}`);
    console.log(`📊 Total acumulado: ${totalProcesadas}`);

    // Hacer scroll hacia abajo para cargar más publicaciones
    console.log('📜 Haciendo scroll para cargar más publicaciones...');
    window.scrollTo(0, document.body.scrollHeight);
    await esperar(5000); // Esperar a que carguen más publicaciones

    ciclo++;

    // Límite de seguridad para evitar bucles infinitos
    if (ciclo > 50) {
      console.log('⚠️ Se alcanzó el límite de ciclos (50). Deteniendo...');
      break;
    }
  }

  // Resumen final
  console.log('\n📊 === RESUMEN FINAL ===');
  console.log(`✅ Publicaciones desguardadas: ${procesadas}`);
  console.log(`❌ Errores encontrados: ${errores}`);
  console.log(`🔄 Total de ciclos: ${ciclo - 1}`);
  console.log('🎉 Proceso completado!');

  return {
    procesadas: procesadas,
    errores: errores,
    ciclos: ciclo - 1,
  };
})();
