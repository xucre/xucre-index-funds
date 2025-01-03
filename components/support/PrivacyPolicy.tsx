import React from 'react';
import OpaqueCard from '../ui/OpaqueCard';
import { Box, Divider, Typography } from '@mui/material';
import { useLanguage } from '@/hooks/useLanguage';
import { Language } from '@/metadata/translations';

export default function PrivacyPolicy() {
  const {language, languageData} = useLanguage();
  return (
    <OpaqueCard sx={{ p: 3, maxWidth: { xs: '100%', md: '65%'} }}>
      {language === Language.EN && 
        <Box>
          <Typography variant="h4" gutterBottom sx={{fontWeight: '500'}}>
            Web Application Privacy Policy and Terms of Service
          </Typography>

          <Divider sx={{my:4}} />

          <Typography variant="h6" mt={2} gutterBottom>
            1. Introduction
          </Typography>
          <Typography variant="body2" ml={2} gutterBottom>
            Welcome to Xucre Investments’ web application. By accessing or using our services, you agree to comply with the terms outlined in this document. 
            This document explains our practices regarding privacy, data usage, and the terms governing your use of the application.
          </Typography>

          <Typography variant="h5" gutterBottom sx={{fontSize: '1.6rem', mt: 3, mb: 3, fontWeight: '900'}}>
            Part I: Privacy Policy
          </Typography>

          <Typography variant="h6" gutterBottom>
            2. Information We Collect
          </Typography>
          <Typography variant="body2">
            <strong>2.1 Information You Provide</strong><br />
            <Box sx={{m: 2}}>
              Personal details: Name, email, phone number, and other data submitted during registration or through forms.<br />
              Financial preferences or details required for account setup.
            </Box>
          </Typography>
          <Typography variant="body2">
            <strong>2.2 Automatically Collected Data</strong><br />
            <Box sx={{m: 2}}>
              Device information, browser type, and operating system.<br />
              IP addresses and geolocation data.<br />
              Browsing activity within the application.
            </Box>
          </Typography>
          <Typography variant="body2">
            <strong>2.3 Cookies and Tracking</strong><br />
            <Box sx={{m: 2}}>
              Essential Cookies: Necessary for core functionality.<br />
              Analytical Cookies: Optimize user experience (e.g., Google Analytics).<br />
              Marketing Cookies: For personalized advertising (used only with consent).
            </Box>
          </Typography>

          <Typography variant="h6" gutterBottom>
            3. Use of Information
          </Typography>
          <Typography variant="body2">
            <Box sx={{m: 2}}>
              We use your data to:

              <Box sx={{my:1, mx: 4}}>
                <ul>
                  <li>Deliver and improve our services.</li>
                  <li>Facilitate secure transactions and portfolio management.</li>
                  <li>Communicate updates, notices, and relevant offers.</li>
                  <li>Analyze usage patterns for better application performance.</li>
                </ul>
              </Box>
            </Box>
          </Typography>

          <Typography  variant="h6" gutterBottom>
            4. Data Sharing
          </Typography>
          <Typography variant="body2">
            <Box sx={{m: 2}}>
              We do not sell your personal data. Data may be shared with:
              <Box sx={{my:1, mx: 4}}>
              <ul>
                <li>Service providers supporting Xucre operations (e.g., payment processors, analytics tools).</li>
                <li>Legal authorities when required by applicable laws.</li>
              </ul>
              </Box>
            </Box>
          </Typography>

          <Typography  variant="h6" gutterBottom>
            5. Security Measures
          </Typography>
          <Typography variant="body2">
            <Box sx={{m: 2}}>
              We employ:
              <Box sx={{my:1, mx: 4}}>
                <ul>
                  <li>Encryption for data in transit and at rest.</li>
                  <li>Multi-factor authentication for account security.</li>
                  <li>Regular security audits and system updates.</li>
                </ul>
              </Box>
            </Box>
          </Typography>

          <Typography  variant="h6" gutterBottom>
            6. Data Retention
          </Typography>
          <Typography variant="body2" ml={2} >
            We retain your data for as long as necessary to fulfill the purposes described or to comply with legal obligations. Once retention periods lapse, 
            data is securely deleted or anonymized.
          </Typography>

          <Typography  variant="h6" gutterBottom mt={2}>
            7. Your Rights
          </Typography>
          <Typography variant="body2">
            <Box sx={{m: 2}}>
              You have the right to:
              <Box sx={{my:1, mx: 4}}>
                <ul>
                  <li>Access, correct, or delete your data.</li>
                  <li>Restrict certain data processing activities.</li>
                  <li>Opt-out of non-essential cookies.</li>
                </ul>
              </Box>
              To exercise your rights, contact us at <a href={'mailto:xisupport@xucre.net'} target={'_blank'} >xisupport@xucre.net</a>.
            </Box>
          </Typography>

          <Typography  variant="h6" gutterBottom>
            8. Updates to the Privacy Policy
          </Typography>
          <Typography variant="body2" ml={2} >
            We may update this Privacy Policy to reflect changes in practices or legal requirements. Users will be notified of significant changes 
            via email or in-app notifications.
          </Typography>

          <Typography variant="h5" gutterBottom sx={{fontSize: '1.6rem', mt: 3, mb: 3, fontWeight: '900'}}>
            Part II: Terms of Service
          </Typography>

          <Typography  variant="h6" gutterBottom>
            9. Agreement to Terms
          </Typography>
          <Typography variant="body2" ml={2} mb={2}>
            By using the Xucre Investments application, you agree to abide by these Terms of Service. If you disagree with any part of these terms, 
            please discontinue use of the application.
          </Typography>

          <Typography  variant="h6" gutterBottom>
            10. Services
          </Typography>
          <Typography variant="body2">
            <Box sx={{m: 2}}>
              The Xucre application provides:
              <Box sx={{my:1, mx: 4}}>
                <ul>
                  <li>Tools for managing investment portfolios.</li>
                  <li>Third party applications.</li>
                  <li>Information and access to financial services.</li>
                </ul>
              </Box>
            </Box>
          </Typography>

          <Typography  variant="h6" gutterBottom>
            11. User Responsibilities
          </Typography>
          <Typography variant="body2">
            <Box sx={{m: 2}}>
              Users are required to:
              <Box sx={{my:1, mx: 4}}>
                <ul>
                  <li>Provide accurate and up-to-date information during registration.</li>
                  <li>Maintain the confidentiality of their login credentials.</li>
                  <li>Comply with all applicable local, national, and international laws.</li>
                </ul>
              </Box>
            </Box>
          </Typography>

          <Typography  variant="h6" gutterBottom>
            12. Prohibited Activities
          </Typography>
          <Typography variant="body2">
            <Box sx={{m: 2}}>
              You agree not to:
              <Box sx={{my:1, mx: 4}}>
                <ul>
                  <li>Attempt to gain unauthorized access to the application or its systems.</li>
                  <li>Use the application for illegal or fraudulent activities.</li>
                  <li>Distribute malicious software, spam, or any other harmful content.</li>
                </ul>
              </Box>
            </Box>
          </Typography>

          <Typography  variant="h6" gutterBottom>
            13. Intellectual Property
          </Typography>
          <Typography variant="body2" ml={2} mb={2}>
            All content, features, and trademarks within the application are the property of Xucre Investments. Unauthorized use, reproduction, or distribution 
            is strictly prohibited.
          </Typography>

          <Typography  variant="h6" gutterBottom>
            14. Limitation of Liability
          </Typography>
          <Typography variant="body2">
            <Box sx={{m: 2}}>
              Xucre is not liable for:
              <Box sx={{my:1, mx: 4}}>
                <ul>
                  <li>Losses arising from service interruptions or technical issues.</li>
                  <li>Unauthorized access caused by user negligence.</li>
                  <li>Investment losses based on decisions made using the application.</li>
                </ul>
              </Box>
            </Box>
          </Typography>

          <Typography  variant="h6" gutterBottom>
            15. Governing Law and Dispute Resolution
          </Typography>
          <Typography variant="body2" ml={2} mb={2}>
            These Terms are governed by international commercial law. Any disputes will be resolved through binding arbitration in Florida, USA, following 
            mediation efforts.
          </Typography>

          <Typography  variant="h6" gutterBottom>
            16. Termination
          </Typography>
          <Typography variant="body2" ml={2} mb={2}>
            Xucre reserves the right to terminate or restrict access to the application for users who violate these Terms of Service.
          </Typography>

          <Typography  variant="h6" gutterBottom>
            17. Updates to the Terms of Service
          </Typography>
          <Typography variant="body2" ml={2} mb={2}>
            Xucre may update these Terms of Service at its discretion. Continued use of the application after updates constitutes acceptance 
            of the revised terms.
          </Typography>

          <Typography variant="h5" gutterBottom sx={{fontSize: '1.6rem', mt: 3, mb: 3, fontWeight: '900'}}>
            Part III: Contact Information
          </Typography>
          <Typography variant="body2" ml={2} mb={2}>
            For any questions or concerns regarding this document, please contact us at:
            <br />
            Email: <a href={'mailto:xisupport@xucre.net'} target={'_blank'} >xisupport@xucre.net</a>
          </Typography>
        </Box>
      }

      {(language === Language.ES || language === Language.PT) && 
        <Box>
          <Typography variant="h4" gutterBottom sx={{fontWeight: '500'}}>
          Política de privacidad y condiciones de servicio de la aplicación web
          </Typography>
          <Divider sx={{my:4}} />
          <Typography variant="h6" mt={2} gutterBottom>
            1. Introducción
          </Typography>
          <Typography variant="body2" ml={2} gutterBottom>
            Bienvenido a la aplicación web de Xucre Investments. Al acceder o utilizar nuestros servicios, usted acepta cumplir con los términos descritos en este documento. Este documento explica nuestras prácticas con respecto a la privacidad, el uso de datos y los términos que rigen el uso de la aplicación.
          </Typography>

          <Typography variant="h5" gutterBottom sx={{fontSize: '1.6rem', mt: 3, mb: 3, fontWeight: '900'}}>
            Parte I: Política de Privacidad
          </Typography>

          <Typography variant="h6" gutterBottom>
            2. Información que recopilamos
          </Typography>
          <Typography variant="body2">
            <strong>2.1 Información que usted proporciona</strong><br />
            <Box sx={{m: 2}}>
              Datos personales: Nombre, correo electrónico, número de teléfono y otros datos proporcionados durante el registro o a través de formularios.
              <br />
              Preferencias financieras o detalles necesarios para la configuración de la cuenta.
            </Box>
          </Typography>
          <Typography variant="body2">
            <strong>2.2 Datos recopilados automáticamente</strong><br />
            <Box sx={{m: 2}}>
              Información del dispositivo, tipo de navegador y sistema operativo.
              <br />
              Direcciones IP y datos de geolocalización.
              <br />
              Actividad de navegación dentro de la aplicación.
            </Box>
          </Typography>
          <Typography variant="body2">
            <strong>2.3 Cookies y seguimiento</strong><br />
            <Box sx={{m: 2}}>
              Galletas esenciales: Necesario para la funcionalidad principal.
              <br />
              Cookies analíticas: optimizan la experiencia del usuario (por ejemplo, Google Analytics).
              <br />
              Cookies de marketing: para publicidad personalizada (utilizadas únicamente con consentimiento).
            </Box>
          </Typography>

          <Typography variant="h6" gutterBottom>
            3. Uso de la información
          </Typography>
          <Typography variant="body2">
            <Box sx={{m: 2}}>
              Usamos tus datos para:

              <Box sx={{my:1, mx: 4}}>
                <ul>
                  <li>Entregar y mejorar nuestros servicios.</li>
                  <li>Facilitar transacciones seguras y gestión de carteras.</li>
                  <li>Comunicar actualizaciones, avisos y ofertas relevantes.</li>
                  <li>Analice los patrones de uso para mejorar el rendimiento de las aplicaciones.</li>
                </ul>
              </Box>
            </Box>
          </Typography>

          <Typography  variant="h6" gutterBottom>
            4. Intercambio de datos
          </Typography>
          <Typography variant="body2">
            <Box sx={{m: 2}}>
              No vendemos sus datos personales. Los datos podrán ser compartidos con:
              <Box sx={{my:1, mx: 4}}>
              <ul>
                <li>Proveedores de servicios que respaldan las operaciones de Xucre (por ejemplo, procesadores de pagos, herramientas de análisis).</li>
                <li>Autoridades legales cuando así lo requieran las leyes aplicables.</li>
              </ul>
              </Box>
            </Box>
          </Typography>

          <Typography  variant="h6" gutterBottom>
            5. Medidas de seguridad
          </Typography>
          <Typography variant="body2">
            <Box sx={{m: 2}}>
              Empleamos:
              <Box sx={{my:1, mx: 4}}>
                <ul>
                  <li>Cifrado de datos en tránsito y en reposo.</li>
                  <li>Autenticación multifactor para la seguridad de la cuenta.</li>
                  <li>Auditorías periódicas de seguridad y actualizaciones del sistema.</li>
                </ul>
              </Box>
            </Box>
          </Typography>

          <Typography  variant="h6" gutterBottom>
            6. Retención de datos
          </Typography>
          <Typography variant="body2" ml={2} >
            Conservamos tus datos durante el tiempo necesario para cumplir con las finalidades descritas o para cumplir con obligaciones legales. Una vez transcurridos los períodos de retención, los datos se eliminan de forma segura o se anonimizan.
          </Typography>

          <Typography  variant="h6" gutterBottom mt={2}>
            7. Tus derechos
          </Typography>
          <Typography variant="body2">
            <Box sx={{m: 2}}>
              Tienes derecho a:
              <Box sx={{my:1, mx: 4}}>
                <ul>
                  <li>Acceder, rectificar o suprimir sus datos.</li>
                  <li>Restringir ciertas actividades de procesamiento de datos.</li>
                  <li>Optar por no recibir cookies no esenciales.</li>
                </ul>
              </Box>
              Para ejercer sus derechos, contáctenos en <a href={'mailto:xisupport@xucre.net'} target={'_blank'} >xisupport@xucre.net</a>.
            </Box>
          </Typography>

          <Typography  variant="h6" gutterBottom>
            8. Actualizaciones de la Política de Privacidad
          </Typography>
          <Typography variant="body2" ml={2} >
            Podemos actualizar esta Política de Privacidad para reflejar cambios en las prácticas o requisitos legales. Los usuarios serán notificados de cambios importantes por correo electrónico o notificaciones dentro de la aplicación.
          </Typography>

          <Typography variant="h5" gutterBottom sx={{fontSize: '1.6rem', mt: 3, mb: 3, fontWeight: '900'}}>
            Parte II: Términos de servicio
          </Typography>

          <Typography  variant="h6" gutterBottom>
            9. Acuerdo de términos
          </Typography>
          <Typography variant="body2" ml={2} mb={2}>
            Al utilizar la aplicación Xucre Investments, usted acepta cumplir con estos Términos de servicio. Si no está de acuerdo con alguna parte de estos términos, deje de utilizar la aplicación.
          </Typography>

          <Typography  variant="h6" gutterBottom>
            10. Servicios
          </Typography>
          <Typography variant="body2">
            <Box sx={{m: 2}}>
              La aplicación Xucre proporciona:
              <Box sx={{my:1, mx: 4}}>
                <ul>
                  <li>Herramientas para la gestión de carteras de inversión.</li>
                  <li>Aplicaciones de terceros.</li>
                  <li>Información y acceso a servicios financieros.</li>
                </ul>
              </Box>
            </Box>
          </Typography>

          <Typography  variant="h6" gutterBottom>
            11. Responsabilidades del usuario
          </Typography>
          <Typography variant="body2">
            <Box sx={{m: 2}}>
            Los usuarios están obligados a:‘
              <Box sx={{my:1, mx: 4}}>
                <ul>
                  <li>Proporcionar información precisa y actualizada durante el registro.</li>
                  <li>Mantener la confidencialidad de sus credenciales de inicio de sesión.</li>
                  <li>Cumplir con todas las leyes locales, nacionales e internacionales aplicables.</li>
                </ul>
              </Box>
            </Box>
          </Typography>

          <Typography  variant="h6" gutterBottom>
            12. Actividades prohibidas
          </Typography>
          <Typography variant="body2">
            <Box sx={{m: 2}}>
              Usted acepta no:
              <Box sx={{my:1, mx: 4}}>
                <ul>
                  <li>Intentar obtener acceso no autorizado a la aplicación o sus sistemas.</li>
                  <li>Utilice la aplicación para actividades ilegales o fraudulentas.</li>
                  <li>Distribuir software malicioso, spam o cualquier otro contenido dañino.</li>
                </ul>
              </Box>
            </Box>
          </Typography>

          <Typography  variant="h6" gutterBottom>
            13. Propiedad intelectual
          </Typography>
          <Typography variant="body2" ml={2} mb={2}>
            Todo el contenido, las funciones y las marcas comerciales de la aplicación son propiedad de Xucre Investments. El uso, la reproducción o la distribución no autorizados están estrictamente prohibidos.
          </Typography>

          <Typography  variant="h6" gutterBottom>
            14. Limitación de responsabilidad
          </Typography>
          <Typography variant="body2">
            <Box sx={{m: 2}}>
              Xucre no se hace responsable de:
              <Box sx={{my:1, mx: 4}}>
                <ul>
                  <li>Pérdidas derivadas de interrupciones del servicio o problemas técnicos.</li>
                  <li>Acceso no autorizado causado por negligencia del usuario.</li>
                  <li>Pérdidas de inversión basadas en decisiones tomadas utilizando la aplicación.</li>
                </ul>
              </Box>
            </Box>
          </Typography>

          <Typography  variant="h6" gutterBottom>
            15. Ley aplicable y resolución de disputas
          </Typography>
          <Typography variant="body2" ml={2} mb={2}>
            Estos Términos se rigen por el derecho comercial internacional. Cualquier disputa se resolverá mediante arbitraje vinculante en Florida, EE. UU., luego de los esfuerzos de mediación.
          </Typography>

          <Typography  variant="h6" gutterBottom>
            16. Terminación
          </Typography>
          <Typography variant="body2" ml={2} mb={2}>
            Xucre se reserva el derecho de cancelar o restringir el acceso a la aplicación para los usuarios que violen estos Términos de servicio.
          </Typography>

          <Typography  variant="h6" gutterBottom>
            17. Actualizaciones de los Términos de Servicio
          </Typography>
          <Typography variant="body2" ml={2} mb={2}>
            Xucre puede actualizar estos Términos de Servicio a su discreción. El uso continuado de la aplicación después de las actualizaciones constituye la aceptación de los términos revisados.
          </Typography>

          <Typography variant="h5" gutterBottom sx={{fontSize: '1.6rem', mt: 3, mb: 3, fontWeight: '900'}}>
            Parte III: Información de contacto
          </Typography>
          <Typography variant="body2" ml={2} mb={2}>
            Si tiene alguna pregunta o inquietud sobre este documento, comuníquese con nosotros a:
            <br />
            Correo electrónico: <a href={'mailto:xisupport@xucre.net'} target={'_blank'} >xisupport@xucre.net</a>
          </Typography>
        </Box>
      }
    </OpaqueCard>
  );
}