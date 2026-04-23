import { Command } from "commander";
import {
  loadConfig,
  setPluginPath,
  setPythonInterpreter,
  getDefaultPluginPath,
} from "../lib/config-manager.js";

export function createConfigCommand(): Command {
  const cmd = new Command("config");
  cmd.description("View and modify zccr configuration");

  cmd
    .option("--set-plugin-path <path>", "Set the plugin directory path")
    .option("--set-python-interpreter <path>", "Set the Python interpreter absolute path")
    .action(async (options) => {
      const hasSetOption = options.setPluginPath || options.setPythonInterpreter;

      if (!hasSetOption) {
        const config = loadConfig();
        console.log("Current configuration:");
        console.log(`  pluginPath: ${config.pluginPath || getDefaultPluginPath()}`);
        console.log(`  pythonInterpreter: ${config.pythonInterpreter || "(not set)"}`);
      }

      if (options.setPluginPath) {
        try {
          setPluginPath(options.setPluginPath);
          console.log(`Plugin path set to: ${options.setPluginPath}`);
        } catch (err) {
          console.error(`Error: ${(err as Error).message}`);
          process.exit(1);
        }
      }
      if (options.setPythonInterpreter) {
        try {
          await setPythonInterpreter(options.setPythonInterpreter);
          console.log(`Python interpreter set to: ${options.setPythonInterpreter}`);
        } catch (err) {
          console.error(`Error: ${(err as Error).message}`);
          process.exit(1);
        }
      }
    });

  return cmd;
}