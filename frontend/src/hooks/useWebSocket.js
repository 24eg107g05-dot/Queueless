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
            try {
              const data = JSON.parse(message.body);
              onMessage(data);
            } catch (e) {
              onMessage(message.body);
            }
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

export function useServingWebSocket(onMessage) {
  const clientRef = useRef(null);

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      onConnect: () => {
        client.subscribe('/topic/serving', (message) => {
          if (message.body) {
            try {
              const data = JSON.parse(message.body);
              onMessage(data);
            } catch (e) {
              onMessage(message.body);
            }
          }
        });
      },
      reconnectDelay: 5000,
    });

    client.activate();
    clientRef.current = client;

    return () => client.deactivate();
  }, [onMessage]);
}
