# Coral for Headlamp

Shows [Zoorik Coral](https://zoorik.com/coral)'s recommendations inside [Headlamp](https://headlamp.dev):
a **Coral** page in the sidebar, and a **Coral** section on each workload's page with every container's
CPU and memory request next to the one Coral recommends.

It reads the `Recommendation` objects (`recommendations.coral.zoorik.com`) the Zoorik agent keeps in the
cluster, with your own Kubernetes permissions. Your account needs `list` on them.

See the [repository README](../README.md) to build and install it.
