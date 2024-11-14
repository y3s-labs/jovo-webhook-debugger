export const PLATFORM_ERROR_RESPONSE_MAP: Record<string, Record<string, any>> = {
  None: {
    error: `Connection Error: Your jovo webhook endpoint is not running. Please run 'jovo run'.`,
  },
  Alexa: {
    version: '1.0',
    response: {
      outputSpeech: {
        type: 'PlainText',
        text: `Connection Error: Your jovo webhook endpoint is not running. Please run 'jovo run'`,
      },
    },
  },
  GoogleActionConversationalAction: {
    scene: {
      next: {
        name: 'actions.scene.END_CONVERSATION',
      },
    },
    prompt: {
      firstSimple: {
        speech: `Connection Error: Your jovo webhook endpoint is not running. Please run 'jovo run'`,
      },
    },
  },
};

// 30 seconds right now
export const APP_REQUEST_TIMEOUT_IN_MS = 30000;
