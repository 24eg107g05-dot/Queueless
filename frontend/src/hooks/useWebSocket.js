import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export function useWebSocket(serviceId, onMessage) {
  const clientRef = useRef(null);
  
  useEffect(() => {
    if (!serviceId) return;
    
    const client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      onConnect: () => {
        client.subscribe(`/topic/queue/${serviceId}`, (message) => {
          if (message.body) {
            const data = JSON.parse(message.body);
            onMessage(data);
          }
        });
      },
      reconnectDelay: 5000,
    });
    
    client.activate();
    clientRef.current = client;
    
    return () => client.deactivate();
  }, [serviceId, onMessage]);
}
