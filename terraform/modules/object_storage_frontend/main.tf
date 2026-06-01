locals {
  bucket_labels = merge(var.tags, {
    bucket_role = "frontend-static"
  })
}

resource "ncloud_objectstorage_bucket" "this" {
  bucket_name = var.bucket_name
}
