export function isMultiTenantSchemaEnabled() {
  return process.env.ENABLE_MULTI_TENANT_SCHEMA === "true";
}
