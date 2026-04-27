import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import { Plugin } from "../types/plugin.js";
import { loadConfig } from "./config-manager.js";

export interface PluginInfo {
  id: string;
  path: string;
  plugin: Plugin;
}

export function loadPlugins(): PluginInfo[] {
  const config = loadConfig();
  const pluginPath = config.pluginPath;

  if (!fs.existsSync(pluginPath)) {
    return [];
  }

  try {
    const stat = fs.statSync(pluginPath);
    if (!stat.isDirectory()) {
      console.error(`Warning: Plugin path is not a directory: ${pluginPath}`);
      return [];
    }
  } catch {
    console.error(`Warning: Cannot access plugin path: ${pluginPath}`);
    return [];
  }

  const entries = fs.readdirSync(pluginPath, { withFileTypes: true });
  const plugins: PluginInfo[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const pluginDir = path.join(pluginPath, entry.name);
    const pluginYamlPath = path.join(pluginDir, "plugin.yaml");

    if (fs.existsSync(pluginYamlPath)) {
      try {
        const content = fs.readFileSync(pluginYamlPath, "utf-8");
        const plugin = yaml.load(content) as Plugin;

        if (plugin.name) {
          plugins.push({
            id: plugin.name,
            path: pluginDir,
            plugin,
          });
        }
      } catch (e) {
        console.error(`Failed to load plugin from ${pluginDir}: ${e}`);
      }
    }
  }

  return plugins;
}

export function getPlugin(id: string): PluginInfo | undefined {
  const plugins = loadPlugins();
  return plugins.find((p) => p.id === id);
}