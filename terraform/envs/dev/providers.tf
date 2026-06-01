provider "ncloud" {
  region      = "KR"
  site        = "public"
  support_vpc = true

  # Credentials are expected from environment variables or a local override file
  # excluded from version control.
}
