import {
  registerDetailsViewSection,
  registerRoute,
  registerSidebarEntry,
} from '@kinvolk/headlamp-plugin/lib';
import { WORKLOAD_KINDS } from './recommendation';
import { RecommendationList } from './RecommendationList';
import { WorkloadSection } from './WorkloadSection';

registerSidebarEntry({
  parent: null,
  name: 'coral',
  label: 'Coral',
  url: '/coral',
  icon: 'mdi:chart-timeline-variant',
});

registerRoute({
  path: '/coral',
  sidebar: 'coral',
  name: 'Coral',
  exact: true,
  component: () => <RecommendationList />,
});

registerDetailsViewSection(({ resource }) => {
  if (!resource || !WORKLOAD_KINDS.has(resource.kind)) {
    return null;
  }
  return <WorkloadSection resource={resource} />;
});
