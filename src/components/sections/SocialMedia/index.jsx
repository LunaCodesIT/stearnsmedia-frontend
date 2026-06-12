import { useSocialMedia } from '@/hooks/useSocialMedia';
import { ServiceSection } from '@/components/ui/ServiceSection';
import { SectionModel } from '@/components/three/SectionModel';

export function SocialMedia() {
  const { title, paragraphs, loading } = useSocialMedia();

  return (
    <ServiceSection
      id="social-media-section"
      label="Social Media Marketing"
      title={title || 'Social Media'}
      paragraphs={paragraphs}
      loading={loading}
      reverse
      heroBackground
    >
      <SectionModel
        src="/models/Facebook_Logo.glb"
        fit={1.5}
        rotation={[0.1, 0.3, 0]}
        className="h-[300px] sm:h-[380px] lg:h-[480px]"
      />
    </ServiceSection>
  );
}
