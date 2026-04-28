import fs from "fs";
import path from "path";
import os from "os";
import { spawn } from "child_process";

const CONFIG_DIR = ".zccr";
const CONFIG_FILE = "config.json";

interface Config {
  pluginPath: string;
  pythonInterpreter: string;
  rcpApiKey: string;
}

function getConfigPath(): string {
  return path.join(os.homedir(), CONFIG_DIR, CONFIG_FILE);
}

function getConfigDir(): string {
  return path.join(os.homedir(), CONFIG_DIR);
}

export function getDefaultPluginPath(): string {
  return path.join(os.homedir(), "zccr_plugins");
}

export function loadConfig(): Config {
  const configPath = getConfigPath();

  if (!fs.existsSync(configPath)) {
    return {
      pluginPath: getDefaultPluginPath(),
      pythonInterpreter: "",
      rcpApiKey: "",
    };
  }

  try {
    const content = fs.readFileSync(configPath, "utf-8");
    const config = JSON.parse(content) as Config;

    return {
      pluginPath: config.pluginPath || getDefaultPluginPath(),
      pythonInterpreter: config.pythonInterpreter || "",
      rcpApiKey: config.rcpApiKey || "",
    };
  } catch {
    return {
      pluginPath: getDefaultPluginPath(),
      pythonInterpreter: "",
      rcpApiKey: "",
    };
  }
}

export function saveConfig(config: Config): void {
  const dir = getConfigDir();
  const configPath = getConfigPath();

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

export function setPluginPath(pluginPath: string): void {
  if (!fs.existsSync(pluginPath)) {
    throw new Error(`Plugin path not found: ${pluginPath}`);
  }
  if (!fs.statSync(pluginPath).isDirectory()) {
    throw new Error(`Plugin path is not a directory: ${pluginPath}`);
  }
  const config = loadConfig();
  config.pluginPath = pluginPath;
  saveConfig(config);
}

export function setPythonInterpreter(pythonInterpreter: string): void {
  if (!fs.existsSync(pythonInterpreter)) {
    throw new Error(`Python interpreter not found: ${pythonInterpreter}`);
  }

  return new Promise<void>((resolve, reject) => {
    const proc = spawn(pythonInterpreter, ["--version"]);
    let stderr = "";
    let stdout = "";
    proc.stdout?.on("data", (data) => {
      stdout += data.toString();
    });
    proc.stderr?.on("data", (data) => {
      stderr += data.toString();
    });
    proc.on("close", (code) => {
      const output = (stdout + stderr).toLowerCase();
      if (code === 0 && output.includes("python")) {
        const config = loadConfig();
        config.pythonInterpreter = pythonInterpreter;
        saveConfig(config);
        resolve();
      } else {
        reject(new Error(`Invalid Python interpreter: ${pythonInterpreter}\n${stderr || stdout}`));
      }
    });
    proc.on("error", (err) => {
      reject(new Error(`Failed to execute Python interpreter: ${err.message}`));
    });
  }) as unknown as void;
}

export function setRcpApiKey(apiKey: string): void {
  const config = loadConfig();
  config.rcpApiKey = apiKey;
  saveConfig(config);
}