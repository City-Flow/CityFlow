# cityFlow/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer

class AlertConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.user = self.scope["user"]
        self.groups_joined = ["alerts"]
        for g in self.groups_joined:
            await self.channel_layer.group_add(g, self.channel_name)
        await self.accept()
        await self.send(text_data=json.dumps({
            "type": "connection.established",
            "user": str(self.user) if self.user.is_authenticated else "anonymous",
        }))
        print(f"🟢 [CONSUMER] Nuevo cliente conectado: {self.channel_name}")

    async def disconnect(self, close_code):
        for g in getattr(self, "groups_joined", []):
            await self.channel_layer.group_discard(g, self.channel_name)
        print(f"🔴 [CONSUMER] Cliente desconectado: {self.channel_name}")

    async def alert_message(self, event):
        print(f"📥 [CONSUMER] Mensaje recibido en el consumidor para reenviar al navegador: {event['payload']}")
        await self.send(text_data=json.dumps(event["payload"]))