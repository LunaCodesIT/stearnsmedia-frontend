import { useGraphicDesign } from '@/hooks/useGraphicDesign';
import { ServiceSection } from '@/components/ui/ServiceSection';
import { SectionModel } from '@/components/three/SectionModel';

export function GraphicDesign() {
  const { title, paragraphs, loading } = useGraphicDesign();

  return (
    <ServiceSection
      id="graphic-design-section"
      label="Creative Studio"
      title={title || 'Graphic Design'}
      paragraphs={paragraphs}
      loading={loading}
    >
      {/* Two models side by side */}
      <div className="grid grid-cols-2 gap-4">
        <SectionModel
          src="/models/Graphics_Tablet.fbx"
          className="h-[220px] sm:h-[280px] lg:h-[400px]"
        />
        <SectionModel
          src="/models/Graphics_Card_Design.fbx"
          rotation={[0.1, 0.4, 0]}
          className="h-[220px] sm:h-[280px] lg:h-[400px]"
        />
      </div>
    </ServiceSection>
  );
}
