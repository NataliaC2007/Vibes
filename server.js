const WebSocket = require('ws');
const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'chat-client',
  brokers: ['localhost:9092'], 
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'chat-group' });

const startKafkaProducer = async () => {
  await producer.connect();
};

const startKafkaConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'chat-messages', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      enviarMensagemParaTodos(message.value.toString());
    },
  });
};

startKafkaProducer().catch(console.error);
startKafkaConsumer().catch(console.error);

const server = new WebSocket.Server({ port: 3002 });
const clientes = new Map();

server.on('connection', (ws) => {
  let isRegistered = false;

  const askForUsername = () => {
    ws.send('Digite seu nome de usuário:');
  };

  askForUsername();

  ws.on('message', async (mensagem) => {
    if (!isRegistered) {
      if (Array.from(clientes.values()).includes(mensagem)) {
        ws.send('Nome de usuário já em uso. Por favor, escolha outro.');
        return;
      }

      clientes.set(ws, mensagem);
      isRegistered = true;
      enviarMensagemParaTodos(`${mensagem} entrou no chat!`);
      atualizarListaUsuarios();
    } else {
      enviarMensagemParaTodos(`${clientes.get(ws)}: ${mensagem}`);

      try {
        await producer.send({
          topic: 'chat-messages', 
          messages: [
            { value: `${clientes.get(ws)}: ${mensagem}` },
          ],
        });
        console.log('Mensagem enviada para o Kafka');
      } catch (error) {
        console.error('Erro ao enviar mensagem para o Kafka:', error);
      }
    }
  });

  ws.on('close', () => {
    const usuario = clientes.get(ws);
    if (usuario) {
      clientes.delete(ws);
      enviarMensagemParaTodos(`${usuario} saiu do chat.`);
      atualizarListaUsuarios();
    }
  });
});

function enviarMensagemParaTodos(mensagem) {
  clientes.forEach((_, cliente) => {
    if (cliente.readyState === WebSocket.OPEN) {
      cliente.send(mensagem);
    }
  });
}

function atualizarListaUsuarios() {
  const usuariosConectados = Array.from(clientes.values()).join(', ');
  enviarMensagemParaTodos(`Usuários conectados: ${usuariosConectados}`);
}
