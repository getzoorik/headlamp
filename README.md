<p align="center">
  <img alt="Zoorik. Reduce cloud cost, autonomously." src=".github/brand/zoorik-reveal-tagline-banner-on-navy-960x240.gif" width="100%">
</p>

# Zoorik's plugins for Headlamp

Plugins for [Headlamp](https://headlamp.dev), the Kubernetes web UI, from Zoorik. This repository holds
plugins, not Headlamp itself.

## Coral

[`coral/`](coral) shows [Zoorik Coral](https://zoorik.com/coral)'s recommendations inside Headlamp.

- **Coral** in the sidebar lists every workload Coral has a recommendation for: its policy, whether
  Coral applies it automatically or only shows it (and why), how many pods already run at the new
  size, and where the rollout stands.
- On a Deployment, StatefulSet, DaemonSet, Job, CronJob or Argo Rollout page, a **Coral** section shows
  each container's CPU and memory request next to the one Coral recommends.

The plugin reads the `Recommendation` objects (`recommendations.coral.zoorik.com`) that the Zoorik
agent keeps in the cluster. It reads them with your own Kubernetes permissions and sends nothing
anywhere. In a cluster without Coral, the Coral page says so and workload pages show nothing extra.
Savings, held nodes and the cluster score are in the Coral console.

## Build and install

You need Node.js 24 or later.

```sh
git clone https://github.com/getzoorik/headlamp.git
cd headlamp/coral
npm ci
npm run build
```

Headlamp loads a plugin from its plugins folder. Copy `dist/main.js` and `package.json` into a folder
named `coral` there, or run `npm run package` and extract the tarball into it. Headlamp's
[plugin documentation](https://headlamp.dev/docs/latest/development/plugins/) says where the folder is
for the desktop app and for Headlamp in a cluster.

## Contributing

Issues and pull requests are welcome. Our [contributing guide](https://github.com/getzoorik/.github/blob/main/CONTRIBUTING.md)
says how. Before you open a pull request, run the checks CI runs, in `coral/`:

```sh
npm ci
npm run lint
npm run tsc
npm run build
npm run package
```

## Security

Please report a vulnerability privately: use **Report a vulnerability** on this repository's
**Security** tab, or write to [founders@zoorik.com](mailto:founders@zoorik.com). Please do not open a
public issue. Our [security policy](https://github.com/getzoorik/.github/blob/main/SECURITY.md) has the
details.

## License

Apache-2.0, see [LICENSE](LICENSE). Copyright 2026 Zoorik Private Limited.

---

<p align="center"><sub><a href="https://zoorik.com">zoorik.com</a> · <a href="https://zoorik.com/docs">Docs</a> · <a href="https://zoorik.com/security">Security</a> · <a href="https://github.com/getzoorik">Zoorik on GitHub</a></sub></p>
<p align="center"><sub>The Zoorik, Coral and Amoeba names and logos belong to Zoorik Private Limited. Headlamp is a Kubernetes SIG UI project.</sub></p>
