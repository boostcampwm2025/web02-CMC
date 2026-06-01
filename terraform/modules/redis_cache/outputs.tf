output "name" {
  value = var.name
}

output "mode" {
  value = var.mode
}

output "subnet_name" {
  value = var.subnet_name
}

output "redis_id" {
  value = try(ncloud_redis.this[0].id, null)
}

output "private_domain" {
  value = null
}

output "tags" {
  value = local.redis_tags
}
