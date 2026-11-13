import app from "./app";
import { checkDatabaseConnection } from "./config/database";

const PORT = Number(process.env.PORT ?? 5000);
const HOST = process.env.HOST?.trim();

async function startServer(): Promise<void> {
  try {
    await checkDatabaseConnection();

    const onListening = () => {
      console.log(`AFVR Resultados iniciado na porta ${PORT}${HOST ? ` em ${HOST}` : ""}`);
    };

    if (HOST) {
      app.listen(PORT, HOST, onListening);
    } else {
      app.listen(PORT, onListening);
    }
  } catch (error) {
    const message = error instanceof Error && error.message.trim()
      ? error.message
      : "Confirme que o PostgreSQL está iniciado e acessível na porta configurada.";

    console.error("Não foi possível ligar ao PostgreSQL:", message);
    process.exit(1);
  }
}

void startServer();