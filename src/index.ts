#!/usr/bin/env node

import { Command } from "commander";
import { createConfigCommand } from "./commands/config.js";
import { createPluginCommands } from "./commands/plugin.js";

const program = new Command();

program
    .name("zccr")
    .description(
        "This is a command-line tool for operatin robots via OpenClaw .",
    )
    .version("1.0.0");

program.addCommand(createConfigCommand());

const pluginCommands = createPluginCommands();
for (const cmd of pluginCommands) {
    program.addCommand(cmd);
}

program.parse();
