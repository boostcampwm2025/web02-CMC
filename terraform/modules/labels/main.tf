locals {
  name_prefix = "${var.project}-${var.environment}-${var.component}"

  default_tags = {
    project     = var.project
    environment = var.environment
    component   = var.component
    managed_by  = "terraform"
  }

  merged_tags = merge(local.default_tags, var.extra_tags)
}

