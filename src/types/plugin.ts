export interface Plugin {
  id: string;
  version: string;
  name: string;
  description: string;
  usage?: string;
  category?: string;
  tags?: string[];
  execution: Execution;
  parameters: Parameters;
  returns: Returns;
  constraints?: Constraints;
  dependencies?: Dependencies;
  examples?: Example[];
  metadata?: Metadata;
  agent_compatibility?: AgentCompatibility;
  env_config?: EnvConfig;
}

export interface Execution {
  type: "robot_native" | "external_api" | "custom_package";
  entry: string;
  async?: boolean;
  timeout?: number;
  retry?: number;
  protocol?: string;
  method?: string;
  endpoint?: string;
  auth?: Auth;
  runtime?: string;
  sandbox?: boolean;
  polling_plugin_id?: string;
}

export interface Auth {
  type: "bearer" | "api_key" | "basic" | "none";
  secret_ref?: string;
}

export interface Parameters {
  type: "object";
  required?: string[];
  properties: Record<string, ParameterProperty>;
  additionalProperties?: boolean;
}

export interface ParameterProperty {
  type: string;
  description?: string;
  default?: unknown;
  minimum?: number;
  maximum?: number;
  properties?: Record<string, ParameterProperty>;
}

export interface Returns {
  type: string;
  properties?: Record<string, unknown>;
}

export interface Constraints {
  pre_conditions?: PreCondition[];
  post_conditions?: string[];
  failure_conditions?: string[];
}

export interface PreCondition {
  expr: string;
  error_code: string;
  suggestion: string;
}

export interface Dependencies {
  python?: string[];
  system?: string[];
  ros2?: string[];
}

export interface Example {
  name: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
}

export interface Metadata {
  author?: string;
  created_at?: string;
  updated_at?: string;
  capabilities?: string[];
  compatible_hardware?: string[];
  idempotent?: boolean;
}

export interface AgentCompatibility {
  tool_name: string;
  tool_description: string;
  parameter_descriptions?: Record<string, string>;
  usage_tips_for_llm?: string[];
  platforms?: Record<string, unknown>;
}

export interface EnvConfig {
  description?: string;
  parameters?: Parameters;
}