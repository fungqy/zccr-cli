import { Command } from "commander";
import { spawn } from "child_process";
import { loadConfig } from "../lib/config-manager.js";

interface RobotClient {
  robot_id: string;
  remote_address: string;
  connected: boolean;
}

export function createListRobotsCommand(): Command {
  const cmd = new Command("list-robots");
  cmd.description("List all robots by running the list_robots.py script");

  cmd.action(async () => {
    const config = loadConfig();

    if (!config.pythonInterpreter) {
      console.error("Error: Python interpreter not configured. Run 'zccr config --set-python-interpreter <path>' first.");
      process.exit(1);
    }

    // 获取 rcp_server 包的位置
    const rcpServerPath = await getRcpServerPath(config.pythonInterpreter);
    if (!rcpServerPath) {
      console.error("Error: rcp_server package not found.");
      process.exit(1);
    }

    const scriptContent = `
import asyncio
import json
import sys
sys.path.insert(0, '${rcpServerPath}')

from rcp_server import RobotControl

async def list_robots():
    robot_control = RobotControl()
    await robot_control.wait_ready()
    await asyncio.sleep(3)
    clients = await robot_control.list_robots()
    print(json.dumps(clients))
    await robot_control.close()

asyncio.run(list_robots())
`;

    const scriptPath = '/tmp/list_robots_temp.py';

    // 将脚本写入临时文件
    const fs = await import('fs');
    fs.writeFileSync(scriptPath, scriptContent);

    // 执行脚本
    const proc = spawn(config.pythonInterpreter, [scriptPath]);

    let stdout = "";
    let stderr = "";

    proc.stdout?.on("data", (data) => {
      stdout += data.toString();
    });

    proc.stderr?.on("data", (data) => {
      stderr += data.toString();
    });

    proc.on("close", (code) => {
      if (code !== 0) {
        console.error(`Error: Script failed with code ${code}`);
        if (stderr) console.error(stderr);
        process.exit(1);
      }

      try {
        const response = JSON.parse(stdout.trim());
        if (response.code !== 200) {
          console.error(`Error: ${response.message}`);
          process.exit(1);
        }
        const clients = response.data.clients as RobotClient[];
        console.log(`Total robots: ${response.data.client_count}\n`);
        console.log("Connected robots:");
        for (const client of clients) {
          const status = client.connected ? "online" : "offline";
          console.log(`  - ${client.robot_id} (${status}) - ${client.remote_address}`);
        }
      } catch (err) {
        console.error("Error: Failed to parse robot list");
        console.error(stdout);
        process.exit(1);
      }
    });

    proc.on("error", (err) => {
      console.error(`Error: Failed to execute script: ${err.message}`);
      process.exit(1);
    });
  });

  return cmd;
}

async function getRcpServerPath(pythonInterpreter: string): Promise<string | null> {
  const { execSync } = await import('child_process');
  try {
    const result = execSync(`${pythonInterpreter} -c "import rcp_server; print(rcp_server.__path__[0])"`, {
      encoding: 'utf-8',
    });
    return result.trim();
  } catch {
    return null;
  }
}
