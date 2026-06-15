locals {
  observability_tags = merge(var.tags, {
    observability_mode = var.mode
  })
}

# TODO:
# - If observability stays on the nginx/backend host, treat this module as documentation and outputs only
# - If the team separates monitoring later, replace this with a dedicated node or managed monitoring resources
