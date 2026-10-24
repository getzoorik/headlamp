import {
  Loader,
  NameValueTable,
  SectionBox,
  SimpleTable,
} from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import {
  modeText,
  podsText,
  Quantity,
  Recommendation,
  RecommendationData,
  rolloutText,
} from './recommendation';
import { loadError } from './states';

interface Container {
  name: string;
  resources?: { requests?: { cpu?: Quantity; memory?: Quantity } };
}

interface WorkloadData {
  kind: string;
  metadata: { name: string; namespace?: string };
  spec?: {
    template?: { spec?: { containers?: Container[] } };
    jobTemplate?: { spec?: { template?: { spec?: { containers?: Container[] } } } };
  };
}

interface Row {
  name: string;
  cpuNow?: Quantity;
  cpuRecommended?: Quantity;
  memoryNow?: Quantity;
  memoryRecommended?: Quantity;
  excluded: boolean;
}

function templateContainers(workload: WorkloadData): Container[] {
  return (
    workload.spec?.template?.spec?.containers ??
    workload.spec?.jobTemplate?.spec?.template?.spec?.containers ??
    []
  );
}

function shown(value: Quantity | undefined, missing: string): string {
  if (value === undefined || value === null || value === '') {
    return missing;
  }
  return String(value);
}

function rows(workload: WorkloadData, recommendation: RecommendationData): Row[] {
  const recommended = new Map(
    (recommendation.spec?.recommendation ?? []).map(entry => [entry.containerName, entry.requests])
  );
  const excluded = new Set(recommendation.spec?.excludedContainers ?? []);
  return templateContainers(workload).map(container => ({
    name: container.name,
    cpuNow: container.resources?.requests?.cpu,
    memoryNow: container.resources?.requests?.memory,
    cpuRecommended: recommended.get(container.name)?.cpu,
    memoryRecommended: recommended.get(container.name)?.memory,
    excluded: excluded.has(container.name),
  }));
}

function recommendedText(row: Row, value?: Quantity): string {
  if (row.excluded) {
    return 'Excluded';
  }
  return shown(value, 'Not available');
}

export function WorkloadSection({ resource }: { resource: { jsonData: WorkloadData } }) {
  const workload = resource.jsonData;
  const [items, error] = Recommendation.useList({ namespace: workload.metadata.namespace });

  if (error?.status === 404) {
    return null;
  }
  if (!items && !error) {
    return <Loader title="Reading the Coral recommendation" />;
  }
  if (error) {
    return <SectionBox title="Coral">{loadError(error)}</SectionBox>;
  }

  const recommendation = (items ?? [])
    .map(item => item.jsonData as RecommendationData)
    .find(
      item =>
        item.spec?.targetRef?.kind === workload.kind &&
        item.spec?.targetRef?.name === workload.metadata.name
    );

  if (!recommendation) {
    return (
      <SectionBox title="Coral">
        Coral has no recommendation for this {workload.kind} yet.
      </SectionBox>
    );
  }

  return (
    <SectionBox title="Coral">
      <NameValueTable
        rows={[
          { name: 'Policy', value: recommendation.spec?.policyName ?? 'Not available' },
          { name: 'Mode', value: modeText(recommendation.spec) },
          { name: 'Pods at the new size', value: podsText(recommendation.status) },
          { name: 'Rollout', value: rolloutText(recommendation.status) },
        ]}
      />
      <SimpleTable
        columns={[
          { label: 'Container', getter: (row: Row) => row.name },
          { label: 'CPU request now', getter: (row: Row) => shown(row.cpuNow, 'Not set') },
          {
            label: 'CPU recommended',
            getter: (row: Row) => recommendedText(row, row.cpuRecommended),
          },
          { label: 'Memory request now', getter: (row: Row) => shown(row.memoryNow, 'Not set') },
          {
            label: 'Memory recommended',
            getter: (row: Row) => recommendedText(row, row.memoryRecommended),
          },
        ]}
        data={rows(workload, recommendation)}
      />
    </SectionBox>
  );
}
