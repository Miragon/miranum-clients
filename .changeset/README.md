# Changesets

This folder is managed by [Changesets](https://github.com/changesets/changesets).

To record a change for release, run:

```bash
pnpm changeset
```

Pick the affected package(s) and a semver bump (patch/minor/major), then write a
short summary. Commit the generated file in `.changeset/`. When your PR merges to
`main`, the release workflow opens a "Version Packages" PR that applies the bumps
and updates changelogs; merging **that** PR publishes to npm.
