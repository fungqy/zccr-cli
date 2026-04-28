import { Command } from "commander";
import { loadConfig } from "../lib/config-manager.js";

interface RcpClient {
  connected: boolean;
  robot_id: string;
  remote_address: string;
}

interface RcpResponse {
  code: number;
  message: string;
  data: {
    client_count: number;
    clients: RcpClient[];
  };
}

export function createListRobotsCommand(): Command {
  const cmd = new Command("list-robots");
  cmd.description("List all robots from RCP service");

  cmd.action(async () => {
    const config = loadConfig();

    if (!config.rcpApiKey) {
      console.error("Error: RCP API key not set. Run 'zccr config --set-rcp-apikey <apiKey>' first.");
      process.exit(1);
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/v1/robot/clients", {
        method: "GET",
        headers: {
          "X-API-Key": config.rcpApiKey,
        },
      });

      if (!response.ok) {
        console.error(`Error: RCP API returned status ${response.status}`);
        process.exit(1);
      }

      const data = (await response.json()) as RcpResponse;

      if (data.code !== 200) {
        console.error(`Error: RCP API returned code ${data.code}: ${data.message}`);
        process.exit(1);
      }

      console.log(`Total robots: ${data.data.client_count}\n`);
      console.log("Connected robots:");
      for (const client of data.data.clients) {
        const status = client.connected ? "online" : "offline";
        console.log(`  - ${client.robot_id} (${status}) - ${client.remote_address}`);
      }
    } catch (err) {
      console.error(`Error: Failed to connect to RCP service: ${(err as Error).message}`);
      process.exit(1);
    }
  });

  return cmd;
}
