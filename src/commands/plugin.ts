import { Command } from "commander";
import yaml from "js-yaml";
import { loadPlugins } from "../lib/plugin-loader.js";
import { executePlugin } from "../lib/plugin-executor.js";
import { ParameterProperty } from "../types/plugin.js";

export function createPluginCommands(): Command[] {
    const plugins = loadPlugins();
    const commands: Command[] = [];

    for (const pluginInfo of plugins) {
        const cmd = new Command(pluginInfo.id);

        cmd.description(getPluginDescription(pluginInfo.plugin));

        cmd.option("--info", "Show plugin info (name, version, description, tags)");
        cmd.option("--param", "Show parameters");
        cmd.option("--return", "Show returns");
        cmd.option("--detail", "Show full plugin info (The full content of plugin.yaml)");
        cmd.option("--run [params]", "Execute the plugin with JSON parameters");

        cmd.action((opts) => {
            if (opts.detail) {
                console.log(yaml.dump(pluginInfo.plugin));
                return;
            }

            if (opts.run !== undefined) {
                runPlugin(pluginInfo, opts.run).then((result) => {
                    if (!result.success) {
                        console.error(result.stderr);
                        process.exit(result.exitCode ?? 1);
                    }
                    console.log(result.stdout);
                    process.exit(0);
                });
                return;
            }

            if (opts.info) {
                printPluginInfo(pluginInfo);
                return;
            }

            if (opts.param) {
                printPluginParams(pluginInfo);
                return;
            }

            if (opts.return) {
                printPluginReturn(pluginInfo);
                return;
            }

            // Default: show info
            printPluginInfo(pluginInfo);
        });

        commands.push(cmd);
    }

    return commands;
}

export function createListPluginsCommand(): Command {
    const cmd = new Command("list-plugins");
    cmd.description("List all available plugins");

    cmd.action(() => {
        const plugins = loadPlugins();
        if (plugins.length === 0) {
            console.log("No plugins found.");
            return;
        }

        console.log("Available plugins:\n");
        for (const pluginInfo of plugins) {
            const plugin = pluginInfo.plugin;
            const name = plugin.name || pluginInfo.id;
            const desc = getPluginDescription(plugin);
            console.log(`  ${name}`);
            console.log(`    ${desc}\n`);
        }
    });

    return cmd;
}

function getPluginDescription(
    plugin: ReturnType<typeof yaml.load>,
): string {
    if (
        typeof plugin === "object" &&
        plugin !== null &&
        "description" in plugin
    ) {
        return String(plugin.description).split("\n")[0];
    }
    return "Plugin command";
}

function formatProperty(prop: ParameterProperty, indent: string): string {
    const lines: string[] = [];
    lines.push(`${indent}type: ${prop.type}`);
    if (prop.description) {
        lines.push(`${indent}description: ${prop.description}`);
    }
    if (prop.default !== undefined) {
        lines.push(`${indent}default: ${JSON.stringify(prop.default)}`);
    }
    if (prop.minimum !== undefined) {
        lines.push(`${indent}minimum: ${prop.minimum}`);
    }
    if (prop.maximum !== undefined) {
        lines.push(`${indent}maximum: ${prop.maximum}`);
    }
    return lines.join("\n");
}

function printPluginInfo(
    pluginInfo: ReturnType<typeof loadPlugins>[number],
): void {
    const plugin = pluginInfo.plugin;
    console.log(`Plugin: ${plugin.name}`);
    console.log(`ID: ${plugin.id}`);
    console.log(`Version: ${plugin.version}`);
    console.log(`Description:\n${plugin.description}`);
    if (plugin.category) {
        console.log(`Category: ${plugin.category}`);
    }
}

function printPluginParams(
    pluginInfo: ReturnType<typeof loadPlugins>[number],
): void {
    const plugin = pluginInfo.plugin;
    if (plugin.parameters && plugin.parameters.properties) {
        console.log("Parameters:");
        const params = plugin.parameters;
        const required = params.required || [];
        for (const [name, prop] of Object.entries(params.properties)) {
            const reqMark = required.includes(name)
                ? " (required)"
                : " (optional)";
            console.log(`\n  ${name}${reqMark}`);
            console.log(formatProperty(prop, "    "));
        }
    }
}

function printPluginReturn(
    pluginInfo: ReturnType<typeof loadPlugins>[number],
): void {
    const plugin = pluginInfo.plugin;
    if (plugin.returns && plugin.returns.properties) {
        console.log("Returns:");
        for (const [name, prop] of Object.entries(plugin.returns.properties)) {
            console.log(`  ${name}:`);
            console.log(formatProperty(prop as ParameterProperty, "    "));
        }
    }
}

async function runPlugin(
    pluginInfo: ReturnType<typeof loadPlugins>[number],
    paramsJson?: string,
): Promise<{
    success: boolean;
    stdout: string;
    stderr: string;
    exitCode: number | null;
}> {
    return executePlugin(
        pluginInfo,
        paramsJson === "" ? undefined : paramsJson,
    );
}