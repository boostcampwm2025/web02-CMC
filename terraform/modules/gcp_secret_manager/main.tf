locals {
  accessor_bindings = {
    for pair in setproduct(var.secret_ids, var.accessor_members) :
    "${pair[0]}:${pair[1]}" => {
      secret_id = pair[0]
      member    = pair[1]
    }
  }
}

resource "google_secret_manager_secret" "this" {
  for_each = toset(var.secret_ids)

  project   = var.project_id
  secret_id = each.value
  labels    = var.labels

  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_iam_member" "accessor" {
  for_each = local.accessor_bindings

  project   = var.project_id
  secret_id = google_secret_manager_secret.this[each.value.secret_id].id
  role      = "roles/secretmanager.secretAccessor"
  member    = each.value.member
}
