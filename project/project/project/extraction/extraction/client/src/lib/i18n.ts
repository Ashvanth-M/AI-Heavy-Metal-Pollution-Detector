import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  en: {
    translation: {
      // Common UI elements
      "loading": "Loading...",
      "error": "Error",
      "success": "Success",
      "cancel": "Cancel",
      "save": "Save",
      "delete": "Delete",
      "edit": "Edit",
      "close": "Close",
      "back": "Back",
      "next": "Next",
      "previous": "Previous",
      "search": "Search",
      "filter": "Filter",
      "export": "Export",
      "import": "Import",
      "upload": "Upload",
      "download": "Download",
      
      // AI Assistant
      "ai": {
        "title": "AI Water Quality Assistant",
        "description": "Ask questions about water quality data and analysis",
        "placeholder": "Ask about HMPI, heavy metals, or water quality...",
        "welcome": "Hello! I'm your HMPI (Heavy Metal Pollution Index) assistant. You can ask me about HMPI calculations, health impacts, risk categories, specific heavy metals, or mitigation strategies. How can I help you today?",
        "error": "Sorry, I encountered an error while processing your request. Please try again.",
        "thinking": "Thinking...",
        "send": "Send"
      },
      
      // Water Quality Categories
      "categories": {
        "safe": "Safe",
        "moderate": "Moderate",
        "critical": "Critical"
      },
      
      // Heavy Metals
      "metals": {
        "lead": "Lead",
        "cadmium": "Cadmium", 
        "arsenic": "Arsenic",
        "mercury": "Mercury",
        "chromium": "Chromium",
        "nickel": "Nickel",
        "zinc": "Zinc",
        "copper": "Copper"
      },
      
      // Dashboard
      "dashboard": {
        "title": "Dashboard",
        "overview": "Overview",
        "samples": "Samples",
        "map": "Map View",
        "reports": "Reports",
        "assistant": "AI Assistant"
      }
    }
  },
  es: {
    translation: {
      // Common UI elements
      "loading": "Cargando...",
      "error": "Error",
      "success": "Éxito",
      "cancel": "Cancelar",
      "save": "Guardar",
      "delete": "Eliminar",
      "edit": "Editar",
      "close": "Cerrar",
      "back": "Atrás",
      "next": "Siguiente",
      "previous": "Anterior",
      "search": "Buscar",
      "filter": "Filtrar",
      "export": "Exportar",
      "import": "Importar",
      "upload": "Subir",
      "download": "Descargar",
      
      // AI Assistant
      "ai": {
        "title": "Asistente de IA para Calidad del Agua",
        "description": "Haga preguntas sobre datos y análisis de calidad del agua",
        "placeholder": "Pregunte sobre HMPI, metales pesados o calidad del agua...",
        "welcome": "¡Hola! Soy tu asistente HMPI (Índice de Contaminación por Metales Pesados). Puedes preguntarme sobre cálculos HMPI, impactos en la salud, categorías de riesgo, metales pesados específicos o estrategias de mitigación. ¿Cómo puedo ayudarte hoy?",
        "error": "Lo siento, encontré un error al procesar tu solicitud. Por favor, inténtalo de nuevo.",
        "thinking": "Pensando...",
        "send": "Enviar"
      },
      
      // Water Quality Categories
      "categories": {
        "safe": "Seguro",
        "moderate": "Moderado",
        "critical": "Crítico"
      },
      
      // Heavy Metals
      "metals": {
        "lead": "Plomo",
        "cadmium": "Cadmio",
        "arsenic": "Arsénico",
        "mercury": "Mercurio",
        "chromium": "Cromo",
        "nickel": "Níquel",
        "zinc": "Zinc",
        "copper": "Cobre"
      },
      
      // Dashboard
      "dashboard": {
        "title": "Panel de Control",
        "overview": "Resumen",
        "samples": "Muestras",
        "map": "Vista del Mapa",
        "reports": "Informes",
        "assistant": "Asistente de IA"
      }
    }
  },
  fr: {
    translation: {
      // Common UI elements
      "loading": "Chargement...",
      "error": "Erreur",
      "success": "Succès",
      "cancel": "Annuler",
      "save": "Enregistrer",
      "delete": "Supprimer",
      "edit": "Modifier",
      "close": "Fermer",
      "back": "Retour",
      "next": "Suivant",
      "previous": "Précédent",
      "search": "Rechercher",
      "filter": "Filtrer",
      "export": "Exporter",
      "import": "Importer",
      "upload": "Télécharger",
      "download": "Télécharger",
      
      // AI Assistant
      "ai": {
        "title": "Assistant IA pour la Qualité de l'Eau",
        "description": "Posez des questions sur les données et analyses de qualité de l'eau",
        "placeholder": "Demandez à propos de HMPI, métaux lourds, ou qualité de l'eau...",
        "welcome": "Bonjour ! Je suis votre assistant HMPI (Indice de Pollution par Métaux Lourds). Vous pouvez me poser des questions sur les calculs HMPI, les impacts sur la santé, les catégories de risque, les métaux lourds spécifiques ou les stratégies d'atténuation. Comment puis-je vous aider aujourd'hui ?",
        "error": "Désolé, j'ai rencontré une erreur lors du traitement de votre demande. Veuillez réessayer.",
        "thinking": "Réflexion...",
        "send": "Envoyer"
      },
      
      // Water Quality Categories
      "categories": {
        "safe": "Sûr",
        "moderate": "Modéré",
        "critical": "Critique"
      },
      
      // Heavy Metals
      "metals": {
        "lead": "Plomb",
        "cadmium": "Cadmium",
        "arsenic": "Arsenic",
        "mercury": "Mercure",
        "chromium": "Chrome",
        "nickel": "Nickel",
        "zinc": "Zinc",
        "copper": "Cuivre"
      },
      
      // Dashboard
      "dashboard": {
        "title": "Tableau de Bord",
        "overview": "Aperçu",
        "samples": "Échantillons",
        "map": "Vue Carte",
        "reports": "Rapports",
        "assistant": "Assistant IA"
      }
    }
  },
  hi: {
    translation: {
      // Common UI elements
      "loading": "लोड हो रहा है...",
      "error": "त्रुटि",
      "success": "सफलता",
      "cancel": "रद्द करें",
      "save": "सहेजें",
      "delete": "हटाएं",
      "edit": "संपादित करें",
      "close": "बंद करें",
      "back": "वापस",
      "next": "अगला",
      "previous": "पिछला",
      "search": "खोजें",
      "filter": "फ़िल्टर",
      "export": "निर्यात",
      "import": "आयात",
      "upload": "अपलोड",
      "download": "डाउनलोड",
      
      // AI Assistant
      "ai": {
        "title": "जल गुणवत्ता AI सहायक",
        "description": "जल गुणवत्ता डेटा और विश्लेषण के बारे में प्रश्न पूछें",
        "placeholder": "HMPI, भारी धातुओं, या जल गुणवत्ता के बारे में पूछें...",
        "welcome": "नमस्ते! मैं आपका HMPI (भारी धातु प्रदूषण सूचकांक) सहायक हूं। आप मुझसे HMPI गणना, स्वास्थ्य प्रभाव, जोखिम श्रेणियां, विशिष्ट भारी धातुओं, या शमन रणनीतियों के बारे में पूछ सकते हैं। आज मैं आपकी कैसे मदद कर सकता हूं?",
        "error": "क्षमा करें, आपके अनुरोध को संसाधित करते समय मुझे एक त्रुटि का सामना करना पड़ा। कृपया पुनः प्रयास करें।",
        "thinking": "सोच रहा हूं...",
        "send": "भेजें"
      },
      
      // Water Quality Categories
      "categories": {
        "safe": "सुरक्षित",
        "moderate": "मध्यम",
        "critical": "गंभीर"
      },
      
      // Heavy Metals
      "metals": {
        "lead": "सीसा",
        "cadmium": "कैडमियम",
        "arsenic": "आर्सेनिक",
        "mercury": "पारा",
        "chromium": "क्रोमियम",
        "nickel": "निकल",
        "zinc": "जस्ता",
        "copper": "तांबा"
      },
      
      // Dashboard
      "dashboard": {
        "title": "डैशबोर्ड",
        "overview": "अवलोकन",
        "samples": "नमूने",
        "map": "मानचित्र दृश्य",
        "reports": "रिपोर्ट",
        "assistant": "AI सहायक"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    
    interpolation: {
      escapeValue: false, // React already does escaping
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;