import { makeCustomResourceClass } from '@kinvolk/headlamp-plugin/lib/Crd';

export const Recommendation = makeCustomResourceClass({
  apiInfo: [{ group: 'coral.zoorik.com', version: 'v1' }],
  kind: 'Recommendation',
  pluralName: 'recommendations',
  singularName: 'recommendation',
  isNamespaced: true,
});

export type Quantity = string | number;

export interface ContainerRecommendation {
  containerName: string;
  requests?: { cpu?: Quantity; memory?: Quantity };
}

export interface RecommendationSpec {
  targetRef?: { apiVersion?: string; kind?: string; name?: string };
  policyName?: string;
  applyPolicy?: { readonly?: boolean; reason?: string; frozen?: boolean };
  excludedContainers?: string[];
  recommendation?: ContainerRecommendation[];
}

export interface RecommendationStatus {
  totalPods?: number;
  matchingPods?: number;
  rollout?: { phase?: string; blockedReason?: string };
  hpa?: { state?: string; name?: string; reason?: string };
}

export interface RecommendationData {
  metadata: { name: string; namespace?: string; uid?: string };
  spec?: RecommendationSpec;
  status?: RecommendationStatus;
}

export const WORKLOAD_KINDS = new Set([
  'Deployment',
  'StatefulSet',
  'DaemonSet',
  'Job',
  'CronJob',
  'Rollout',
]);

const READONLY_REASONS: Record<string, string> = {
  AUTOMATION_OFF: 'Automatic optimization is off',
  READONLY_POLICY: 'Its policy is readonly',
  PLATFORM_MANAGED: 'Managed by the cluster platform',
  ENGINE_SWITCHED_OFF: 'Workload optimization is off for this cluster',
  WAITING_FOR_CONFIDENCE: 'Waiting for enough usage history',
  UNSUPPORTED: 'Coral does not support this workload',
};

const ROLLOUT_PHASES: Record<string, string> = {
  IDLE: 'Nothing to change',
  IN_PLACE: 'Resizing pods in place',
  EVICTING: 'Replacing pods one at a time',
  SURGING: 'Adding a temporary pod',
  ZERO_DOWNTIME: 'Replacing the pod with no downtime',
  PENDING_RESTART: 'Waiting for the next restart',
  WAITING: 'Waiting',
  BLOCKED: 'Blocked',
  UNSUPPORTED: 'Not supported',
  READONLY: 'Read only',
};

const BLOCKED_REASONS: Record<string, string> = {
  DISRUPTION_BUDGET: 'Its PodDisruptionBudget allows no disruption now',
  SINGLE_REPLICA_STATEFUL: 'A single-replica StatefulSet changes only at its next restart',
  JOB_RUN_IN_PROGRESS: 'A Job run is in progress',
  DO_NOT_DISRUPT: 'Its pods are marked do-not-disrupt',
  WEBHOOK_NOT_EFFECTIVE: 'The Coral webhook cannot be reached',
  EVICTION_NOT_GRANTED: 'Coral has no permission to evict pods',
  CIRCUIT_BREAKER_OPEN: 'Paused after repeated failures',
  NO_OUTAGE_FREE_PATH: 'It cannot change without an outage, so it waits for its next restart',
};

export function sentence(code: string): string {
  const words = code.toLowerCase().split('_').join(' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function lookup(table: Record<string, string>, code?: string): string | undefined {
  if (!code) {
    return undefined;
  }
  return table[code] ?? sentence(code);
}

export function modeText(spec?: RecommendationSpec): string {
  if (!spec?.applyPolicy) {
    return 'Not available';
  }
  if (!spec.applyPolicy.readonly) {
    return 'Automatic';
  }
  return `Read only: ${lookup(READONLY_REASONS, spec.applyPolicy.reason) ?? 'no reason given'}`;
}

export function rolloutText(status?: RecommendationStatus): string {
  const phase = lookup(ROLLOUT_PHASES, status?.rollout?.phase);
  const blocked = lookup(BLOCKED_REASONS, status?.rollout?.blockedReason);
  if (!phase && !blocked) {
    return 'Not reported yet';
  }
  return [phase, blocked].filter(Boolean).join(': ');
}

export function podsText(status?: RecommendationStatus): string {
  if (status?.totalPods === undefined || status?.matchingPods === undefined) {
    return 'Not reported yet';
  }
  return `${status.matchingPods} of ${status.totalPods}`;
}

export function targetText(spec?: RecommendationSpec): string {
  const kind = spec?.targetRef?.kind;
  const name = spec?.targetRef?.name;
  if (!kind || !name) {
    return 'Not available';
  }
  return `${kind}/${name}`;
}
