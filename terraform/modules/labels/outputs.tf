output "name_prefix" {
  description = "Standardized name prefix."
  value       = local.name_prefix
}

output "tags" {
  description = "Merged tags to reuse across resources."
  value       = local.merged_tags
}

