<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans dark:bg-gray-950">
    <div class="max-w-3xl mx-auto bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 dark:bg-gray-900 dark:border-gray-800 dark:shadow-none">
      
      <!-- Encabezado -->
      <div class="text-center mb-10">
        <div class="w-16 h-16 bg-brand-500 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/30 mx-auto mb-6">
          <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
        </div>
        <h1 class="text-3xl font-extrabold text-gray-900 dark:text-white">Aviso de Privacidad</h1>
        <p class="mt-2 text-gray-500 dark:text-gray-400">Última actualización: {{ new Date().toLocaleDateString('es-MX') }}</p>
      </div>

      <!-- Contenido Legal -->
      <div class="prose prose-brand dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 space-y-6">
        
        <p>
          En cumplimiento con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (en adelante, la "Ley"), 
          le informamos que <strong>KARLA COVARRUBIAS ACEVES</strong> (en adelante, el "Responsable"), es la persona responsable del uso y protección 
          de sus datos personales.
        </p>

        <h3 class="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">1. Identidad y Domicilio del Responsable</h3>
        <p>
          El Responsable tiene su domicilio ubicado en: <strong>Calle Fray Pedro de Gante 2, Circuito Misioneros, Naucalpan de Juárez, Ciudad Satélite. C.P. 53100</strong>.
        </p>

        <h3 class="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">2. Datos Personales que Recabamos</h3>
        <p>
          Para llevar a cabo las finalidades descritas en el presente aviso de privacidad, recabaremos los siguientes datos personales:
        </p>
        <ul class="list-disc pl-6 space-y-2">
          <li>Nombre completo</li>
          <li>Teléfono de contacto</li>
          <li>Correo electrónico</li>
          <li>Datos de salud (exclusivamente para la consulta nutricional y expediente clínico)</li>
        </ul>

        <h3 class="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">3. Finalidad del Tratamiento de Datos</h3>
        <p>
          Los datos personales que recabamos de usted los utilizaremos para las siguientes finalidades primarias, que son necesarias para el servicio que solicita:
        </p>
        <ul class="list-disc pl-6 space-y-2">
          <li>Agendar, confirmar y gestionar sus citas nutricionales.</li>
          <li>Crear y mantener actualizado su expediente clínico de nutrición.</li>
          <li>Brindarle seguimiento personalizado sobre su plan nutricional.</li>
          <li>Contactarlo por teléfono o correo electrónico para avisos importantes respecto a sus consultas.</li>
        </ul>

        <h3 class="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">4. Medios para Ejercer los Derechos ARCO</h3>
        <p>
          Usted tiene derecho a conocer qué datos personales tenemos de usted, para qué los utilizamos y las condiciones del uso que les damos (Acceso). Asimismo, es su derecho solicitar la corrección de su información personal en caso de que esté desactualizada, sea inexacta o incompleta (Rectificación); que la eliminemos de nuestros registros o bases de datos cuando considere que la misma no está siendo utilizada adecuadamente (Cancelación); así como oponerse al uso de sus datos personales para fines específicos (Oposición). Estos derechos se conocen como derechos ARCO.
        </p>
        <p>
          Para el ejercicio de cualquiera de los derechos ARCO, usted deberá presentar la solicitud respectiva enviando un correo electrónico a: <strong>masdelgado_massano@yahoo.com.mx</strong>.
        </p>

        <h3 class="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">5. Cambios al Aviso de Privacidad</h3>
        <p>
          El presente aviso de privacidad puede sufrir modificaciones, cambios o actualizaciones derivadas de nuevos requerimientos legales; de nuestras propias necesidades por los productos o servicios que ofrecemos; de nuestras prácticas de privacidad; o por otras causas. 
        </p>
        <p>
          Cualquier modificación a este aviso de privacidad podrá consultarla a través de nuestro sitio web o solicitándola directamente en nuestras instalaciones.
        </p>

      </div>

      <div class="mt-12 text-center">
        <router-link to="/reservar" class="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-brand-600 hover:bg-brand-700 transition-colors shadow-md shadow-brand-500/20">
          Volver a Reservar Cita
        </router-link>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
// Componente estático de Aviso de Privacidad
</script>
