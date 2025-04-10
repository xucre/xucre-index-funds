import { TranslationType } from ".";
/* eslint-disable sort-keys */
const values : TranslationType = {
  App: {
    select_network_title: "Redes",
    select_wallet_title: "Wallets",
    send_transaction_title: "Enviar Transacción",
    set_password_title: "Ingresar contraseña",
    sign_message_title: "Firmar Mensaje",
    sign_transaction_title: "Firmar Transacción",
    token_title: "Billetera",
    view_network_title: "Redes",
    view_wallet_title: "Billetera",
    cta_1: "Descarga Xucre Wallet en",
    cta_2: "Android en el PlayStore!",
  },
  Agent: {
    introduction: 'Hola! ¿En qué puedo ayudarte hoy?',
  },
  Buttons_Header: {
    buy: "Comprar",
    connect: "Conectar",
    nft: "NFT",
    receive: "Recibir",
    send: "Enviar",
    profile: "Perfil",
    ramp: "En rampa"
  },
  Billing: {
    manage_subscription: "Administrar suscripción",
    manual_subscription: "Suscripción manual",
    disbursement_modal_title: 'Procesando desembolso',
    disbursement_modal_disbursing: 'Desembolsando USDT a los usuarios',
    disbursement_modal_executing: 'Ejecutando transacciones de usuario',
    new_disbursement_button: 'Nuevo desembolso',
  },
  Dashboard : {
    balances: 'Saldos',
    home: 'Inicio',
    transactions: 'Transacciones',
    read_more: 'Leer más',
    deposit: 'Depósito',
    withdrawal: 'Retiro',
    unknown: 'Desconocido',
    investment: 'Inversión',
    total_balance: 'Saldo total',
    transaction_in: 'Entrada',
    transaction_out: 'Salida',
    no_transactions: 'No se encontraron transacciones',
    withdraw_to_wallet: 'Retirar a la billetera',
    exit_position: 'Salir de la posición',
  },
  OrganizationEdit: {
    organization_settings: 'Configuraciones de la Organización',
    match_type: 'Tipo de Contribución',
    types: {
      none: 'Ninguno',
      fixed: 'Fijo',
      percentage: 'Porcentaje',
    },
    employer_contribution: 'Contribución del Empleador',
    save: 'Guardar',
  },
  Edit: {
    image_upload: 'Subir imagen',
    porfolio_section: 'Información de la cartera',
    personal_section: 'Nombre',
    firstName_label: 'Nombre',
    middleName_label: 'Segundo Nombre',
    lastName_label: 'Apellido',
    address_section: 'Dirección',
    address_label: 'Dirección',
    street_label: 'Calle',
    street2_label: 'Calle 2',
    city_label: 'Ciudad',
    province_label: 'Provincia',
    postalCode_label: 'Código Postal',
    country_label: 'País',
    id_section: 'Identificación',
    idNumber_label: 'Número de identificación',
    idType_label: 'Tipo de identificación',
    idType_id: 'ID',
    idType_passport: 'Pasaporte',
    idType_driverLicense: 'Licencia de conducir',
    idExpiration_label: 'Fecha de expiración',
    idIssueDate_label: 'Fecha de emisión',
    personal_information: 'Información personal',
    front_label: 'Imagen Frontal',
    back_label: 'Imagen Trasera',
    title: 'Configura tu perfil de inversión',
    tolerance_label: 'Tolerancia al riesgo',
    salary_label: 'Contribución salarial',
    save: 'Guardar',
    sign_button: 'Firmar Mensaje',
    sign_message: '¡Mensaje firmado exitosamente!',
    risk_tolerance_label: 'Tolerancia al riesgo',
    risk_conservative: 'Conservador',
    risk_aggressive: 'Agresivo',
    risk_moderate: 'Moderado',
    beneficiary_section: 'Beneficiarios',
    beneficiary_modal_title: 'Editar Beneficiario',
    add_beneficiary_button: 'Agregar Beneficiario',
    email_label: 'Correo electrónico',
    phone_label: 'Teléfono',
    identification_help_text_title: 'Entendiendo la Identificación en Cripto',
    identification_help_text_body1: 'La identificación es un requisito clave para la inversión en criptomonedas, ya que ayuda a garantizar la seguridad y la conformidad con las regulaciones. Al verificar tu identidad, podemos proteger tu cuenta y prevenir el fraude y el lavado de dinero. Para verificar tu identidad, necesitamos una copia clara y legible de un documento de identificación válido, como un pasaporte, una tarjeta de identidad nacional o una licencia de conducir. Asegúrate de que el documento sea válido y esté actualizado, y sigue las instrucciones a continuación para cargar las imágenes:',
    identification_help_text_bullet1: 'Pasaporte: Debe ser un pasaporte válido emitido por el gobierno. Frontal y trasera, cada lado en su propio archivo.',
    identification_help_text_bullet2: 'Tarjeta de Identidad Nacional: Frontal y trasera, cada lado en su propio archivo.',
    identification_help_text_bullet3: 'Licencia de Conducir: Frontal y trasera, cada lado en su propio archivo.',
    identification_help_text_body2: '',
    risk_help_text_title: 'Entendiendo la Tolerancia al Riesgo en Cripto',
    risk_help_text_body1: 'La tolerancia al riesgo es un factor clave en la toma de decisiones de inversión en criptomonedas. Al evaluar tu tolerancia al riesgo, considera tu disposición a asumir pérdidas potenciales en función de tu horizonte de inversión, objetivos financieros y experiencia en el mercado. En Xucre Inversiones, ofrecemos tres niveles de tolerancia al riesgo para ayudarte a seleccionar la estrategia de inversión adecuada:',
    risk_help_text_bullet1: 'Agresivo: Diseñado para inversores con alta tolerancia al riesgo y un horizonte de inversión a largo plazo, el nivel Agresivo se centra en activos digitales de alto rendimiento y volatilidad. Estos portafolios pueden incluir criptomonedas emergentes, tokens DeFi y proyectos innovadores con un potencial de crecimiento significativo. Si buscas maximizar el rendimiento y estás dispuesto a asumir riesgos, este nivel puede ser adecuado para ti.',
    risk_help_text_bullet2: 'Moderado: Para inversores con una tolerancia al riesgo equilibrada, el nivel Moderado combina activos digitales de alto y bajo riesgo para lograr un equilibrio entre rendimiento y estabilidad. Estos portafolios pueden incluir una combinación de criptomonedas establecidas y emergentes, así como tokens DeFi y NFTs. El objetivo es generar un rendimiento sólido con una volatilidad moderada, adecuado para inversores que buscan un equilibrio entre riesgo y recompensa.',
    risk_help_text_bullet3: 'Conservador: Diseñado para inversores con baja tolerancia al riesgo y un horizonte de inversión a corto plazo, el nivel Conservador se centra en activos digitales estables y de bajo riesgo. Estos portafolios pueden incluir criptomonedas establecidas, tokens de utilidad y activos digitales respaldados por activos tradicionales. Si buscas proteger tu capital y minimizar la volatilidad, este nivel puede ser adecuado para ti.',
    risk_help_text_body2: 'Al seleccionar tu nivel de tolerancia al riesgo, considera tus objetivos financieros, horizonte de inversión y experiencia en el mercado para elegir la estrategia de inversión que mejor se adapte a tus necesidades y preferencias.',
    salary_help_text_title: 'Entendiendo la Contribución Salarial en Cripto',
    salary_help_text_body1: 'La Contribución Salarial es una función clave en la gestión de inversiones en criptomonedas, que te permite automatizar tus inversiones y ahorrar de forma sistemática a lo largo del tiempo. En Xucre Inversiones, ofrecemos la opción de establecer un Porcentaje de Contribución Salarial que se deduce automáticamente de tu salario y se invierte en tu cartera de criptomonedas. Esta función ofrece una serie de beneficios para los inversores:',
    salary_help_text_bullet1: 'Automatización: La Contribución Salarial te permite establecer un porcentaje fijo de tu salario que se invierte automáticamente en tu cartera de criptomonedas. Esta automatización garantiza que ahorres e inviertas de forma sistemática, sin tener que preocup',
    salary_help_text_bullet2: 'Diversificación: Al invertir una parte de tu salario en criptomonedas, puedes diversificar tu cartera y reducir el riesgo asociado con la inversión en un solo activo. La diversificación es una estrategia clave para mitigar el riesgo y maximizar el rendimiento a lo largo del tiempo, ayudándote a construir una cartera equilibrada y resistente a la volatilidad del mercado.',
    salary_help_text_bullet3: 'Crecimiento a largo plazo: Al invertir de forma sistemática y disciplinada a lo largo del tiempo, puedes aprovechar el poder del interés compuesto y el crecimiento a largo plazo. La Contribución Salarial te permite acumular riqueza de forma constante y sostenida, ayudándote a alcanzar tus objetivos financieros a largo plazo.',
    salary_help_text_body2: 'Al establecer tu Porcentaje de Contribución Salarial, considera tus objetivos financieros, capacidad de ahorro y horizonte de inversión para determinar la cantidad adecuada a invertir en tu cartera de criptomonedas. Esta función te permite automatizar tus inversiones y ahorrar de forma sistemática, ayudándote a construir una cartera sólida y resistente a la volatilidad del mercado.',
  },
  Home: {
    title_1: 'Bienvenido a',
    title_2: 'Xucre Inversiones',
    title_3: 'Tu puerta directa hacia el mundo crypto',
    button_header: '¿Ya eres miembro?',
    button: 'Iniciar sesión',
  },
  FundPage: {
    fundHeader: 'Fondos de Índice Crypto',
  },
  FAQPage: {
    title: "Fondos de Índices Xucre: Empoderando la Autogestión de Inversiones",
    header1: "En Xucre Inversiones, ofrecemos una variedad de fondos de índice autogestionados que te permiten tomar el control de tu estrategia de inversión sin comprometer la seguridad o la conformidad. Nuestros fondos están diseñados de manera única para asegurarse de que no cumplan los criterios especificados en la Prueba de Howey para ser considerados títulos:",
    headerList1: [
      "Autogestión: Cada inversor mantiene el control completo sobre sus activos. Los fondos se mantienen en la cartera personal del inversor a lo largo del proceso de inversión, asegurándose de que Xucre nunca tome custodia de tus activos.",
      "Transacciones individuales: Nuestra plataforma ejecuta transacciones de manera individual. Cada transacción es específica para un inversor, evitando la concentración de activos que caracteriza a los fondos tradicionales de inversión."
    ],
    headerSecondary: "Estas características no solo mejoran la seguridad y la autonomía sino que también se alinean con los principios de la finanza descentralizada al empoderarte para gestionar y ejecutar directamente tus decisiones de inversión.",
    title2: "Preguntas Frecuentes para Inversores Potenciales",
    qAndA: [
      {
        question: "¿Qué son los fondos de índice autogestionados?",
        answer: "Los fondos de índice autogestionados permiten a los inversores invertir en un portafolio diversificado de activos sin renunciar al control de sus criptomonedas. Estos fondos se mantienen en la cartera personal del inversor y se gestionan a través de transacciones individuales."
      },
      {
        question: "¿Cómo funcionan los fondos de índice Xucre?",
        answer: "Se selecciona un fondo basado en tus objetivos de inversión y tolerancia al riesgo. A través de nuestra plataforma, puedes ejecutar una transacción que compra los activos compuestos del fondo de índice directamente desde tu cartera, manteniendo el control completo y la custodia en todo momento."
      },
      {
        question: "¿Qué hace que los fondos de índice Xucre sean conformes con las regulaciones?",
        answer: "Nuestros fondos están diseñados para asegurar la conformidad al evitar características que clasificarían a los títulos bajo la Prueba de Howey. Logramos esto asegurándonos de que todos los activos se mantengan autogestionados y que cada transacción de inversión se realice individualmente sin concentrar activos."
      },
      {
        question: "Puedo invertir en fondos de índice Xucre utilizando cualquier cartera Web3?",
        answer: "Sí, nuestra plataforma es compatible con cualquier cartera Web3 que apoye WalletConnect, permitiéndote gestionar y ejecutar transacciones desde la cartera de tu elección."
      },
      {
        question: "¿Qué riesgos están asociados con los fondos de índice Xucre?",
        answer: "Al igual que cualquier inversión, los fondos de índice Xucre tienen riesgos, incluyendo volatilidad del mercado y riesgos potenciales tecnológicos asociados con blockchain y activos digitales. Recomendamos que evalúes tu tolerancia al riesgo y consideres diversificar tus inversiones para mitigar estos riesgos."
      },
      {
        question: "¿Cómo puedo empezar a invertir en fondos de índice Xucre?",
        answer: "Para comenzar a invertir, conecta tu cartera Web3 a nuestra plataforma, selecciona un fondo que se alinee con tus objetivos de inversión y ejecuta la transacción directamente desde tu cartera. Nuestra plataforma amigable para el usuario te guía a través de cada paso."
      }
    ],
    closing: "Al proporcionar una forma segura y conformante con las regulaciones para invertir en activos criptográficos diversificados, los fondos de índice Xucre ofrecen una solución innovadora para inversores modernos que buscan aprovechar los beneficios de la finanza descentralizada sin comprometer la seguridad o el control."
  },
  Invoice: {
    invoice_not_ready: 'La factura no está lista para el pago',
    select_payment_option: 'Selecciona una opción de pago',
    back_button: 'Volver a los proveedores',
    detail_title: 'Detalles de la factura',
    escrow_wallet: 'Cartera de depósito: ',
    total_due: 'Total: $',
    escrow_amount: 'Monto de depósito: $',
    fund_button: 'Fondo',
    disburse_button: 'Desembolsar',
    executing_label: 'Ejecutando',
    detail_table_refresh_members: 'Actualizar miembros',
    detail_table_column_id: 'Id',
    detail_table_column_email: 'Correo electrónico',
    detail_table_column_first: 'Nombre',
    detail_table_column_last: 'Apellido',
    detail_table_column_amount: 'Monto',
    detail_table_column_amount_employer: 'Monto de Contrapartida',
    detail_table_column_wallet: 'Cartera',
    status_paid: 'Pagado',
    status_new: 'Nuevo',
    status_disbursed: 'Desembolsado',
    status_pending: 'Pendiente',
    status_cancelled: 'Cancelado',
    status_draft: 'Borrador',
    table_header_id: 'Id',
    table_header_status: 'Estado',
    table_header_due_date: 'Fecha de vencimiento',
    table_header_total_due: 'Total',
    table_header_created_at: 'Creado en',
    pay_availabe_text: 'Pagar disponible: ',
  },
  LanguagePage: {
    menu_button: 'IDIOMA',
    select_language: "ESPAÑOL",
    title_language: "ELIGE TU IDIOMA"
  },
  Menu: {
    connections_button: 'Conexiones',
    network_button: "Redes",
    nft_button: "NFTs",
    password_button: "Contraseña",
    qr_scan_button: "Escaner QR",
    requests_button: 'Solicitudes',
    wallet_button: "Billetera",
    faq: "Ayuda",
    settings: "Configuración",
    support: "Suporte",
    terms: "Termos e Condições",
    privacy: "Privacidade",
    billing: "Facturación",
    index_builder: "Construtor de Índice",
    organization: "Organização",
    index_funds: "Fundos de Índice",
    dashboard: "Inicio",
    login: "Iniciar sesión",
    home: "Inicio",
    fund: 'Fondo',
    help: 'Ayuda',
    organizations: 'Organizaciones',
    index_manager: 'Gestor de Índices',
    transactions: 'Transacciones',
    balance: 'Saldos de tokens',
  },
  CompanyDashboard: {
    no_corporate_dashboard_access: 'No tienes acceso al panel de control corporativo',
    no_organization_found: 'No se encontró la organización',
  },
  Notifications: {
    notifications: "Notificaciones",
    markAllAsRead: "Marcar todo como leído",
    archiveRead: 'Archivar leído',
    emptyFeedTitle: 'No hay notificaciones',
    emptyFeedBody: 'No se encontraron notificaciones en tu feed',
    poweredBy: 'Desarrollado por Knock',
    archiveNotification: 'Archivar notificación',
    all: 'Todo',
    unread: 'No leído',
    read: 'Leído',
    unseen: 'No visto',
  },
  Onboarding: {
    empty_profile: 'No se encontró perfil',
    empty_profile_description: 'Parece que aún no has creado tu perfil. ¡Vamos a configurarlo para empezar!',
    create_profile: 'Crear Perfil',
    empty_safe: 'No se encontró Safe',
    empty_safe_description: 'Parece que aún no has creado tu Safe wallet. ¡Vamos a configurarlo para comenzar!',
    create_safe: 'Crear Safe',
    empty_escrow: 'No se encontró Escrow Safe',
    empty_escrow_description: 'Parece que aún no has creado tu Escrow Safe wallet. ¡Vamos a configurarlo para comenzar!',
    create_escrow: 'Crear Escrow Safe',
    empty_corp_safe: 'No se encontró Corporate Safe',
    empty_corp_safe_description: 'Parece que aún no has creado tu Corporate Safe wallet. ¡Vamos a configurarlo para comenzar!',
    create_corp_safe: 'Crear Corporate Safe',
    transfer_escrow: 'Transferir Escrow Safe',
    transfer_escrow_description: 'Parece que aún no has transferido la propiedad de tu Escrow Safe wallet. ¡Vamos a configurarlo para comenzar!',
    transfer_escrow_button: 'Transferir',
    transfer_safe: 'Transferir Safe',
    transfer_safe_description: 'Parece que aún no has transferido la propiedad de tu Safe wallet. ¡Vamos a configurarlo para comenzar!',
    transfer_safe_button: 'Transferir',
    empty_delegate: 'No se encontró delegado',
    empty_delegate_description: 'Parece que aún no has delegado tu Safe wallet. ¡Vamos a configurarlo para comenzar!',
    empty_delegate_button: 'Delegar',
    empty_delegate_description_complete: '¡Has delegado tu Safe wallet con éxito!',
    empty_disclosure: 'No se encontró divulgación de riesgos',
    empty_disclosure_description: 'Parece que aún no has firmado la divulgación de riesgos. ¡Vamos a configurarlo para comenzar!',
    empty_disclosure_button: 'Firmar Divulgación',
    empty_disclosure_submit_button: 'Firmar',
    empty_disclosure_title: 'Divulgación de Riesgos',
    empty_onboarding: 'No se encontró proceso de incorporación',
    empty_onboarding_description: 'Parece que aún no has completado el proceso de incorporación. ¡Vamos a configurarlo para comenzar!',
    empty_onboarding_button: 'Incorporarse',
    onboarding_title: 'Proceso de Incorporación',
    creating_safe_title: 'Creando Safe',
    linking_safe_title: 'Vinculando Safe',
    safe_created: 'Safe creado',
    additional_info_title: 'Incorporación completa',
    additional_info_item_1: 'Configurar un beneficiario',
    additional_info_item_2: 'Vincula tu billetera personal',
    additional_info_item_3: 'Últimas recomendaciones sobre criptomonedas',
    additional_info_item_4: 'Comercio en vivo hoy',
    additional_info_subtext: 'Now you can:',
    menu_0: 'Introducción',
    menu_1: 'Crear Perfil',
    menu_2: 'Identificación',
    menu_3: 'Asignación de Cartera',
    menu_4: 'Crear Safe Wallet',
    menu_5: 'Información Adicional',
    onboarding_description: 'Estamos entusiasmados de tenerte a bordo. Comencemos con el proceso de integración para configurar tu perfil y tu cartera Safe.',
    onboarding_complete_title: '¡Tu cuenta está lista!',
    onboarding_complete_description: 'Has completado con éxito el proceso de integración. Ahora puedes comenzar a explorar la plataforma de Xucre Investments.',
  },
  Organization: {
    organization_member_table_user_id: 'ID de usuario',
    organization_member_table_email: 'Correo electrónico',
    organization_member_table_actions: 'Acciones',
    organization_member_table_remove_question: '¿Estás seguro de que deseas eliminar a este miembro?',
  },
  Profile: {
    wallet_management : 'Gestión de Wallets',
  },
  Settings: {
    connect_wallet: 'Conectar Wallet',
    view_wallet: 'Ver Wallet',
    view_portfolio: 'Portafolio',
    view_web3: 'Web3',
    view_display: 'Visualización',
    view_language: 'Idioma',
    view_theme: 'Tema',
    view_social: 'Social',
    view_indentification: 'Identificación',
    view_privacy: 'Privacidad',
    view_profile: 'Perfil',
    view_organization_setting: 'Configuración de la organización',
    onramp_button: 'Rampa de entrada',
  },
  SelectLanguage: {
    en: "Inglés",
    es: "Español",
    nah: "Nahuatl",
    pt: "Portugués",
    qu: "Quechua"
  },
  SupportPage: {
    button_cancel: "Cancelar",
    button_send: "Enviar correo",
    describe_issue: "Describe tu problema",
    introduction: "Si tienes problemas con nuestra aplicacion, por favor contactanos a support@xucre.com o usa el siguiente formulario",
    subject_send: "Asunto",
    title: "Contacto",
    to_send: "De",
    toast_send: "Correo enviado exitosamente!",
    header_button: "Más información",
    case_title: '¿Necesita ayuda?',
    case_body: 'Si tiene alguna pregunta o problema, no dude en ponerse en contacto con nuestro equipo de soporte. Complete el formulario a continuación y nos pondremos en contacto con usted lo antes posible.',
    case_name: 'Nombre',
    case_email: 'Correo electrónico',
    case_details: 'Detalles',
  },
  Toast: {
    sign_client_error: "Error al crear cliente de signos",
    token_prices_error: "Error al obtener los precios de los tokens",
    token_balances_error: "Error al recuperar saldos de tokens",
    invalid_pair: "Solicitud de par no válida",
    success_pair: "Emparejado con billetera",
    error_pair: "Error al emparejar con la billetera",
  },
  ui: {
    open: "Abrir",
    close: "Cerrar",
    edit : "Editar",
    cancel: "Cancelar",
    confirm: "Confirmar",
    featured: 'Presentado',
    all: 'Todo',
    yes: 'Sí',
    no: 'No',
    next: 'Siguiente',
    previous: 'Anterior',
    complete: 'Completar',
    submit: 'Enviar',
    save: 'Guardar',
    error: 'Error',
    add: 'Añadir',
    subtract: 'Restar',
    export: 'Exportar',
    coming_soon: "Próximamente",
    no_items: "No se encontraron artículos",
    address_not_found: "Dirección no encontrada",
    swap_menu : "Swap",
    ramp_menu: "Compra",
    index_fund_menu: "Índice",
    member_menu: "Iniciar sesión",
    index_fund_title: "Fondos de Índice Crypto",
    amount: "Cantidad",
    balance: "Balance",
    approve_and_buy: "Aprobar y comprar",
    approve_in_wallet: "Aprobar en Wallet",
    confirm_swap: "Confirmar intercambio",
    executing: "Ejecutando",
    transaction_successful: "Transacción exitosa",
    profile_saved: "Perfil guardado",
    wrong_network: "Conectado a una red incorrecta, cambie a Polygon.",
    welcome_message_1: "Hola ",
    welcome_message_2: ", bienvendio de nuevo",
    wallet_not_connected: "La billetera debe estar conectada para usar esta función.",
    withdraw_title: 'Retirar Token',
    transaction_error: "Transacción Fallida",
    success: "Éxito",
    use_onramp: "Utilice la función de rampa de acceso para depositar fondos.",
  },
  IndexBuilder: {
    successfulAddition: "Agregado con éxito al fondo de índice",
  },
  totalBalance:{
    title: "Balance total",
    dashboard_change: "último día"
  },
  termsConditions: {
    terms:"Política de privacidad de XucreWallet y Xucre.net Fecha de vigencia: 1 de julio de 2023 Gracias por usar XucreWallet, una billetera descentralizada desarrollada por Xucre Inc. Esta política de privacidad describe cómo recopilamos, usamos, divulgamos y protegemos la información personal cuando usa nuestra aplicación. Lea esta política detenidamente para comprender nuestras prácticas con respecto a sus datos personales. 1. Información que recopilamos 1.1. Información personal: podemos recopilar cierta información personal de usted, como su nombre, dirección de correo electrónico, número de teléfono y cualquier otra información que nos proporcione cuando crea una cuenta o realiza transacciones dentro de la aplicación XucreWallet. 1.2. Información de la billetera: cuando usa XucreWallet, podemos recopilar y almacenar información relacionada con sus transacciones de criptomonedas, incluido el historial de transacciones, las direcciones de la billetera y los montos de las transacciones. 2. Uso de la Información 2.1. Xucre Inc. no tiene la capacidad de acceder, modificar, controlar o revertir ninguna transacción o cambio realizado dentro de la aplicación XucreWallet. No podemos recuperar credenciales de billetera perdidas u olvidadas, incluidas frases mnemotécnicas o claves privadas. Es su exclusiva responsabilidad mantener el almacenamiento seguro y la copia de seguridad de las credenciales de su billetera. 2.2. Usaremos la información personal que proporcione únicamente con el fin de proporcionar y mejorar los servicios de XucreWallet. Esto incluye: facilitar transacciones, brindar atención al cliente, prevenir actividades fraudulentas o no autorizadas y cumplir con las obligaciones legales. 3. Divulgación de información 3.1. Podemos compartir su información personal con proveedores de servicios externos seleccionados, únicamente en la medida necesaria para proporcionar los servicios asociados con XucreWallet. Estos proveedores de servicios externos están obligados a mantener la confidencialidad y seguridad de su información personal de acuerdo con las leyes aplicables. 3.2. Podemos divulgar su información personal si así lo exige la ley o en respuesta a un proceso legal válido, como una orden judicial o una solicitud del gobierno. 4. Seguridad de datos 4.1. Xucre Inc. toma medidas razonables para asegurar su información personal y protegerla del acceso, alteración o divulgación no autorizados. Sin embargo, tenga en cuenta que ninguna medida de seguridad puede garantizar una protección completa y no podemos garantizar que su información personal permanezca siempre segura. 5. Transferencias de datos transfronterizas 5.1. Xucre Inc. opera en múltiples jurisdicciones, incluidas las Islas Vírgenes Británicas, los Estados Unidos (Delaware) y Ecuador (Quito). Al usar XucreWallet, acepta la transferencia de su información personal a estas jurisdicciones, que pueden tener leyes de protección de datos diferentes a las de su país. 6. Sitios web y servicios de terceros 6.1. La aplicación XucreWallet puede contener enlaces a sitios web o servicios de terceros que no son propiedad ni están controlados por Xucre Inc. Esta política de privacidad se aplica solo a nuestra aplicación, y no somos responsables de las prácticas de privacidad de ningún sitio web o servicio de terceros. 7. Cambios a esta Política de Privacidad 7.1. Xucre Inc. puede actualizar esta política de privacidad de vez en cuando. Le notificaremos cualquier cambio material mediante la publicación de la política actualizada dentro de la aplicación XucreWallet o a través de otros medios apropiados. Le animamos a que revise esta política periódicamente para cualquier actualización. 8. Contáctenos 8.1. Si tiene alguna pregunta o inquietud sobre esta política de privacidad o nuestras prácticas de datos, contáctenos en info@xucre.net. Al usar XucreWallet, acepta los términos y condiciones descritos en esta política de privacidad. Si no está de acuerdo con esta política, no utilice nuestra aplicación. Condiciones de servicio del sitio web Xucre.net Fecha de vigencia: 1 de julio de 2023 Estos términos de servicio ( Términos ) rigen su uso del sitio web de XucreWallet, incluidas las aplicaciones de software asociadas (colectivamente, el  Servicio ), proporcionadas por Xucre Inc. ( Xucre ,  nosotros ,  nos  o  nuestro ). Al utilizar el Servicio, usted acepta estar sujeto a estos Términos. Si no está de acuerdo con estos Términos, no utilice el Servicio. 1. Elegibilidad 1.1. Debe tener al menos 18 años para utilizar el Servicio. Al usar el Servicio, usted declara y garantiza que tiene al menos 18 años y que tiene la capacidad legal para celebrar estos Términos. Si está utilizando el Servicio en nombre de una entidad, declara y garantiza que tiene autoridad para vincular a esa entidad con estos Términos. 2. Cuentas de usuario 2.1. Para usar ciertas funciones del Servicio, es posible que deba crear una cuenta de usuario. Usted es responsable de brindar información precisa y completa durante el proceso de registro de la cuenta y de mantener la confidencialidad de las credenciales de su cuenta. 2.2. Usted es el único responsable de todas las actividades que ocurran bajo su cuenta de usuario. Xucre Inc. no es responsable de ningún acceso o uso no autorizado de su cuenta. Si sospecha algún acceso no autorizado, debe notificarnos de inmediato. 3. Uso del Servicio 3.1. XucreWallet es una billetera descentralizada que le permite administrar su criptomoneda. Al usar el Servicio, comprende y reconoce que Xucre Inc. no tiene la capacidad de acceder, modificar, controlar o revertir ninguna transacción o cambio realizado dentro de la aplicación XucreWallet, incluida la pérdida o recuperación de credenciales de billetera, como frases mnemotécnicas. o claves privadas. 3.2. Usted acepta utilizar el Servicio solo para fines lícitos y de conformidad con todas las leyes y reglamentos aplicables. Usted es responsable de asegurarse de que su uso del Servicio no viole ningún derecho de terceros. 4. Derechos de propiedad intelectual 4.1. El Servicio, incluido cualquier software, contenido y materiales disponibles a través del Servicio, son propiedad de Xucre Inc. y están protegidos por las leyes de propiedad intelectual. No puede copiar, modificar, distribuir, vender o arrendar ninguna parte del Servicio sin nuestro consentimiento previo por escrito. 5. Privacidad 5.1. Recopilamos, usamos y divulgamos información personal de acuerdo con nuestra Política de privacidad. Al usar el Servicio, usted acepta nuestra recopilación, uso y divulgación de información personal como se describe en la Política de privacidad. 6. Exenciones de responsabilidad y limitaciones de responsabilidad 6.1. El Servicio se proporciona  tal cual  y  según disponibilidad , sin garantías ni representaciones, ya sean expresas o implícitas. No garantizamos la precisión, integridad o puntualidad del Servicio. 6.2. Xucre Inc. no será responsable de ningún daño directo, indirecto, incidental, especial, consecuente o ejemplar, incluida la pérdida de ganancias, que resulte de su uso del Servicio. 7. Indemnización 7.1. Usted acepta indemnizar, defender y eximir a Xucre Inc., sus directores, funcionarios, empleados y agentes de cualquier reclamo, responsabilidad, daño, costo y gasto (incluidos los honorarios razonables de los abogados) que surjan de o en relación con con su uso del Servicio, su incumplimiento de estos Términos o su violación de cualquier ley o derechos de terceros. 8. Enmiendas y Terminación 8.1. Nos reservamos el derecho de modificar o actualizar estos Términos en cualquier momento. Cualquier cambio entrará en vigencia inmediatamente después de la publicación de los Términos revisados en el sitio web de XucreWallet o dentro de la aplicación. Su uso continuado del Servicio después de la publicación de cualquier cambio constituye su aceptación de dichos cambios. Si no está de acuerdo con los Términos modificados, debe dejar de usar el Servicio. 8.2. Podemos rescindir o suspender su acceso al Servicio, con o sin motivo, en cualquier momento y sin previo aviso. 9. Ley aplicable y resolución de disputas 9.1. Estos Términos se regirán e interpretarán de acuerdo con las leyes de las Islas Vírgenes Británicas, sin tener en cuenta sus principios de conflicto de leyes. 9.2. Cualquier disputa que surja de o en relación con estos Términos se resolverá mediante negociaciones de buena fe. Si la disputa no puede resolverse amistosamente, se remitirá y se resolverá finalmente mediante arbitraje de acuerdo con las reglas del Centro de Arbitraje Internacional de las Islas Vírgenes Británicas. 10. Divisibilidad 10.1. Si alguna disposición de estos Términos se considera inválida, ilegal o inaplicable, la validez, legalidad o aplicabilidad de las disposiciones restantes no se verán afectadas ni perjudicadas de ninguna manera. 11. Acuerdo completo 11.1. Estos Términos constituyen el acuerdo completo entre usted y Xucre Inc. con respecto a su uso del Servicio y reemplazan cualquier acuerdo, entendimiento o acuerdo anterior o contemporáneo. Si tiene alguna pregunta o inquietud sobre estos Términos, contáctenos en info@xucre.net Al usar XucreWallet, usted acepta cumplir con estos Términos. Condiciones de servicio para Xucre Wallet Android/iOS Fecha de vigencia: 1 de julio de 2023 Estos Términos de servicio ( Términos ) constituyen un acuerdo legalmente vinculante entre usted ( Usuario  o  usted ) y Xucre Wallet ( Xucre ,  nosotros  o  nosotros ) con respecto a su uso de Xucre Wallet, una billetera digital web3 disponible en Ecuador, Perú y México. Al acceder, registrarse o utilizar Xucre Wallet, usted acepta estar sujeto a estos Términos. Lea atentamente estos Términos antes de utilizar la Cartera Xucre. 1. Definiciones 1.1 Xucre Wallet: Se refiere a la aplicación de billetera digital proporcionada por Xucre que permite a los Usuarios administrar y almacenar activos digitales, incluidas criptomonedas y tokens no fungibles (NFT). 1.2 Activos digitales: se refiere a criptomonedas, tokens y otras representaciones digitales de valor que son compatibles con Xucre Wallet. 1.3 NFT: se refiere a tokens no fungibles, activos digitales únicos que se almacenan y administran dentro de Xucre Wallet. 2. Actividades Prohibidas 2.1 Actividades ilegales: Usted acepta no utilizar Xucre Wallet para ninguna actividad ilegal, incluidos, entre otros, lavado de dinero, financiamiento del terrorismo, fraude o cualquier otra actividad que viole las leyes o regulaciones aplicables. 2.2 Cumplimiento de las leyes: Deberá cumplir con todas las leyes, reglamentos y pautas aplicables relacionadas con el uso de Xucre Wallet, incluidas las relacionadas con criptomonedas, transacciones financieras y privacidad de datos. 3. Clasificación de Criptos 3.1 Clasificación de activos: Xucre Wallet considera las criptomonedas como activos digitales de acuerdo con las interpretaciones legales vigentes. Por lo tanto, cualquier referencia a criptomonedas dentro de estos Términos se considerará como referencia a activos digitales. 4. Compra, Venta e Intercambio de Tokens 4.1 Servicios de intercambio: Xucre Wallet puede brindarle la capacidad de comprar, vender e intercambiar activos digitales a través de intercambios de terceros aprobados. Usted reconoce y acepta que cualquier transacción facilitada por Xucre Wallet que involucre activos digitales está sujeta a los términos y condiciones de estos intercambios de terceros. 4.2 Riesgo y responsabilidad: Xucre Wallet no garantiza la disponibilidad, precisión o puntualidad de los servicios de intercambio. Usted comprende y acepta que la compra, venta e intercambio de activos digitales implican riesgos inherentes y que usted es el único responsable de evaluar y asumir dichos riesgos. 5. NFT dentro de Xucre Wallet 5.1 Almacenamiento y administración de NFT: Xucre Wallet permite a los Usuarios almacenar y administrar NFT dentro de la billetera. Sin embargo, Xucre Wallet no respalda ni controla la creación, emisión o intercambio de NFT y no será responsable de ninguna transacción o disputa relacionada con NFT. 5.2 Mercado NFT: Xucre Wallet puede proporcionar acceso a mercados NFT dentro de la billetera. El uso de dichos mercados está sujeto a sus respectivos términos y condiciones, y Xucre Wallet no será responsable de la disponibilidad, legalidad o calidad de los NFT enumerados en estos mercados. 6. Soporte multilingüe 6.1 Opciones de idioma: Xucre Wallet está disponible en los idiomas español, portugués, inglés, quechua y náhuatl. Puede elegir el idioma preferido para su uso de la Monedero Xucre. 6.2 Discrepancias en la traducción: En caso de discrepancias entre las versiones en diferentes idiomas de estos Términos, prevalecerá la versión en español. 7. Propiedad Intelectual 7.1 Xucre Wallet: Xucre Wallet y sus logotipos asociados, marcas comerciales, derechos de autor y otros derechos de propiedad intelectual son propiedad de Xucre o sus licenciantes. No debe usar, modificar, reproducir, distribuir o crear trabajos derivados basados en Xucre Wallet o su contenido, a menos que Xucre lo autorice expresamente. 8. Terminación 8.1 Terminación por parte de Xucre Wallet: Xucre Wallet se reserva el derecho de suspender o cancelar su acceso a Xucre Wallet en cualquier momento, con o sin causa, sin previo aviso. 8.2 Efecto de la rescisión: al momento de la rescisión, usted acepta dejar de usar Xucre Wallet y reconoce que Xucre Wallet no será responsable ante usted ni ante terceros por los daños, pérdidas o responsabilidades que resulten de la rescisión. 9. Disposiciones generales 9.1 Acuerdo completo: estos Términos constituyen el acuerdo completo entre usted y Xucre Wallet con respecto a su uso de Xucre Wallet y reemplazan cualquier acuerdo, comunicación o entendimiento anterior. 9.2 Modificación: Xucre Wallet se reserva el derecho de modificar o actualizar estos Términos en cualquier momento a su entera discreción. Cualquier cambio será efectivo al publicar los Términos modificados en el sitio web de Xucre Wallet o dentro de la aplicación. 9.3 Ley aplicable y jurisdicción: Estos Términos se regirán e interpretarán de conformidad con las leyes de Ecuador. Cualquier disputa que surja de o en conexión con estos Términos será resuelta exclusivamente por los tribunales de Ecuador. 9.4 Divisibilidad: si alguna disposición de estos Términos se considera inválida o inaplicable, dicha disposición se interpretará en la mayor medida permitida por la ley aplicable, y las disposiciones restantes continuarán en pleno vigor y efecto. Al descargar, instalar y usar Xucre Wallet, usted reconoce que ha leído, entendido y aceptado estos Términos de servicio. ",
    button_Accept: "Aceptar",
    title: "Términos y condiciones",
    accept_terms: "Acepto los términos y condiciones"
  },
  Privacy: {
    title: "Política de privacidad",
    description: "Lea nuestra política de privacidad para comprender cómo recopilamos, usamos y protegemos su información personal cuando utiliza XucreWallet.",
    accept_button: "Aceptar",
    policy_acceptance_message: "Acepto la política de privacidad",
  },
};

export default values;