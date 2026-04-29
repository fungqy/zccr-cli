import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { PluginInfo } from "./plugin-loader.js";
import { loadConfig } from "./config-manager.js";

export interface ExecutionResult {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number | null;
}

export async function executePlugin(
  pluginInfo: PluginInfo,
  paramsJson?: string
): Promise<ExecutionResult> {
  const config = loadConfig();

  if (!config.pythonInterpreter) {
    return {
      success: false,
      stdout: "",
      stderr: "Python interpreter not configured. Run: zccr config --set-python-interpreter <path>",
      exitCode: null,
    };
  }

  const pluginDir = pluginInfo.path;
  const entryPath = pluginInfo.plugin.execution?.entry;

  if (!entryPath) {
    return {
      success: false,
      stdout: "",
      stderr: `No entry point configured for plugin '${pluginInfo.id}'`,
      exitCode: null,
    };
  }

  const scriptToRun = path.join(pluginDir, entryPath);

  if (!fs.existsSync(scriptToRun)) {
    return {
      success: false,
      stdout: "",
      stderr: `Script not found: ${scriptToRun}`,
      exitCode: null,
    };
  }

  return new Promise((resolve) => {
    const proc = spawn(config.pythonInterpreter, [scriptToRun], {
      cwd: pluginDir,
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    proc.stdout?.on("data", (data) => {
      stdout += data.toString();
    });

    proc.stderr?.on("data", (data) => {
      stderr += data.toString();
    });

    proc.on("close", (code) => {
      resolve({
        success: code === 0,
        stdout,
        stderr,
        exitCode: code,
      });
    });

    proc.on("error", (err) => {
      resolve({
        success: false,
        stdout: "",
        stderr: err.message,
        exitCode: null,
      });
    });

    if (paramsJson) {
      const request = JSON.stringify({ parameters: JSON.parse(paramsJson) });
      proc.stdin?.write(request);
    }
    proc.stdin?.end();
  });
}