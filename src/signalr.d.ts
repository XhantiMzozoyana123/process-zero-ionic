declare module 'signalr' {
  export interface HubConnection {
    start(): Promise<void>;
    stop(): Promise<void>;
    on(method: string, ...args: any[]): void;
    invoke(method: string, ...args: any[]): Promise<void>;
    connectionState: HubConnectionState;
  }

  export interface HubConnectionBuilder {
    withUrl(url: string, options?: HubConnectionOptions): HubConnectionBuilder;
    withAutomaticReconnect(): HubConnectionBuilder;
    build(): HubConnection;
  }

  export interface HubConnectionOptions {
    accessTokenFactory?: () => string;
  }

  export enum HubConnectionState {
    Connected = 'Connected',
    Disconnected = 'Disconnected',
    Connecting = 'Connecting',
    Reconnecting = 'Reconnecting'
  }

  export const signalR: {
    HubConnectionBuilder: new () => HubConnectionBuilder;
  };
}