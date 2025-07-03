import { cn } from '@/shared/lib/utils';

interface ProjectCircularProgressIndicatorProps {
  progress: number;
  label: string;
  size: number;
  strokeWidth: number;
  backgroundColor: string;
  progressColor: string;
  trackColor: string;
  className?: string;
}

const ProjectCircularProgressIndicator = ({
  progress = 50,
  label = 'P1',
  size = 120, // Diameter of the circle
  strokeWidth = 12, // Thickness of the circle
  backgroundColor = '#374151',
  progressColor = '#ffffff',
  trackColor = '#94a3b8',
  className,
}: ProjectCircularProgressIndicatorProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div
      className={cn('relative flex items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        className="absolute top-0 left-0 transform rotate-[-90deg]"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={progressColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>

      <div
        className="flex items-center justify-center rounded-full p-2"
        style={{
          width: size,
          height: size,
          backgroundColor: backgroundColor,
        }}
      >
        <span className="text-white text-lg font-bold text-48px">{label}</span>
      </div>
    </div>
  );
};

export default ProjectCircularProgressIndicator;
