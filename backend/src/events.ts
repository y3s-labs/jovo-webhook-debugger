export enum SocketEvent {
  DebuggingAvailable = 'debugging.available',
  DebuggingUnavailable = 'debugging.unavailable',

  DebuggerRequest = 'debugger.request',
  DebuggerLanguageModelRequest = 'debugger.language-model-request',

  AppLanguageModelResponse = 'app.language-model-response',
  AppDebuggerConfigResponse = 'app.debugger-config-response',
  AppConsoleLog = 'app.console-log',
  AppRequest = 'app.request',
  AppResponse = 'app.response',
  AppJovoUpdate = 'app.jovo-update',
  AppStateMutation = 'app.state-mutation',

  ServerRequest = 'server.request',

  DashboardIncrementRequests = 'increment-requests',
  DashboardUpdateCount = 'update-count',
}

export enum LegacySocketEvent {
  DebuggingAvailable = 'readyToDebug',
  DebuggingUnavailable = 'notReadyToDebug',

  DebuggerRequest = 'sendRequest',
  DebuggerLanguageModelRequest = 'askForLanguageModelEmit',

  AppLanguageModelResponse = 'languageModelEmit',
  AppDebuggerConfigResponse = 'debuggerConfig',
  AppConsoleLog = 'consoleLog',
  AppRequest = 'requestEmit',
  AppResponse = 'responseEmit',

  WebhookRequest = 'request-{{id}}',
  WebhookResponse = 'response-{{id}}',
}
