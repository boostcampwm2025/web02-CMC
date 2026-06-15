locals {
  redis_tags = merge(var.tags, {
    cache_engine = "redis"
    cache_mode   = var.mode
  })

  managed = var.mode == "managed"
}

resource "ncloud_redis_config_group" "this" {
  count = local.managed ? 1 : 0

  name          = substr(var.name, 0, 15)
  redis_version = var.redis_version
  description   = "Managed by Terraform for ${var.project}-${var.environment}"
}

resource "ncloud_redis" "this" {
  count = local.managed ? 1 : 0

  service_name        = substr(var.name, 0, 15)
  server_name_prefix  = substr(var.name, 0, 15)
  vpc_no              = var.vpc_no
  subnet_no           = var.subnet_no
  config_group_no     = ncloud_redis_config_group.this[0].id
  mode                = "SIMPLE"
  engine_version_code = var.engine_version_code
  product_code        = var.product_code
  is_ha               = var.is_ha
  is_backup           = var.is_backup
}
