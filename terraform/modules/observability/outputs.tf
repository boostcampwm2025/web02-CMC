output "name" {
  value = var.name
}

output "mode" {
  value = var.mode
}

output "components" {
  value = var.components
}

output "tags" {
  value = local.observability_tags
}
