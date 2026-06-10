import { useSeo } from '@/hooks/useSeo';
import { ServiceSection } from '@/components/ui/ServiceSection';
import { SectionModel } from '@/components/three/SectionModel';

export function Seo() {
  const { title, paragraphs, loading } = useSeo();

  return (
    <ServiceSection
      id="seo-section"
      label="Search Engine Optimisation"
      title={title || 'SEO'}
      paragraphs={paragraphs}
      loading={loading}
      reverse
    >
      <SectionModel
        src="/models/SEO.glb"
        fit={1.7}
        rotation={[0.08, -0.4, 0]}
        yOffset={0.09}
        className="h-[300px] sm:h-[380px] lg:h-[480px]"
      />
    </ServiceSection>
  );
}
