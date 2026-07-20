locals {
  ref_conditions = concat(
    [for ref in var.allowed_refs : "assertion.ref == '${ref}'"],
    var.allow_version_tags ? ["assertion.ref.startsWith('refs/tags/v')"] : [],
  )

  attribute_condition = join(" && ", [
    "assertion.repository_id == '${var.github_repository_id}'",
    "assertion.repository_owner_id == '${var.github_repository_owner_id}'",
    "assertion.environment == '${var.environment}'",
    "(${join(" || ", local.ref_conditions)})",
  ])
}

resource "google_iam_workload_identity_pool" "this" {
  project                   = var.project_id
  workload_identity_pool_id = var.pool_id
  display_name              = var.pool_display_name
  description               = "GitHub Actions identity pool for ${var.github_repository} (${var.environment})"
}

resource "google_iam_workload_identity_pool_provider" "github" {
  project                            = var.project_id
  workload_identity_pool_id          = google_iam_workload_identity_pool.this.workload_identity_pool_id
  workload_identity_pool_provider_id = var.provider_id
  display_name                       = "CMC ${var.environment} GitHub OIDC"
  description                        = "Repository and environment restricted GitHub OIDC provider"
  attribute_condition                = local.attribute_condition

  attribute_mapping = {
    "google.subject"                = "assertion.sub"
    "attribute.repository"          = "assertion.repository"
    "attribute.repository_id"       = "assertion.repository_id"
    "attribute.repository_owner_id" = "assertion.repository_owner_id"
    "attribute.environment"         = "assertion.environment"
    "attribute.ref"                 = "assertion.ref"
  }

  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }

  lifecycle {
    precondition {
      condition     = length(local.ref_conditions) > 0
      error_message = "At least one exact ref or version-tag access must be allowed."
    }
  }
}

resource "google_service_account" "deployer" {
  project      = var.project_id
  account_id   = var.service_account_id
  display_name = var.service_account_display_name
  description  = "Keyless GitHub Actions deployer for ${var.github_repository} (${var.environment})"
}

resource "google_service_account_iam_member" "workload_identity_user" {
  service_account_id = google_service_account.deployer.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/${google_iam_workload_identity_pool.this.name}/attribute.repository_id/${var.github_repository_id}"
}

resource "google_project_iam_member" "deployer_roles" {
  for_each = toset(var.project_roles)

  project = var.project_id
  role    = each.value
  member  = "serviceAccount:${google_service_account.deployer.email}"
}

resource "google_service_account_iam_member" "backend_service_account_user" {
  for_each = toset(var.backend_service_account_emails)

  service_account_id = "projects/${var.project_id}/serviceAccounts/${each.value}"
  role               = "roles/iam.serviceAccountUser"
  member             = "serviceAccount:${google_service_account.deployer.email}"
}
