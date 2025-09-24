class WebSocketService {
  connect(): void {
    console.log('WebSocket disabled');
  }

  disconnect(): void {
    // No-op
  }

  emit(): void {
    // No-op
  }

  emitDriverLocation(): void {
    // No-op
  }

  isConnected(): boolean {
    return false;
  }
}

export const wsService = new WebSocketService();